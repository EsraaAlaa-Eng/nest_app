import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { ContainField, MongoDBIds } from 'src/common';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Validate } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

@ContainField()
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {

    @Validate(MongoDBIds)
    @IsOptional()
    removedBrands?: Types.ObjectId[]
}




export class CategoryParamsDto {

    @IsMongoId()
    CategoryId: Types.ObjectId
}


