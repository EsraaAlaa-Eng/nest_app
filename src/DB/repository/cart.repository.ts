import { Injectable } from "@nestjs/common";
import { DatabaseRepository } from "./database.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Cart, CartDocument as TDocument } from "../models";
import { Model } from "mongoose";


@Injectable()
export class CartRepository extends DatabaseRepository<Cart> {

    constructor(@InjectModel(Cart.name) protected readonly model: Model<TDocument>) {
        super(model)
    }
}