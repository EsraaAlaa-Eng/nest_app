import { Injectable } from "@nestjs/common";
import { DatabaseRepository } from "./database.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Brand, BrandDocument as TDocument } from "../models";
import { Model } from "mongoose";


@Injectable()
export class BrandRepository extends DatabaseRepository<Brand> {

    constructor(@InjectModel(Brand.name) protected readonly model: Model<TDocument>) {
        super(model)
    }
}