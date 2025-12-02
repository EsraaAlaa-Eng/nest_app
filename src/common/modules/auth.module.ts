import { Global, Module } from "@nestjs/common";
import { otpModel, tokenModel, UserModel } from "src/DB/models";
import { TokenRepository, UserRepository } from "src/DB";
import { JwtService } from "@nestjs/jwt";
import { TokenServices } from "src/common/service/token.service";

// لو الملف مش موجود،
//  Nestال
//  مش هيعرف الكنترولر وبالتالي مش هيعمل 
// route /auth/signup.
@Global()
@Module({
    imports: [
        UserModel,
        // otpModel,
        tokenModel
    ],

    providers: [
     
       TokenServices,
        TokenRepository,
        UserRepository,
        JwtService,

    ], //services ,factors,

    exports: [
        TokenServices,
        TokenRepository,
        UserRepository,
        tokenModel,
        UserModel,
        JwtService,

    
    ],
})
export class SharedAuthenticationModule { }