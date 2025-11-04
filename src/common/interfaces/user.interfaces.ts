import { OtpDocument } from "src/DB";
import { GenderEnum, languageEnum, ProviderEnum, RoleEnum } from "../enums";
import { Types } from "mongoose";

export interface IUser {
    _id?: Types.ObjectId,

    firstName: string;
    lastName: string;
    email: string;
    username?: string;
    password?: string;


    confirmAt: Date;


    confirmEmail: Date;

    provider: ProviderEnum
    role: RoleEnum
    gender: GenderEnum;

    changeCredentialsTime?: Date;
    otp?: OtpDocument[];

    PreferredLanguage: languageEnum;

    profilePicture?: string



    createdAt?: Date;
    updateAt?: Date;



}


