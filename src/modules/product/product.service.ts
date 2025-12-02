import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductAttachmentDto, UpdateProductDto } from './dto/update-product.dto';
import { BrandRepository, CategoryDocument, CategoryRepository, Lean, ProductDocument, UserDocument, UserRepository } from 'src/DB';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { FolderEnum, GetAllDto, S3Service } from 'src/common';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';

@Injectable()
export class ProductService {

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly brandRepository: BrandRepository,
    private readonly userRepository: UserRepository,

    private readonly categoryRepository: CategoryRepository,
    private readonly s3Service: S3Service,

  ) { }

  async createProduct(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],

    user: UserDocument
  ): Promise<ProductDocument> {
    const category = await this.categoryRepository.findOne({
      filter: {
        _id: createProductDto.category
      }
    })
    if (!category) {
      throw new NotFoundException("fail to find matching category instance")
    }

    const brand = await this.brandRepository.findOne({
      filter: {
        _id: createProductDto.brand
      }
    })
    console.log(brand);
    if (!brand) {
      throw new NotFoundException("fail to find matching brand instance")
    }

    createProductDto.brand = brand._id
    const salePrice = createProductDto.mainPrice - createProductDto.mainPrice * ((createProductDto.discountPercent ?? 0) / 100)

    const assetFolderId = randomUUID();
    let images;
    images = await this.s3Service.uploadFiles({
      files,
      path: `${FolderEnum.Category}/${createProductDto.category}/${FolderEnum.Product}/${assetFolderId}`
    })

    const [product] = await this.productRepository.create({
      data: [
        {

          // category: category._id,
          // brand: brand._id,
          // name,
          // description,
          // discountPercent,
          // mainPrice,
          // mainPrice - mainPrice * ((discountPercent || 0) / 100),
          // stock,

          ...createProductDto,
          assetFolderId,
          images,
          salePrice,
          createdBy: user._id,
        }
      ]
    });
    if (!product) {
      throw new BadRequestException("fail to create this product instance")
    }

    return product;
  }



  async updateProduct(
    productId: Types.ObjectId,
    updateProductDto: UpdateProductDto,
    user: UserDocument
  ): Promise<ProductDocument> {
    const product = await this.productRepository.findOne({
      filter: { _id: productId }
    }) as ProductDocument | null
    if (!product) {
      throw new NotFoundException("fail to find matching product instance")
    }

    if (updateProductDto.category) {
      const category = await this.categoryRepository.findOne({
        filter: {
          _id: updateProductDto.category
        }
      })
      if (!category) {
        throw new NotFoundException("fail to find matching category instance")
      }
    }

    if (updateProductDto.brand) {
      const brand = await this.productRepository.findOne({
        filter: {
          _id: updateProductDto.brand
        }
      })
      if (!brand) {
        throw new NotFoundException("fail to find matching brand instance")
      }

    }
    let salePrice = product.salePrice;
    if (updateProductDto.mainPrice || updateProductDto.discountPercent) {
      const mainPrice = updateProductDto.mainPrice ?? product.mainPrice;
      const discountPercent = updateProductDto.discountPercent ?? product.discountPercent;
      const finalPrice = mainPrice - (mainPrice * (discountPercent / 100));
      salePrice = finalPrice > 0 ? finalPrice : 1

    }

    const updatedProduct = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update: {
        ...updateProductDto,
        salePrice,
        updatedBy: user._id,
      }
    }) as ProductDocument | null


    if (!updatedProduct) {
      throw new BadRequestException("fail to update this product instance")
    }

    return updatedProduct;

  }




  async updateAttachment(
    productId: Types.ObjectId,
    updateProductAttachmentDto: UpdateProductAttachmentDto,
    user: UserDocument,
    files?: Express.Multer.File[]
  ): Promise<ProductDocument | Lean<ProductDocument>> {


    const product = await this.productRepository.findOne({ filter: { _id: productId }, options: { populate: [{ path: "category" }] } })
    if (!product) {
      throw new NotFoundException("Fail to find matching product instance ")
    }
    const category = product.category as unknown as CategoryDocument;
    if (!category || !category.assetFolderId) {
      throw new BadRequestException("Product category is missing or invalid")
    }

    let attachments: string[] = []
    if (files?.length) {
      attachments = await this.s3Service.uploadFiles({
        files,
        path: `${FolderEnum.Category}/${(product.category as unknown as CategoryDocument).assetFolderId}/${FolderEnum.Product}/${product.assetFolderId}`
      })
    }

    const removedAttachments = [...new Set(updateProductAttachmentDto.removeAttachments)]



    const updatedProduct = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update: [
        {
          $set: {  //to push and pull by using (aggregation pipe line)
            updatedBy: user._id,
            images: {
              $setUnion: [
                {
                  $setDifference: [
                    '$images', //path
                    removedAttachments //remove element with out any duplication 
                  ]
                },
                attachments,
              ]
            },
          }
        }
      ],
      options: {
        new: false
      },
    })



    if (!updatedProduct) {
      await this.s3Service.deleteFiles({ urls: attachments })
      throw new BadRequestException("fail to update this product instance")
    }

    await this.s3Service.deleteFiles({ urls: removedAttachments })

    return updatedProduct;
  }


  async findAllProduct(
    data: GetAllDto,
    archived: boolean = false
  ): Promise<any> {
    const { page, size, search } = data;
    const product = await this.productRepository.paginate({
      filter: {
        ...(search ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } },
            { slogan: { $regex: search, $options: 'i' } }
          ]

        } : {}),
        ...(archived ? { productId: false, freezedAt: { $exists: true } } : {})
      },
      page,
      size
    })
    return product
  };



  async findOneProduct(
    brandId: Types.ObjectId,
    archive: boolean = false
  ) {
    const brand = await this.productRepository.findOne({
      filter: {
        _id: brandId,

        ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {})
      }
    })
    if (!brand) {
      throw new NotFoundException('Fail to find matching brand instance ')
    }
    return brand
  }

  async freezedProduct(
    brandId: Types.ObjectId,
    user: UserDocument
  ): Promise<string> {

    const brand = await this.productRepository.findOneAndUpdate({
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




  async restoreProduct(
    productId: Types.ObjectId,
    user: UserDocument
  ): Promise<ProductDocument | Lean<ProductDocument>> {

    const Product = await this.productRepository.findOneAndUpdate({
      filter: {
        _id: productId,
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

    if (!Product) {
      throw new NotFoundException("fail to fiend matching Product instance")
    }

    return Product;
  }

  async removeProduct(
    productId: Types.ObjectId,
    user: UserDocument
  ): Promise<string> {
    const product = await this.productRepository.findOneAndDelete({
      filter: {
        _id: productId,
        paranoId: false,
        freezedAt: { $exists: true }
      },
    })
    if (!product) {
      throw new NotFoundException('fail to fiend matching Product instance ')
    }

    await this.s3Service.deleteFiles({ urls: product.images })
    return `Done`
  }


  async addToWishList(
    productId: Types.ObjectId,
    user: UserDocument,
  ): Promise<ProductDocument | Lean<ProductDocument>> {

    const product = await this.productRepository.findOne({
      filter: {
        _id: productId,
      }
    });
    if (!product) {
      throw new NotFoundException("fail to find matching product instance")
    }


    await this.userRepository.updateOne({
      filter: {
        _id: user._id
      },
      update: {
        $addToSet: { wishList: product._id }
      }
    })

    console.log(user._id)
    console.log(product._id)



    return product;

  }

  async removeFromWishList(
    productId: Types.ObjectId,
    user: UserDocument,
  ): Promise<string> {

    await this.userRepository.updateOne({
      filter: {
        _id: user._id
      },
      update: {
        $pull: { wishList: Types.ObjectId.createFromHexString(productId as unknown as string) }
      }
    })
    return 'Done';

  }
}

