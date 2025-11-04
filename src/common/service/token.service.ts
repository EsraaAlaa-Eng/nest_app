import { JwtService, JwtSignOptions, JwtVerifyOptions } from "@nestjs/jwt";
import { JwtPayload, } from "jsonwebtoken";
import { RoleEnum, signatureLevelEnum, TokenEnum } from "../enums";
import { TokenDocument, UserDocument } from "src/DB/models";
import { randomUUID } from 'crypto'
import { TokenRepository, UserRepository } from "src/DB";
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { parseObjectId } from "../utils";
import { LoginCredentialsResponse } from "../entities";

@Injectable()
export class TokenServices {

    constructor(
        private readonly jwtService: JwtService,
        private readonly userRepository: UserRepository,
        private readonly tokenRepository: TokenRepository,


    ) { }

    generateToken = async ({
        payload,
        options = {
            secret: process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
            expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN || 3600)
        },

    }: {
        payload: object,
        options?: JwtSignOptions,
    }): Promise<string> => {

        return await this.jwtService.signAsync(payload, options);


    };

    verifyToken = async ({
        token,
        options = {
            secret: process.env.ACCESS_USER_TOKEN_SIGNATURE as string,

        }

    }: {
        token: string,
        options?: JwtVerifyOptions,
    }): Promise<JwtPayload> => {
        return await this.jwtService.verifyAsync(token, options) as JwtPayload


    };




    detectSignatureless = async (role: RoleEnum = RoleEnum.user): Promise<signatureLevelEnum> => {
        let signatureLevel: signatureLevelEnum = signatureLevelEnum.Bearer;

        switch (role) {
            case RoleEnum.admin:
                signatureLevel = signatureLevelEnum.System
                break;

            default:
                signatureLevel = signatureLevelEnum.Bearer;
                break;
        }
        return signatureLevel
    }


    getSignatures = async (signatureLevel: signatureLevelEnum = signatureLevelEnum.Bearer): Promise<{ access_signature: string; refresh_signature: string }> => {
        let signatures: { access_signature: string; refresh_signature: string } = {
            access_signature: "",
            refresh_signature: "",
        };

        switch (signatureLevel) {
            case signatureLevelEnum.System:
                signatures.access_signature = process.env.ACCESS_SYSTEM_TOKEN_SIGNATURE as string
                signatures.refresh_signature = process.env.REFRESH_SYSTEM_TOKEN_SIGNATURE as string

                break;

            default:
                signatures.access_signature = process.env.ACCESS_USER_TOKEN_SIGNATURE as string
                signatures.refresh_signature = process.env.REFRESH_USER_TOKEN_SIGNATURE as string

                break;
        }
        return signatures
    }



    createLoginCredentials = async (
        user: UserDocument
    ): Promise<LoginCredentialsResponse> => {
        const signatureLevel = await this.detectSignatureless(user.role)
        const signatures = await this.getSignatures(signatureLevel)
        console.log(signatures);


        const jwtid = randomUUID()
        const access_token = await this.generateToken({
            payload: { sub: user._id },
            options: {
                secret: signatures.access_signature,
                expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN), jwtid
            }

        });

        const refresh_token = await this.generateToken({
            payload: { sub: user._id },
            options: {
                secret: signatures.refresh_signature,
                expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN), jwtid
            }

        });

        return { access_token, refresh_token }

    }

    // decodetoken
    decodeToken = async ({
        authorization,
        tokenType = TokenEnum.access

    }: {
        authorization: string
        tokenType?: TokenEnum
    }): Promise<{ user: UserDocument; decoded: JwtPayload }> => {
        try {
            const [bearerKey, token] = authorization.split(" ");
            if (!bearerKey || !token) {
                throw new UnauthorizedException("missing token part");

            }

            const signatures = await this.getSignatures(bearerKey as signatureLevelEnum);
            const decoded = await this.verifyToken({
                token,
                options: {
                    secret: tokenType === TokenEnum.refresh ?
                        signatures.refresh_signature
                        : signatures.access_signature
                }
            });
            if (!decoded?.sub || !decoded?.iat) {
                throw new BadRequestException("Invalid token payload")
            }

            if (await this.tokenRepository.findOne({ filter: { jti: decoded.jti } })) {
                throw new UnauthorizedException("invalid or old login credentials")
            }

            const user = await this.userRepository.findOne({
                filter: { _id: decoded.sub }
            }) as UserDocument;
            if (!user) {
                throw new BadRequestException("Not register account")
            }

            if ((user.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
                throw new UnauthorizedException("invalid or old login credentials")
            }
            return { user, decoded }




        } catch (error) {
            throw new InternalServerErrorException(error.message || 'something went wrong')

        }
    };

    createRevokeToken = async (decoded: JwtPayload): Promise<TokenDocument> => {

        const [result] = (await this.tokenRepository.create({
            data: [{
                jti: decoded.jti as string,
                expiredAt: new Date(
                    (decoded.iat as number) +
                    Number(process.env.REFRESH_TOKEN_EXPIRES_IN)),

                createdBy: parseObjectId(decoded.sub as string)

            }]
        })) || []
        if (!result) {
            throw new BadRequestException("fail to revoke this token")

        }
        return result;
    }

}