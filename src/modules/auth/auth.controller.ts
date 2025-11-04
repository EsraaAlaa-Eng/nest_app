import { Body, Controller, Patch, Post, UsePipes, ValidationPipe } from "@nestjs/common"
import { AuthenticationService } from "./auth.services";
import { confirmEmailDto, IGmailDTO, LoginBodyDto, ResendConfirmEmailDto, ResetConfirmPasswordDto, SignupBodyDto, } from "./dto/signup.dto";
import { LoginResponse } from "./entities/auth.entity";
import { IResponse, successResponse } from "src/common";
import { promises } from "dns";

@Controller('auth')
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) { }


    @Post('signup')
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    async signup(
        @Body()
        body: SignupBodyDto  //user class validators
    ): Promise<IResponse> {
        await this.authenticationService.signup(body);
        return successResponse();

    }




    @Post('resend-confirm-email')
    async resendConfirmEmail(
        @Body()
        body: ResendConfirmEmailDto  //user class validators
    ): Promise<IResponse> {
        await this.authenticationService.resendConfirmEmail(body);
        return successResponse()
    }





    @Patch('confirm-email')
    async ConfirmEmail(
        @Body()
        body: confirmEmailDto  //user class validators
    ): Promise<IResponse> {
        await this.authenticationService.confirmEmail(body);
        return successResponse()
    }




    @Post('login')
    async login(
        @Body()
        body: LoginBodyDto
    ): Promise<IResponse<LoginResponse>> {
        const credentials = await this.authenticationService.login(body);
        return successResponse <LoginResponse>({ data: { credentials } })
    }




    @Post('signup/gmail')
    async signupWithGmail(
        @Body('idToken')
        body: IGmailDTO
    ): Promise<IResponse> {
        await this.authenticationService.signupWithGmail(body);

        return successResponse()
    }


    @Post('login/gmail')
    async loginWithGmail(
        @Body('idToken')
        body: IGmailDTO
    ) {

        return await this.authenticationService.loginWithGmail(body);
    }


    @Patch('forget-password')
    async forgetPassword(
        @Body()
        // @Body('email')

        body: ResendConfirmEmailDto
    ): Promise<IResponse> {

        await this.authenticationService.forgetPassword(body);
        return successResponse()
    }


    @Patch('reset-confirm-password')
    async verifyConfirmPassword(
        @Body()
        body: ResetConfirmPasswordDto
    ): Promise<IResponse> {
        await this.authenticationService.verifyConfirmPassword(body)
        return successResponse()

    }
}








