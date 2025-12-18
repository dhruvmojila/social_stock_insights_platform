import nodemailer from "nodemailer";
import {
  NEWS_SUMMARY_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "./templates";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export const sendWelcomeEmail = async ({
  email,
  name,
  intro,
}: WelcomeEmailData) => {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace(
    "{{intro}}",
    intro
  ).replace("{{name}}", name);

  const mailOptions = {
    from: "Stock Insight Platform <sip@welcom.com>",
    to: email,
    subject: `Welcome to Stock Insight Platform`,
    html: htmlTemplate,
    text: "Thanks for joining Stock Insight Platform!",
  };

  await transporter.sendMail(mailOptions);
};

export const sendNewsSummaryEmail = async ({
  email,
  date,
  newsContent,
}: {
  email: string;
  date: string;
  newsContent: string;
}) => {
  const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE.replace(
    "{{date}}",
    date
  ).replace("{{newsContent}}", newsContent);

  const mailOptions = {
    from: "Stock Insight Platform News <sip@welcom.com>",
    to: email,
    subject: `Stock Insight Platform News Summary for ${date}`,
    html: htmlTemplate,
    text: "Today's news summary for Stock Insight Platform!",
  };

  await transporter.sendMail(mailOptions);
};
