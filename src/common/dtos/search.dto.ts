import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class GetAllDto {
    @Type(() => Number) // type correction  "2" => 2
    @IsNumber()
    @IsPositive()
    @IsOptional()
    page: number;

    @Type(() => Number)
    @IsPositive()
    @IsNumber()
    @IsOptional()
    size: number;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    search: string;
}