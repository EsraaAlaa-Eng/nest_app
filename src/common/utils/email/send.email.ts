import { BadRequestException } from "@nestjs/common";
import { createTransport, type Transporter } from "nodemailer"
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";



export const sendEmail = async (data: Mail.Options): Promise<void> => {
    if (!data.attachments?.length && !data.html && !data.text) {
        throw new BadRequestException("Messing Email content ")
    }

    const transporter: Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> = createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });


    const info = await transporter.sendMail({
        ...data,
        from: `${process.env.APPLICATION_NAME} 🍀 "<${process.env.EMAIL as string} `,

    });

    console.log("Message sent:", info.messageId);
}



