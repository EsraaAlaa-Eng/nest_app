import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length, Matches, ValidateIf } from "class-validator";
import { IsMatch } from "src/common";
import { extend } from "zod/mini";


export class IGmailDTO {
    @IsString()
    idToken: string
}



export class ResendConfirmEmailDto {
    @IsEmail({}, { message: "Email must be valid" })
    email: string;

}


export class confirmEmailDto extends ResendConfirmEmailDto {
    @Matches(/^\d{6}$/)
    code: string;

}




export class LoginBodyDto extends ResendConfirmEmailDto {

    @IsNotEmpty({ message: "Password is required" })
    @IsStrongPassword()
    password: string;


}




export class SignupBodyDto extends LoginBodyDto {
    @Length(2, 52, { message: 'user min length is 2 char and max length is 6 char' })
    @IsNotEmpty()
    @IsString()
    username: string;


    @IsNotEmpty()
    @IsString()

    @ValidateIf((data: SignupBodyDto) => {
        return Boolean(data.password)
    })


    // @Validate(MatchBetweenFields, { message: "confirm password not identical with password" })  //validation option over write defaultMessage
    @IsMatch(['password'], { message: "confirm password not identical with password" })
    confirmPassword: string;
}



export class ResetConfirmPasswordDto extends confirmEmailDto {

    @IsStrongPassword()
    @IsNotEmpty()
    newPassword: string;

    @IsStrongPassword()
    @IsNotEmpty({ message: "Old password is required" })
    password: string;
}




