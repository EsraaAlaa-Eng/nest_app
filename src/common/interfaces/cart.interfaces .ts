
import { Types } from "mongoose";
import { IUser } from "./user.interfaces";
import { IProduct } from "./product.interfaces ";


export interface ICartProduct {
    _id?: Types.ObjectId;

    productId: Types.ObjectId | IProduct;
    quantity: number;
    createdAt?: Date;
    updateAt?: Date;

}

export interface ICart {
    _id?: Types.ObjectId,

    createdBy: Types.ObjectId | IUser
    products:ICartProduct[]

    createdAt?: Date;
    updateAt?: Date;

}


