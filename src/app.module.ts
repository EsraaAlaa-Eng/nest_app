import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { resolve } from 'path';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/.env.deployment'), isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URL as string, 
      { serverSelectionTimeoutMS: 30000,  
        // dbName: 'NEST_APP',
       }),

    //ال NestJS
    //بيشتغل بـ Modules System
    //كل كنترولر لازم يكون جوه module
    //وكل module لازم يتسجل في AppModule
    AuthenticationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
