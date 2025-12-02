import { Injectable } from "@nestjs/common";
import { DatabaseRepository } from "./database.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Category, CategoryDocument as TDocument } from "../models";
import { Model } from "mongoose";


@Injectable()
export class CategoryRepository extends DatabaseRepository<Category> {

    constructor(@InjectModel(Category.name) protected readonly model: Model<TDocument>) {
        super(model)
    }
}