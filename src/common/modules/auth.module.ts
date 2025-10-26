import { Module } from "@nestjs/common";
import { otpModel, tokenModel, UserModel } from "src/DB/models";
import { OtpRepository, TokenRepository, UserRepository } from "src/DB";
import { SecurityService } from "src/common/service/security.service";
import { JwtService } from "@nestjs/jwt";
import { TokenServices } from "src/common/service/token.service";
import { AuthenticationService } from "src/modules/auth/auth.services";
import { AuthenticationController } from "src/modules/auth/auth.controller";
import { AuthenticationGuard } from "../guards/authentication/authentication.guard";

// لو الملف مش موجود،
//  Nestال
//  مش هيعرف الكنترولر وبالتالي مش هيعمل 
// route /auth/signup.
@Module({
    imports: [UserModel, otpModel, tokenModel],
    // controllers: [AuthenticationController],
    providers: [
        AuthenticationService,
        UserRepository,
        OtpRepository,
        SecurityService,
        TokenServices,
        JwtService,
        TokenRepository,
        AuthenticationGuard
    ], //services ,factors,
    exports: [
        AuthenticationService,
        UserRepository,
        TokenServices,
        JwtService,
        TokenRepository,
        tokenModel,
        UserModel,
        AuthenticationGuard,
    ],
})
export class SharedAuthenticationModule { }