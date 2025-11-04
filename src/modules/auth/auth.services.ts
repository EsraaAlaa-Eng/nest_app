import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Types } from "mongoose";
import { createNumericalOtp, emailEvent, generateHash, IUser, LoginCredentialsResponse, OtpEnum, ProviderEnum } from "src/common";
import { UserDocument } from "src/DB/models";
import { confirmEmailDto, IGmailDTO, LoginBodyDto, ResendConfirmEmailDto, ResetConfirmPasswordDto, SignupBodyDto } from "./dto/signup.dto";
import { OtpRepository, UserRepository } from "../../DB/repository";
import { SecurityService } from "src/common/service/security.service";
import { TokenServices } from "src/common/service/token.service";
import { OAuth2Client, TokenPayload } from "google-auth-library";

@Injectable()
export class AuthenticationService {
    private user: IUser[] = [];


    private async verifyGmailAccount(idToken: string): Promise<TokenPayload> {

        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.WEB_CLIENT_ID?.split(",") || [],
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new BadRequestException("Fail to verify this google account")
        }
        return payload;

    }



    UserRepository: any;
    constructor(
        private readonly userRepository: UserRepository,
        private readonly otpRepository: OtpRepository,
        private readonly securityService: SecurityService,
        private readonly tokenService: TokenServices,

    ) { }


    private async createConfirmEmailOtp(userId: Types.ObjectId) {
        await this.otpRepository.create({
            data: [
                {
                    code: createNumericalOtp(),
                    expiredAt: new Date(Date.now() + 60 * 1000),//2min
                    createdBy: userId,
                    type: OtpEnum.ConfirmEmail,
                }
            ]
        })
    }



    async signup(data: SignupBodyDto): Promise<string> {
        const { email, password, username } = data;
        const checkUserExist = await this.userRepository.findOne({
            filter: { email },
        });

        if (checkUserExist) {
            throw new ConflictException('Email exist');
        }
        const [user] = await this.userRepository.create({
            data: [{ username, email, password }]
        });



        if (!user) {
            throw new BadRequestException('Fail to signup')
        }



        this.createConfirmEmailOtp(user._id)
        return `Done`
    }




    async signupWithGmail(data: IGmailDTO) {

        const { idToken } = data;
        const { email, family_name, given_name, picture }: TokenPayload = await this.verifyGmailAccount(idToken)

        const user = await this.userRepository.findOne({
            filter: {
                email
            }
        });

        if (user) {
            if (user.provider === ProviderEnum.GOOGLE) {
                return await this.tokenService.createLoginCredentials(user as UserDocument)

            }

            throw new ConflictException(`Email exist with another provider ${user.provider}`)
        }


        const [newUser] = await this.userRepository.create({
            data: [
                {
                    email: email as string,
                    firstName: given_name as string,
                    lastName: family_name as string,
                    // ProfileImage: picture as string,
                    confirmAt: new Date(),
                    provider: ProviderEnum.GOOGLE,
                },
            ]
        }) || []

        if (!newUser) {
            throw new BadRequestException("fail to signup with gmail please try again later")
        }

        return await this.tokenService.createLoginCredentials(newUser as UserDocument)

    };



    async loginWithGmail(data: IGmailDTO) {

        const { idToken } = data;
        const { email }: TokenPayload = await this.verifyGmailAccount(idToken)


        const user = await this.userRepository.findOne({
            filter: {
                email,
                provider: ProviderEnum.GOOGLE
            }
        });

        if (!user) {
            throw new NotFoundException("Not register account or registered with another provider")
        }

        return await this.tokenService.createLoginCredentials(user)

    }




    async resendConfirmEmail(data: ResendConfirmEmailDto): Promise<string> {
        const { email, } = data;
        const user = await this.userRepository.findOne({
            filter: { email, confirmAt: { $exists: false } },

            options: {
                populate: [{ path: "otp", match: { type: OtpEnum.ConfirmEmail, expiredAt: { $gt: new Date(Date.now()) } } }]
            }

        });
        // console.log({ user });
        // console.log(user?.otp);
        if (!user) {
            throw new NotFoundException('Fail to find matching account')
        }

        if (user.otp?.length) {
            throw new ConflictException(`sorry we cannot resend you new OTP until the existing one become expired please try again after ${user.otp[0].expiredAt}`)
        }

        await this.createConfirmEmailOtp(user._id)
        return `done`
    }




    async confirmEmail(data: confirmEmailDto): Promise<string> {
        const { email, code } = data;

        const user = await this.userRepository.findOne({
            filter: {
                email,
                confirmAt: { $exists: false }
            },

            options: {
                populate: [{ path: "otp", match: { type: OtpEnum.ConfirmEmail } }]
            }

        });

        if (!user) {
            throw new NotFoundException('Fail to find matching account')
        }

        if (
            !(user.otp?.length &&
                (await this.securityService.compareHash(code, user.otp[0].code))
            )) {
            throw new ConflictException(`sorry we cannot resend you new OTP until the existing one become expired please try again after ${user.otp[0].expiredAt}`)
        }
        user.confirmAt = new Date();
        await user.save();
        await this.otpRepository.deleteOne({ filter: { _id: user.otp[0]._id } })
        return `done`
    }



    async login(data: LoginBodyDto): Promise<LoginCredentialsResponse> {

        const { email, password } = data;
        const user = await this.userRepository.findOne({
            filter: {
                email,
                confirmAt: { $exists: true },
                provider: ProviderEnum.SYSTEM,
            }
        });
        console.log(user);

        if (!user) {
            throw new NotFoundException('fail to find matching account')
        }



        if (!(await this.securityService.compareHash(password, user.password))) {
            throw new UnauthorizedException('Invalid email or password');
        }
        return await this.tokenService.createLoginCredentials(user as UserDocument)

        
    }



    async forgetPassword(data: ResendConfirmEmailDto) {
        const { email } = data;

        console.log({ data, email });

        const user = await this.userRepository.findOne({
            filter: {
                email,
                provider: ProviderEnum.SYSTEM,
                confirmAt: { $exists: true }
            }
        });
        console.log(" user:", { user });


        if (!user) {
            throw new BadRequestException("invalid account due to one of the following reason")
        }

        await this.otpRepository.deleteOne({
            filter: {
                createdBy: user._id,
                type: OtpEnum.ResetPassword
            }
        })


        const code = createNumericalOtp();
        await this.otpRepository.create({
            data: [
                {
                    code,
                    expiredAt: new Date(Date.now() + 2 * 60 * 1000),//2min
                    createdBy: user._id,
                    type: OtpEnum.ResetPassword,
                }
            ]
        })

        emailEvent.emit("resetPassword", { to: email, code });




        return `done`


    }



    async verifyConfirmPassword(data: ResetConfirmPasswordDto) {

        const { email, newPassword, code } = data;

        const user = await this.userRepository.findOne({
            filter: {
                email,
                confirmAt: { $exists: true },
            },
            options: {
                populate: [{ path: "otp", match: { type: OtpEnum.ResetPassword, expiredAt: { $gt: new Date(Date.now()) } } }]
            }

        })

        // console.log("user:", user);


        if (!user) {
            throw new NotFoundException("invalid account due to one of the following reasons ")

        }
        const userOtp = user.otp?.[0]
        if (!userOtp) {
            throw new BadRequestException("Enter your code first")
        }

        if (userOtp.expiredAt < new Date()) {
            throw new BadRequestException("Otp expire")
        }


        if (!(await this.securityService.compareHash(code, user.otp[0].code))) {
            throw new ConflictException(`Invalid OTP code`)
        }

        const result = await this.userRepository.updateOne({
            filter: {
                email
            },
            update: {
                password: await generateHash(newPassword),
                changeCredentialsTime: new Date(),
            }
        })

        if (!result.matchedCount) {
            throw new BadRequestException("Fail to reset account  password ")
        }

        return `done`

    }



}

