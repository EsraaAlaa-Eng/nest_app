import { Injectable } from "@nestjs/common";
import { DatabaseRepository } from "./database.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Coupon, CouponDocument as TDocument } from "../models";
import { Model } from "mongoose";


@Injectable()
export class CouponRepository extends DatabaseRepository<Coupon> {

    constructor(@InjectModel(Coupon.name) protected readonly model: Model<TDocument>) {
        super(model)
    }
}