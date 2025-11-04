import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { emailEvent, generateHash } from "src/common";
import { OtpEnum } from "src/common/enums/otp.enum";
import { IOtp } from "src/common/interfaces/otp.interfaces";



@Schema({ timestamps: true })
export class Otp implements IOtp {

    @Prop({ type: String, required: false })
    code: string;

    @Prop({ type: Date, required: true })
    expiredAt: Date;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: String, enum: OtpEnum, required: true })
    type: OtpEnum

}

export type OtpDocument = HydratedDocument<Otp>
const otpSchema = SchemaFactory.createForClass(Otp);

otpSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 })


otpSchema.pre("save", async function (this: OtpDocument & { wasNew: boolean, plainOtp: String }, next) {

    this.wasNew = this.isNew //   بعد كدا ولا لا EMAIL علشان اعرف لو كنت هبعت  

    if (this.isModified('code')) {
        this.plainOtp = this.code;
        this.code = await generateHash(this.code);
        await this.populate([{ path: "createdBy", select: 'email' }])

    }



    next()
})

otpSchema.post("save", async function (doc, next) {
    const that = this as OtpDocument & { wasNew: boolean, plainOtp?: String }

    // console.log({
    //     email: (that.createdBy as any).email,
    //     wasNew: that.plainOtp,
    //     otp: that.plainOtp,
    // });

    if (that.wasNew && that.plainOtp) {
        emailEvent.emit(doc.type,
            {
                to: (that.createdBy as any).email,
                otp: that.plainOtp
            })

    }

    next()
})






export const otpModel = MongooseModule.forFeature([{ name: Otp.name, schema: otpSchema }])