
import { Types } from "mongoose";
import { IUser } from "./user.interfaces";
import { CouponEnum } from "../enums";

export interface ICoupon {
    _id?: Types.ObjectId,

    name: string,
    slug: string,
    image: string,

    createdBy: Types.ObjectId | IUser
    updatedBy?: Types.ObjectId | IUser
    usedBy?: Types.ObjectId[] | IUser[]


    createdAt?: Date;
    updateAt?: Date;

    freezedAt?: Date | undefined;
    restoredAt?: Date | undefined;

    duration: number;
    discount: number;
    type:CouponEnum;

    startDate?: Date;
    endDate?: Date;




}


