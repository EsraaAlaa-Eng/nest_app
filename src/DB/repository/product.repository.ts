import { Injectable } from "@nestjs/common";
import { DatabaseRepository } from "./database.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Product, ProductDocument as TDocument } from "../models";
import { Model } from "mongoose";


@Injectable()
export class ProductRepository extends DatabaseRepository<Product> {

    constructor(@InjectModel(Product.name) protected readonly model: Model<TDocument>) {
        super(model)
    }
}