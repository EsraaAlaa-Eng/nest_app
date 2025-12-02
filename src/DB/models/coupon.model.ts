import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import { CouponEnum, ICoupon, IUser } from "src/common";
import { number } from "zod";


@Schema({ timestamps: true, strictQuery: true })
export class Coupon implements ICoupon {


    @Prop({ type: String, required: true, unique: true, minlength: 2, maxlength: 25 })
    name: string;

    @Prop({ type: String, unique: true, minlength: 2, maxlength: 50 })
    slug: string;

    @Prop({ type: String, required: true })
    image: string;


    @Prop({ type: Types.ObjectId, required: true, ref: "User" })
    createdBy: Types.ObjectId | IUser

    @Prop({ type: Types.ObjectId, ref: "User" })
    updatedBy: Types.ObjectId | IUser

    @Prop({ type: [{ type: Types.ObjectId, ref: "User" }] })
    usedBy?: Types.ObjectId[]

    @Prop({ type: Date, required: true })
    startDate?: Date;
    @Prop({ type: Date, required: true })
    endDate?: Date;

    @Prop({ type: Date })
    freezedAt?: Date;
    @Prop({ type: Date })
    restoredAt?: Date;

    @Prop({ type: Number, required: true })
    discount: number;

    @Prop({ type: Number, default: 1 })
    duration: number;

    @Prop({ type: String, enum: CouponEnum, required: true })
    type: CouponEnum;

}

export type CouponDocument = HydratedDocument<Coupon>
const couponSchema = SchemaFactory.createForClass(Coupon);

couponSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 })




couponSchema.pre("save", async function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name)

    }
    next()
})



//update hook
couponSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {

    const update = this.getUpdate() as UpdateQuery<CouponDocument>;
    if (update.name) {
        this.setUpdate({
            ...update, slug: slugify(update.name)
        })
    }
    //soft dele
    const query = this.getQuery();
    if (query.paranoId === false) { //all Coupon

        this.setQuery({ ...query });  //update all
    }
    else { //All Coupon exception HD && SD 
        this.setQuery({
            ...query,
            freezedAt: { $exists: false } //update all (only not freezed)
        })
    }

    next()
})





couponSchema.pre(['findOne', 'find'], async function (next) {
    //before reade
    const query = this.getQuery();
    if (query.paranoId === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } })
    }


    next()
})





export const couponModel = MongooseModule.forFeature([{ name: Coupon.name, schema: couponSchema }])