// import nodemailer from "nodemailer";
// import { EMAIL_PORT, EMAIL_HOST, EMAIL_USER, EMAIL_PASS, APPLICATION_NAME } from "../../../../config/config.service.js";

// export const sendEmail = async ({ to, cc, bcc, subject, attachments = [], html } = {}) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: EMAIL_HOST,
//       port: parseInt(EMAIL_PORT),
//       secure: false, // false for 587
//       auth: {
//         user: EMAIL_USER,
//         pass: EMAIL_PASS, // لازم يكون App Password لو Gmail
//       },
//     });

//     const info = await transporter.sendMail({
//       from: `"${APPLICATION_NAME}" <${EMAIL_USER}>`,
//       to,
//       subject,
//       cc,
//       bcc,
//       html,
//       attachments,
//     });

//     console.log("Email sent:", info.messageId);
//     return info;
//   } catch (err) {
//     console.error("Error sending email:", err);
//     throw new Error("Failed to send email"); // ده يمنع 500 غير مفسر
//   }
// };
import sgMail from "@sendgrid/mail";
import { SENDGRID_API_KEY, SENDGRID_VERIFIED_SENDER } from "../../../../config/config.service.js";

// ضبط مفتاح الـ API
sgMail.setApiKey(SENDGRID_API_KEY);

export const sendEmail = async ({ to, cc, bcc, subject, attachments = [], html } = {}) => {
  try {
    const msg = {
      to, // المستلم
      from: SENDGRID_VERIFIED_SENDER, // الإيميل اللي Verified على SendGrid
      subject,
      cc,
      bcc,
      html,
      attachments: attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        type: att.type,      // لو حابة تحددي نوع الملف
        disposition: "attachment",
      })),
    };

    const info = await sgMail.send(msg);
    console.log("Email sent:", info);
    return info;
  } catch (err) {
    console.error("SendGrid Error:", err);
    throw new Error("Failed to send email"); // لمنع 500 غير واضح
  }
};