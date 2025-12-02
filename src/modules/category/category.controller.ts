import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryParamsDto, UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/multer';
import { Auth } from 'src/common/decorators/auth.decorators';
import { endpoint } from './category.authorization';
import type { UserDocument } from 'src/DB';
import { GetAllDto, GetAllResponse, IResponse, successResponse, User } from 'src/common';
import { CategoryResponse } from './entities/category.entity';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,) { }

  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudFileUpload({ validation: fileValidation.image })
    )
  )
  @Auth(endpoint.CreateCategory)
  @Post()
  async create(
    @User() user: UserDocument,   // to get info about user login
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File

  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.createCategory(createCategoryDto, file, user);
    return successResponse<CategoryResponse>({
      status: 201,
      data: { category }
    })
  }


  @Auth(endpoint.CreateCategory)
  @Patch(':CategoryId')
  async updateCategory(
    @Param() params: CategoryParamsDto,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {

    const category = await this.categoryService.updateCategory(params.CategoryId, updateCategoryDto, user);
    return successResponse<CategoryResponse>({
      data: { category }
    })
  }


  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudFileUpload({ validation: fileValidation.image })
    )
  )
  @Auth(endpoint.CreateCategory)
  @Patch(':CategoryId/attachment')
  async updateAttachment(
    @Param() params: CategoryParamsDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {

    const category = await this.categoryService.updateAttachment(params.CategoryId, file, user);
    return successResponse<CategoryResponse>({
      data: { category }
    })
  }


  @Auth(endpoint.CreateCategory)
  @Delete(':CategoryId/freeze')
  async freezedCategory(
    @Param() params: CategoryParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {

    await this.categoryService.freezedCategory(params.CategoryId, user);
    return successResponse()
  }


  @Auth(endpoint.CreateCategory)
  @Patch(':CategoryId/restore')
  async restoreCategory(
    @Param() params: CategoryParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    const category =
      await this.categoryService.restoreCategory(params.CategoryId, user);
    return successResponse<CategoryResponse>({
      data: { category }
    })
  }




  //HD
  @Auth(endpoint.CreateCategory)
  @Delete(':CategoryId')
  async removeCategory(
    @User() user: UserDocument,
    @Param() params: CategoryParamsDto
  ) {

    await this.categoryService.removeCategory(params.CategoryId, user);
    return successResponse()

  }





  @Get()
  async findAllCategory(
    @Query() query: GetAllDto
  ): Promise<IResponse<GetAllResponse>> {
    const result = await this.categoryService.findAllCategory(query);
    return successResponse<GetAllResponse>({ data: { result } })


  }

  @Auth(endpoint.CreateCategory)
  @Get('/archive')
  async findAllArchives(
    @Query() query: GetAllDto
  ): Promise<IResponse<GetAllResponse>> {
    const result = await this.categoryService.findAllCategory(query, true);
    return successResponse<GetAllResponse>({ data: { result } })


  }




  @Get(':CategoryId')
  async findOne(
    @Param() params: CategoryParamsDto) {
    const category = await this.categoryService.findOne(params.CategoryId);
    return successResponse<CategoryResponse>({
      data: { category } 
    })

  }

  @Auth(endpoint.CreateCategory)
  @Get(':CategoryId/archive')
  async findOneArchive(
    @Param() params: CategoryParamsDto) {
    const category = await this.categoryService.findOne(params.CategoryId, true);
    return successResponse<CategoryResponse>({
      data: { category }
    })

  }


}
