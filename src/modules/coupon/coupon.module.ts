import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { S3Service } from 'src/common';
import { couponModel, CouponRepository } from 'src/DB';

@Module({
  imports:[couponModel],
  controllers: [CouponController],
  providers: [CouponService,S3Service,CouponRepository],
})
export class CouponModule {}
