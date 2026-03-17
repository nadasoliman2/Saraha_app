import nodemailer from "nodemailer";
import { EMAIL_PORT, EMAIL_HOST, EMAIL_USER, EMAIL_PASS, APPLICATION_NAME } from "../../../../config/config.service.js";

export const sendEmail = async ({ to, cc, bcc, subject, attachments = [], html } = {}) => {
  try {
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT),
      secure: false, // false for 587
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS, // لازم يكون App Password لو Gmail
      },
    });

    const info = await transporter.sendMail({
      from: `"${APPLICATION_NAME}" <${EMAIL_USER}>`,
      to,
      subject,
      cc,
      bcc,
      html,
      attachments,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Failed to send email"); // ده يمنع 500 غير مفسر
  }
};