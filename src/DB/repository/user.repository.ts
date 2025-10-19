import { Injectable } from "@nestjs/common";
import { DatabaseRepository } from "./database.repository";
import { InjectModel } from "@nestjs/mongoose";
import { UserDocument as TDocument, User } from "../models";
import { Model } from "mongoose";


@Injectable()
export class UserRepository extends DatabaseRepository<User> {

    constructor(@InjectModel(User.name) protected readonly model: Model<TDocument>) {
        super(model)
    }
}