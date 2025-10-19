import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { otpModel, tokenModel, User, UserModel } from "src/DB/models";
import { AuthenticationService } from "./auth.services";
import { AuthenticationController } from "./auth.controller";
import { OtpRepository, TokenRepository, UserRepository } from "src/DB";
import { SecurityService } from "src/common/service/security.service";
import { JwtService } from "@nestjs/jwt";
import { TokenServices } from "src/common/service/token.service";

// لو الملف مش موجود،
//  Nestال
//  مش هيعرف الكنترولر وبالتالي مش هيعمل 
// route /auth/signup.
@Module({
    imports: [UserModel,otpModel,tokenModel],
    providers: [AuthenticationService, UserRepository,OtpRepository,SecurityService,TokenServices ,JwtService,TokenRepository], //services ,factors,
    controllers: [AuthenticationController],
    exports: [],
})
export class AuthenticationModule { }