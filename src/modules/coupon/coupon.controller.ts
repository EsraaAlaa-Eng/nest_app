import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { endPoint } from './authorization';
import { Auth, IResponse, successResponse, User } from 'src/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/multer';
import type { CouponDocument, UserDocument } from 'src/DB';
import { CouponResponse } from './entities/coupon.entity';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) { }

  @UseInterceptors(FileInterceptor("attachment", cloudFileUpload({ validation: fileValidation.image })))
  @Auth(endPoint.create)
  @Post()
  async createCoupon(
    @User() user: UserDocument,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @Body() createCouponDto: CreateCouponDto,
  ): Promise<IResponse<CouponResponse>> {

    const coupon = await this.couponService.createCoupon(createCouponDto, file, user);
    return successResponse<CouponResponse>({ status: 201, data: { coupon } })

  }





  @Get()
  findAll() {
    return this.couponService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(+id, updateCouponDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.remove(+id);
  }
}
