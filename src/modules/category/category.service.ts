import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import {UpdateCategoryDto } from './dto/update-category.dto';
import { Types } from 'mongoose';
import { BrandRepository, CategoryDocument, CategoryRepository, Lean, UserDocument } from 'src/DB';
import { FolderEnum, GetAllDto, S3Service } from 'src/common';
import { randomUUID } from 'crypto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly s3Service: S3Service,

  ) { }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
    file: Express.Multer.File,
    user: UserDocument
  ): Promise<CategoryDocument> {
    const { name } = createCategoryDto;

    const checkDuplicate = await this.categoryRepository.findOne({
      filter: {
        name,
        categoryId: false
      }
    })
    if (checkDuplicate) {
      throw new ConflictException(checkDuplicate.freezedAt
        ? "Duplicated with archived Category"
        : "Duplicated Category name",
      )
    }

    const brands: Types.ObjectId[] = [... new Set(createCategoryDto.brands || [])];

    if (
      brands &&
      (await this.brandRepository.find({ filter: { _id: { $in: brands } } }))
        .length != brands.length
    ) {
      throw new NotFoundException('some of mentioned brand are not exist')

    }

    let assetFolderId: string = randomUUID()
    const image: string = await this.s3Service.uploadFile({
      file,
      path: `${FolderEnum.Category}/${assetFolderId}`
    })
    const [category] = await this.categoryRepository.create({
      data: [{
        ...createCategoryDto,  //inside it (name ,discretion)
        assetFolderId,
        image,
        createdBy: user._id,
        brands: brands.map(brand => {
          return Types.ObjectId.createFromHexString(
            brand as unknown as string,
          )
        })
      }]
    })

    if (!category) {
      await this.s3Service.deleteFile({ Key: image });
      throw new BadRequestException("fail to crate this Category resources")
    }

    return category;
  }



  async updateCategory(
    CategoryId: Types.ObjectId,
    updateCategoryDto: UpdateCategoryDto,
    user: UserDocument
  ): Promise<CategoryDocument | Lean<CategoryDocument>> {


    if (updateCategoryDto.name && await this.categoryRepository.findOne({
      filter: {
        name: updateCategoryDto.name,
        _id: { $ne: CategoryId }

      }

    })) {
      throw new ConflictException("Duplicated Category name")
    }


    const brands: Types.ObjectId[] = [... new Set(updateCategoryDto.brands || [])];

    if (
      brands &&
      (await this.brandRepository.find({ filter: { _id: { $in: brands } } }))
        .length != brands.length
    ) {
      throw new NotFoundException('some of mentioned brand are not exist')

    }


    const removedBrands = updateCategoryDto.removedBrands ?? [];
    delete updateCategoryDto.removedBrands;

    const category = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: CategoryId },
      update: [
        {
          $set: {
            ...updateCategoryDto,
            updatedBy: user._id,

            brands: {
              $setUnion: [
                {
                  $setDifference: [
                    '$brands',
                    (removedBrands || []).map((brand) => {
                      return Types.ObjectId.createFromHexString(brand as unknown as string)

                    }),

                  ]
                },
                (brands || []).map((brands) => {
                  return Types.ObjectId.createFromHexString(
                    brands as unknown as string
                  )
                })

              ]
            }
          }
        }

      ]
    })



    if (!category) {
      throw new NotFoundException("fail to fiend matching Category instance")
    }

    return category;
  }




  async updateAttachment(
    CategoryId: Types.ObjectId,
    file: Express.Multer.File,
    user: UserDocument
  ): Promise<CategoryDocument | Lean<CategoryDocument>> {

    const Category = await this.categoryRepository.findOne({
      filter: {
        _id: CategoryId
      }
    })
    if (!Category) {
      throw new NotFoundException("fail to fiend matching Category instance")
    }

    const image = await this.s3Service.uploadFile({
      file,
      path: `${FolderEnum.Category}/${Category.assetFolderId}`
    });

    const updatedCategory = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: CategoryId },
      update: {
        image,
        updatedBy: user._id

      },
    })

    if (!updatedCategory) {
      await this.s3Service.deleteFile({ Key: image })
      throw new NotFoundException("fail to fiend matching Category instance")
    }

    await this.s3Service.deleteFile({ Key: Category.image })
    Category.image = image;
    return updatedCategory;
  }



  async freezedCategory(
    CategoryId: Types.ObjectId,
    user: UserDocument
  ): Promise<string> {

    const Category = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: CategoryId },
      update: {
        freezedAt: new Date(),
        $unset: { restoredAt: true },
        updatedBy: user._id

      },
      options: {
        new: false
      },
    })

    if (!Category) {
      throw new NotFoundException("fail to fiend matching Category instance")
    }

    return `Done`;
  }




  async restoreCategory(
    CategoryId: Types.ObjectId,
    user: UserDocument
  ): Promise<CategoryDocument | Lean<CategoryDocument>> {

    const Category = await this.categoryRepository.findOneAndUpdate({
      filter: {
        _id: CategoryId,
        paranoId: false,
        freezedAt: { $exists: true },
      },
      update: {
        restoredAt: Date.now(),
        $unset: { freezedAt: true },
        updatedBy: user._id
      },
      options: {
        new: false
      },
    })

    if (!Category) {
      throw new NotFoundException("fail to fiend matching Category instance")
    }

    return Category;
  }




  async removeCategory(
    CategoryId: Types.ObjectId,
    user: UserDocument
  ): Promise<string> {
    const Category = await this.categoryRepository.findOneAndDelete({
      filter: { _id: CategoryId, paranoId: false, freezedAt: { $exists: true } },
    })
    if (!Category) {
      throw new NotFoundException('fail to fiend matching Category instance ')
    }

    await this.s3Service.deleteFile({ Key: Category.image })
    return `Done`
  }



  async findAllCategory(
    data: GetAllDto,
    archive: boolean = false
  ): Promise<{
    docsCount?: number,
    limit?: number,
    pages?: number,
    curettagePage: number | undefined,
    result: CategoryDocument[] | Lean<CategoryDocument>[]
  }> {
    const { page, size, search } = data
    const Category = await this.categoryRepository.paginate({
      filter: {
        ...(search ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        } : {}),
        ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {})

      },
      page,
      size,


    })
    return Category;
  }





  async findOne(
    CategoryId: Types.ObjectId,
    archive: boolean = false
  ) {
    const category = await this.categoryRepository.findOne({
      filter: {
        _id: CategoryId,

        ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {})
      }
    })
    if (!category) {
      throw new NotFoundException('Fail to find matching Category instance ')
    }
    return category
  }

}
