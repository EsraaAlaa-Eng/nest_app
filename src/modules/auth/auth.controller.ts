import { Body, Controller, Patch, Post, UsePipes, ValidationPipe } from "@nestjs/common"
import { AuthenticationService } from "./auth.services";
import { confirmEmailDto, LoginBodyDto, resendConfirmEmailDto, SignupBodyDto } from "./dto/signup.dto";
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

}





