import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { BrandModel } from 'src/DB/models/brand.model'
import { BrandRepository } from 'src/DB/repository/brand.repository'
import { CategoryModel } from 'src/DB/models/category.model'
import { SharedAuthenticationModule } from 'src/common/modules/auth.module';
import { S3Service } from 'src/common';

@Module({
  imports: [CategoryModel, BrandModel],
  controllers: [CategoryController],
  providers: [CategoryService, BrandRepository, CategoryRepository, CategoryService, S3Service],
})
export class CategoryModule { }
