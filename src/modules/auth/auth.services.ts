import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { compareHash, createNumericalOtp, emailEvent, IUser, LoginCredentialsResponse, OtpEnum, ProviderEnum } from "src/common";
import { User, UserDocument } from "src/DB/models";
import { confirmEmailDto, LoginBodyDto, resendConfirmEmailDto, SignupBodyDto } from "./dto/signup.dto";
import { DatabaseRepository, OtpRepository, UserRepository } from "src/DB";
import { SecurityService } from "src/common/service/security.service";
import { JwtService } from "@nestjs/jwt";
import { access } from "fs";
import { TokenServices } from "src/common/service/token.service";

@Injectable()
export class AuthenticationService {
    private user: IUser[] = [];

    UserRepository: any;
    constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>,
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
                    expiredAt: new Date(Date.now() + 2 * 60 * 1000),//2min
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
        // ?? []


        if (!user) {
            throw new BadRequestException('Fail to signup')
        }



        this.createConfirmEmailOtp(user._id)
        return `Done`
    }


    async resendConfirmEmail(data: resendConfirmEmailDto): Promise<string> {
        const { email, } = data;
        const user = await this.userRepository.findOne({
            filter: { email, confirmAt: { $exists: false } },

            options: {
                populate: [{ path: "otp", match: { type: OtpEnum.ConfirmEmail, expiredAt: { $gt: new Date() } } }]
            }

        });
        console.log(user);
        console.log(user?.otp);

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
            filter: { email, confirmAt: { $exists: false } },

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
                provider: ProviderEnum.system,
            }
        });
        if (!user) {
            throw new NotFoundException('fail to find matching account')
        }

        if (!(await this.securityService.compareHash(password, user.password))) {
            throw new UnauthorizedException('Invalid email or password');
        }





        return await this.tokenService.createLoginCredentials(user as UserDocument)
    }
}