
import { Types } from "mongoose";
import { IUser } from "./user.interfaces";
import { ICategory } from "./category.interfaces";
import { IBrand } from "./brand.interfaces";

export interface IProduct {
    _id?: Types.ObjectId,

    name: string,
    slug: string,
    description: string,
    images: string[],

    mainPrice: number,
    discountPercent: number,
    salePrice: number,
    assetFolderId: string,

    stock: number,
    soldItems: number,

    category: Types.ObjectId | ICategory,
    brand: Types.ObjectId | IBrand


    createdBy: Types.ObjectId | IUser
    updatedBy?: Types.ObjectId | IUser


    createdAt?: Date;
    updateAt?: Date;

    freezedAt?: Date | undefined;
    restoredAt?: Date | undefined;




}


