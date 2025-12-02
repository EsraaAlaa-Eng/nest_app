import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { resolve } from 'path';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SharedAuthenticationModule } from './common/modules/auth.module';
import { S3Service } from './common';
import { BrandModule } from './modules/brand/brand.module';
import { Category } from './DB';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { CouponModule } from './modules/coupon/coupon.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/.env.deployment'), isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URL as string,
      {
        serverSelectionTimeoutMS: 30000,
      }),

    //ال NestJS
    //بيشتغل بـ Modules System
    //كل كنترولر لازم يكون جوه module
    //وكل module لازم يتسجل في AppModule
    SharedAuthenticationModule,
    AuthenticationModule,
    UserModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    CartModule,
    CouponModule,



  ],
  controllers: [AppController],
  providers: [AppService, S3Service,

  ],
})
export class AppModule { }
