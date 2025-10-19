import { EventEmitter } from "node:events";
import Mail from "nodemailer/lib/mailer";
import { sendEmail } from "./send.email";
import { verifyEmail } from "./verify.template.email"
import { mentionEmail } from "./mention.template.email";
import { Types } from "mongoose";
import { User } from "src/DB/models";
import { OtpEnum } from "src/common/enums";

export const emailEvent = new EventEmitter();


interface IEmail extends Mail.Options {
    mentionedBy: string;
    otp: number;
    postId: string;
}

emailEvent.on(OtpEnum.ConfirmEmail, async (data: IEmail) => {
    try {

        data.subject = OtpEnum.ConfirmEmail
        console.log("DEBUG emailEvent data:", data);
        data.html = verifyEmail({ otp: data.otp as unknown as string, title: data.subject })

        await sendEmail(data)

    } catch (error) {
        console.log(`fail to send email`, error);
    }

})

emailEvent.on(OtpEnum.ResetPassword, async (data: IEmail) => {
    try {

        data.subject = OtpEnum.ResetPassword
        console.log("DEBUG emailEvent data:", data);
        data.html = verifyEmail({ otp: data.otp as unknown as string, title: data.subject })

        await sendEmail(data)

    } catch (error) {
        console.log(`fail to send email`, error);
    }
})


emailEvent.on("mention_by", async (data: { taggedUsers: User[], user: User, postId: Types.ObjectId }) => {
    try {

        await sendEmail({
            subject: "You were mentioned in a post!",
            html: mentionEmail({
                mentionedBy: data.user.username as string,
                postLink: `${process.env.APP_URL}/posts/${data.postId}`,
                title: "New Mention Alert",
            }),
            to: data.taggedUsers.map(tag => { return tag.email })
        })

    } catch (error) {
        console.log(`fail to send email`, error);
    }

})


emailEvent.on(OtpEnum.TwoStepsVerification, async ({ data }) => {
    try {
        await sendEmail({
            subject: OtpEnum.TwoStepsVerification,
            to: data.email,
            html: verifyEmail({
                otp: data.otp,
                title: data.subject,
            })
        })

    } catch (error) {
        console.log(`fail to send email`, error);


    }
})







// emailEvent.on("mention", async (data: IEmail) => {
//     try {

//         console.log("mention data is");
//         data.subject = "You were mentioned in a post!"
//         console.log("DEBUG mention event:", data);
//         data.html = mentionEmail({
//             mentionedBy: data.mentionedBy,
//             postLink: `${process.env.APP_URL}/posts/${data.postId}`,
//             title: "New Mention Alert",
//         });
//         await sendEmail(data)

//     } catch (error) {
//         console.log(`fail to send email`, error);
//     }

// })