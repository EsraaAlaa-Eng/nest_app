import { OtpDocument } from "src/DB";
import { OtpEnum, RoleEnum } from "../enums";
import { Types } from "mongoose";
import { IUser } from "./user.interfaces";

export interface IOtp {
    _id?: Types.ObjectId,

    code: string;
    expiredAt: Date;
    type: OtpEnum;

    createdBy: Types.ObjectId | IUser

    createdAt?: Date;
    updateAt?: Date;



}


