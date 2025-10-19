import { Injectable } from "@nestjs/common";
import { DatabaseRepository } from "./database.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Token , TokenDocument } from "../models";
import { Model } from "mongoose";


@Injectable()
export class TokenRepository extends DatabaseRepository<Token> {

    constructor(
        @InjectModel(Token.name) 
        protected readonly model: Model<TokenDocument>
    ) {
        super(model)
    }
}