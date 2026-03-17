import nodemailer from "nodemailer";
import {EMAIL_PORT,EMAIL_HOST, EMAIL_USER , EMAIL_PASS,APPLICATION_NAME} from "../../../../config/config.service.js"

export const sendEmail=async({
    to,
cc,
bcc,
subject,
attachments=[],
html}={})=>{ 
    const transporter = nodemailer.createTransport({
secure:false ,
host:EMAIL_HOST,
port:parseInt(EMAIL_PORT),
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});
  const info = await transporter.sendMail({
    from: `"${APPLICATION_NAME}" <${EMAIL_USER}>`,
    to,
    subject,
    cc, 
    bcc,
    html, 
    attachments
  });

   console.log("Email sent:", info.messageId);
}