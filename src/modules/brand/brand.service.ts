import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BrandDocument, BrandRepository } from 'src/DB';
import type { Lean, UserDocument } from 'src/DB';
import { FolderEnum, S3Service } from 'src/common';
import { BrandParamsDto, GetAllDto, UpdateBrandDto } from './dto/update-brand.dto';
import { Types } from 'mongoose';

// import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly s3Service: S3Service

  ) { }

  async createBrand(
    createBrandDto: CreateBrandDto,
    file: Express.Multer.File,
    user: UserDocument
  ): Promise<BrandDocument> {
    const { name, slogan } = createBrandDto;

    const checkDuplicate = await this.brandRepository.findOne({
      filter: {
        name,
        paranoId: false
      }
    })
    if (checkDuplicate) {
      throw new ConflictException(checkDuplicate.freezedAt
        ? "Duplicated with archived brand"
        : "Duplicated brand name",
      )
    }
    const image: string = await this.s3Service.uploadFile({
      file,
      path: `Brand`
    })
    const [brand] = await this.brandRepository.create({
      data: [{ name, slogan, image, createdBy: user._id }]
    })

    if (!brand) {
      await this.s3Service.deleteFile({ Key: image });
      throw new BadRequestException("fail to crate this brand resources")
    }

    return brand;
  }



  async updateBrand(
    brandId: Types.ObjectId,
    updateBrandDto: UpdateBrandDto,
    user: UserDocument
  ): Promise<BrandDocument | Lean<BrandDocument>> {


    if (updateBrandDto.name && await this.brandRepository.findOne({
      filter: {
        name: updateBrandDto.name
      }

    }))
      throw new ConflictException("Duplicated brand name")

    const brand = await this.brandRepository.findOneAndUpdate({
      filter: { _id: brandId },
      update: {
        ...updateBrandDto,
        createdBy: user._id
      }
    })
    if (!brand) {
      throw new NotFoundException("fail to fiend matching brand instance")
    }

    return brand;
  }


  async updateAttachment(
    brandId: Types.ObjectId,
    file: Express.Multer.File,
    user: UserDocument
  ): Promise<BrandDocument | Lean<BrandDocument>> {

    const image = await this.s3Service.uploadFile({
      file,
      path: FolderEnum.Brand
    });

    const brand = await this.brandRepository.findOneAndUpdate({
      filter: { _id: brandId },
      update: {
        image,
        updatedBy: user._id

      },
      options: {
        new: false
      },
    })

    if (!brand) {
      await this.s3Service.deleteFile({ Key: image })
      throw new NotFoundException("fail to fiend matching brand instance")
    }

    await this.s3Service.deleteFile({ Key: brand.image })
    brand.image = image
    return brand;
  }



  async freezedBrand(
    brandId: Types.ObjectId,
    user: UserDocument
  ): Promise<string> {

    const brand = await this.brandRepository.findOneAndUpdate({
      filter: { _id: brandId },
      update: {
        freezedAt: new Date(),
        $unset: { restoredAt: true },
        updatedBy: user._id

      },
      options: {
        new: false
      },
    })

    if (!brand) {
      throw new NotFoundException("fail to fiend matching brand instance")
    }

    return `Done`;
  }




  async restoreBrand(
    brandId: Types.ObjectId,
    user: UserDocument
  ): Promise<BrandDocument | Lean<BrandDocument>> {

    const brand = await this.brandRepository.findOneAndUpdate({
      filter: {
        _id: brandId,
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

    if (!brand) {
      throw new NotFoundException("fail to fiend matching brand instance")
    }

    return brand;
  }




  async removeBrand(
    brandId: Types.ObjectId,
    user: UserDocument
  ): Promise<string> {
    const brand = await this.brandRepository.findOneAndDelete({
      filter: { _id: brandId, paranoId: false, freezedAt: { $exists: true } },
    })
    if (!brand) {
      throw new NotFoundException('fail to fiend matching brand instance ')
    }

    await this.s3Service.deleteFile({ Key: brand.image })
    return `Done`
  }













  async findAllBrand(
    data: GetAllDto,
    archive: boolean = false
  ): Promise<{
    docsCount?: number,
    limit?: number,
    pages?: number,
    curettagePage: number | undefined,
    result: BrandDocument[] | Lean<BrandDocument>[]
  }> {
    const { page, size, search } = data
    const brand = await this.brandRepository.paginate({
      filter: {
        ...(search ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } },
            { slogan: { $regex: search, $options: 'i' } }
          ]
        } : {}),
        ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {})

      },
      page,
      size,


    })
    return brand;
  }











  findOne(id: number) {
    return `This action returns a #${id} brand`;
  }

  remove(id: number) {
    return `This action removes a #${id} brand`;
  }
}
