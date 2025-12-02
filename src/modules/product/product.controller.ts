import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ParseFilePipe, UsePipes, ValidationPipe, UploadedFiles, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductParamsDto, UpdateProductAttachmentDto, UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/multer';
import { endpoint } from './product.authorization';
import { Auth, GetAllDto, GetAllResponse, IProduct, IResponse, RoleEnum, StorageEnum, successResponse, User } from 'src/common';
import { type UserDocument } from 'src/DB';
import { ProductResponse } from './entities/product.entity';


@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @UseInterceptors(FilesInterceptor(
    "attachment",
    5,
    cloudFileUpload({ validation: fileValidation.image, storageApproach: StorageEnum.disk })))
  @Auth(endpoint.Create)
  @Post()
  async createProduct(
    @UploadedFiles(ParseFilePipe) files: Express.Multer.File[],
    @User() user: UserDocument,
    @Body() createProductDto: CreateProductDto
  ): Promise<IResponse<ProductResponse>> {

    const product = await this.productService.createProduct(createProductDto, files, user);
    return successResponse<ProductResponse>({ status: 201, data: { product } })
  }




  @Auth(endpoint.Create)
  @Patch(':productId')
  async update(
    @Param() Params: ProductParamsDto,
    @Body() updateProductDto: UpdateProductDto,
    @User() user: UserDocument
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.updateProduct(Params.productId, updateProductDto, user);
    return successResponse<ProductResponse>({ data: { product } })

  }


  @UseInterceptors(FilesInterceptor(
    "attachments",
    5,
    cloudFileUpload({
      validation: fileValidation.image,
      storageApproach: StorageEnum.disk,
    })))


  @Auth(endpoint.Create)
  @Patch(':productId/attachment')
  async updateAttachment(
    @Param() Params: ProductParamsDto,
    @Body() updateProductAttachmentDto: UpdateProductAttachmentDto,
    @User() user: UserDocument,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: false })) files?: Express.Multer.File[]
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.updateAttachment(Params.productId, updateProductAttachmentDto, user, files);
    return successResponse<ProductResponse>({ data: { product } })
  }


  @Get()
  findAllProduct(
    @Query() query: GetAllDto,
  ) {
    return this.productService.findAllProduct(query);
  }


  @Auth(endpoint.Create)
  @Delete(':productId/freeze')
  async freezedProduct(
    @Param() params: ProductParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {

    await this.productService.freezedProduct(params.productId, user);
    return successResponse<ProductResponse>()
  }


  @Auth(endpoint.Create)
  @Patch(':productId/restore')
  async restoreProduct(
    @Param() params: ProductParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    const product =
      await this.productService.restoreProduct(params.productId, user);
    return successResponse<ProductResponse>({ data: { product } })
  }




  //HD
  @Auth(endpoint.Create)
  @Delete(':productId')
  async removeProduct(
    @User() user: UserDocument,
    @Param() params: ProductParamsDto
  ) {

    await this.productService.removeProduct(params.productId, user);
    return successResponse()

  }





  @Get()
  async findAll(
    @Query() query: GetAllDto
  ): Promise<IResponse<GetAllResponse<IProduct>>> {
    const result = await this.productService.findAllProduct(query);
    return successResponse<GetAllResponse<IProduct>>({ data: { result } })


  }

  @Auth(endpoint.Create)
  @Get('/archive')
  async findAllArchives(
    @Query() query: GetAllDto
  ): Promise<IResponse<GetAllResponse<IProduct>>> {
    const result = await this.productService.findAllProduct(query, true);
    return successResponse<GetAllResponse<IProduct>>({ data: { result } })


  }




  @Get(':productId')
  async findOneProduct(
    @Param() params: ProductParamsDto) {
    const product = await this.productService.findOneProduct(params.productId);
    return successResponse<ProductResponse>({ data: { product } })

  }

  @Auth(endpoint.Create)
  @Get(':productId/archive')
  async findOneArchive(
    @Param() params: ProductParamsDto) {
    const product = await this.productService.findOneProduct(params.productId, true);
    return successResponse<ProductResponse>({ data: { product } })

  }

  @Auth([RoleEnum.user])
  @Patch(":productId/add-to-wishList")
  async addToWishList(
    @User() user: UserDocument,
    @Param() params: ProductParamsDto,

  ): Promise<IResponse<ProductResponse>> {

    const product = await this.productService.addToWishList(params.productId, user)
    return successResponse<ProductResponse>({ data: { product } })

  }


  @Auth([RoleEnum.user])
  @Patch(":productId/remove-from-wishList")
  async removeToWishList(
    @User() user: UserDocument,
    @Param() params: ProductParamsDto,

  ): Promise<IResponse> {

    await this.productService.removeFromWishList(params.productId, user)
    return successResponse()

  }


}




