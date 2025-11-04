import {
  Controller,
  UsePipes,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  ParseFilePipe,
  UseInterceptors,
  Patch,
  ValidationPipe,
  Query
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { IBrand, IResponse, successResponse, User } from 'src/common';
import { Brand, BrandDocument, type UserDocument } from 'src/DB';
import { BrandResponse, GetAllResponse } from './entities/brand.entity';
import { endpoint } from './authorization.module';
import { Auth } from 'src/common/decorators/auth.decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/multer';
import { BrandParamsDto, GetAllDto, UpdateBrandDto } from './dto/update-brand.dto';


@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('brand')
export class BrandController {
  constructor(
    private readonly brandService: BrandService
  ) { }

  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudFileUpload({ validation: fileValidation.image })
    )
  )
  @Auth(endpoint.CreateBrand)
  @Post()
  async create(
    @User() user: UserDocument,   // to get info about user login
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File

  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.createBrand(createBrandDto, file, user);
    return successResponse<BrandResponse>({ status: 201, data: { brand } })
  }


  @Auth(endpoint.CreateBrand)
  @Patch(':brandId')
  async updateBrand(
    @Param() params: BrandParamsDto,
    @Body() updateBrandDto: UpdateBrandDto,
    @User() user: UserDocument,
  ): Promise<IResponse<BrandResponse>> {

    const brand = await this.brandService.updateBrand(params.brandId, updateBrandDto, user);
    return successResponse<BrandResponse>({ data: { brand } })
  }


  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudFileUpload({ validation: fileValidation.image })
    )
  )
  @Auth(endpoint.CreateBrand)
  @Patch(':brandId/attachment')
  async updateAttachment(
    @Param() params: BrandParamsDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @Body() updateBrandDto: UpdateBrandDto,
    @User() user: UserDocument,
  ): Promise<IResponse<BrandResponse>> {

    const brand = await this.brandService.updateAttachment(params.brandId, file, user);
    return successResponse<BrandResponse>({ data: { brand } })
  }


  @Auth(endpoint.CreateBrand)
  @Delete(':brandId/freeze')
  async freezedBrand(
    @Param() params: BrandParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {

    await this.brandService.freezedBrand(params.brandId, user);
    return successResponse<BrandResponse>()
  }


  @Auth(endpoint.CreateBrand)
  @Patch(':brandId/restore')
  async restoreBrand(
    @Param() params: BrandParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    const brand =
      await this.brandService.restoreBrand(params.brandId, user);
    return successResponse<BrandResponse>({ data: { brand } })
  }




  //HD
  @Auth(endpoint.CreateBrand)
  @Delete(':brandId')
  async removeBrand(
    @User() user: UserDocument,
    @Param() params: BrandParamsDto
  ) {

    await this.brandService.removeBrand(params.brandId, user);
    return successResponse()

  }








  @Get()
  async findAllBrand(
    @Query() query: GetAllDto
  ) {
    const result = await this.brandService.findAllBrand(query);
    return successResponse<GetAllResponse>({ data: { result } })


  }

  @Auth(endpoint.CreateBrand)
  @Get('/archive')
  async findAllArchives(
    @Query() query: GetAllDto
  ) {
    const result = await this.brandService.findAllBrand(query);
    return successResponse<GetAllResponse>({ data: { result } })


  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(+id);
  }


}

