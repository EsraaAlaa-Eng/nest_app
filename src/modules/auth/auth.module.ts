import { Module } from "@nestjs/common";
import { otpModel } from "src/DB/models";
import { AuthenticationService } from "./auth.services";
import { AuthenticationController } from "./auth.controller";
import { OtpRepository, TokenRepository, UserRepository } from "src/DB";
import { SecurityService } from "src/common/service/security.service";
import { SharedAuthenticationModule } from "src/common/modules/auth.module";

// لو الملف مش موجود،
//  Nestال
//  مش هيعرف الكنترولر وبالتالي مش هيعمل 
// route /auth/signup.
@Module({
    imports: [SharedAuthenticationModule, otpModel],
    providers: [
        AuthenticationService,
        OtpRepository,
        SecurityService,

    ], //services ,factors,
    controllers: [AuthenticationController],
    exports: [ ],
})
export class AuthenticationModule { }