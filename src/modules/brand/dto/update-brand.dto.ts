import { PartialType } from '@nestjs/mapped-types';
import { Types } from 'mongoose';
import { CreateBrandDto } from './create-brand.dto';
import { isEmpty, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOctal, IsOptional, IsPositive, IsString } from 'class-validator';
import { ContainField } from 'src/common';
import { Type } from 'class-transformer';

@ContainField()
export class UpdateBrandDto extends PartialType(CreateBrandDto) { }

export class BrandParamsDto {

    @IsMongoId()
    brandId: Types.ObjectId
}


export class GetAllDto {
    @Type(() => Number) // type correction  "2" => 2
    @IsNumber()
    @IsPositive()
    @IsOptional()
    page: number;

    @Type(() => Number)
    @IsPositive()
    @IsNumber()
    @IsPositive()
    size: number;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    search: string;
}