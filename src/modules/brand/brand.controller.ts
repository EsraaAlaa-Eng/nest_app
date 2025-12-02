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
import { GetAllDto, GetAllResponse, IBrand, IResponse, successResponse, User } from 'src/common';
import { type UserDocument } from 'src/DB';
import { BrandResponse } from './entities/brand.entity';
import { endpoint } from './brand.authorization';
import { Auth } from 'src/common/decorators/auth.decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/multer';
import { BrandParamsDto, UpdateBrandDto } from './dto/update-brand.dto';


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
  @Auth(endpoint.Create)
  @Post()
  async create(
    @User() user: UserDocument,   // to get info about user login
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File

  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.createBrand(createBrandDto, file, user);
    return successResponse<BrandResponse>({ status: 201, data: { brand } })
  }


  @Auth(endpoint.Create)
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
  @Auth(endpoint.Create)
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


  @Auth(endpoint.Create)
  @Delete(':brandId/freeze')
  async freezedBrand(
    @Param() params: BrandParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {

    await this.brandService.freezedBrand(params.brandId, user);
    return successResponse<BrandResponse>()
  }


  @Auth(endpoint.Create)
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
  @Auth(endpoint.Create)
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
  ): Promise<IResponse<GetAllResponse<IBrand>>> {
    const result = await this.brandService.findAllBrand(query);
    return successResponse<GetAllResponse<IBrand>>({ data: { result } })


  }

  @Auth(endpoint.Create)
  @Get('/archive')
  async findAllArchives(
    @Query() query: GetAllDto
  ): Promise<IResponse<GetAllResponse<IBrand>>> {
    const result = await this.brandService.findAllBrand(query, true);
    return successResponse<GetAllResponse<IBrand>>({ data: { result } })


  }




  @Get(':brandId')
  async findOne(
    @Param() params: BrandParamsDto) {
    const brand = await this.brandService.findOne(params.brandId);
    return successResponse<BrandResponse>({ data: { brand } })

  }

  @Auth(endpoint.Create)
  @Get(':brandId/archive')
  async findOneArchive(
    @Param() params: BrandParamsDto) {
    const brand = await this.brandService.findOne(params.brandId, true);
    return successResponse<BrandResponse>({ data: { brand } })

  }


}

