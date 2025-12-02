import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { Types } from 'mongoose';
import { IsArray, IsMongoId, IsObject, IsOptional } from 'class-validator';
import { ContainField } from 'src/common';




@ContainField() // check at least on field arrive with us 
export class UpdateProductDto extends PartialType(CreateProductDto) { }
export class UpdateProductAttachmentDto {

    @IsOptional()
    @IsArray()
    removeAttachments: string[]
}



export class ProductParamsDto {
    @IsMongoId()
    productId: Types.ObjectId
}