import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandModel, BrandRepository, UserRepository } from 'src/DB';
import { S3Service } from 'src/common';
import { SharedAuthenticationModule } from 'src/common/modules/auth.module';

@Module({
  imports: [
    BrandModel, 
    
  ],
  controllers: [BrandController],
  providers: [BrandService, BrandRepository, S3Service],
})
export class BrandModule { }
