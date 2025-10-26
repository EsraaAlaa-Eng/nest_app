import { Body, Controller, Patch, Post, UsePipes, ValidationPipe } from "@nestjs/common"
import { AuthenticationService } from "./auth.services";
import { confirmEmailDto, IGmailDTO, LoginBodyDto, resendConfirmEmailDto, ResetConfirmPasswordDto, SignupBodyDto, } from "./dto/signup.dto";
import { LoginResponse } from "./entities/auth.entity";

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
    ): Promise<{
        message: string;
    }> {
        await this.authenticationService.signup(body);
        return { message: 'Done' }
    }




    @Post('resend-confirm-email')
    async resendConfirmEmail(
        @Body()
        body: resendConfirmEmailDto  //user class validators
    ): Promise<{
        message: string;
    }> {
        await this.authenticationService.resendConfirmEmail(body);
        return { message: 'Done' }
    }





    @Patch('confirm-email')
    async ConfirmEmail(
        @Body()
        body: confirmEmailDto  //user class validators
    ): Promise<{
        message: string;
    }> {
        await this.authenticationService.confirmEmail(body);
        return { message: 'Done' }
    }




    @Post('login')
    async login(
        @Body()
        body: LoginBodyDto
    ): Promise<LoginResponse> {
        const credentials = await this.authenticationService.login(body);
        return { message: 'Done', data: { credentials } }
    }




    @Post('signup/gmail')
    async signupWithGmail(
        @Body('idToken')
        body: IGmailDTO
    ) {

        return await this.authenticationService.signupWithGmail(body);
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
        @Body('email')
        body: resendConfirmEmailDto
    ) {
        return await this.authenticationService.forgetPassword(body);
    }


    @Patch('reset-confirm-password')
    async verifyConfirmPassword(
        @Body()
        body: ResetConfirmPasswordDto
    ) {
        return await this.authenticationService.verifyConfirmPassword(body)
    }
}








