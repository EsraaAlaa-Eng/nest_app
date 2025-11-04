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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/.env.deployment'), isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URL as string,
      {
        serverSelectionTimeoutMS: 30000,
        // dbName: 'NEST_APP',
      }),

    //ال NestJS
    //بيشتغل بـ Modules System
    //كل كنترولر لازم يكون جوه module
    //وكل module لازم يتسجل في AppModule
    SharedAuthenticationModule,
    AuthenticationModule,
    UserModule,
    BrandModule



  ],
  controllers: [AppController],
  providers: [AppService, S3Service],
})
export class AppModule { }
