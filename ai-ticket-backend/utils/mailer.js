import nodemailer from "nodemailer"


export const sendMail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
  },
});

const info = await transporter.sendMail({
    from: `"Assistant.Ai Support" <${process.env.EMAIL_USER}>`, // sender address
    to,
    subject, // subject line
    text
  });

  console.log("Message sent: %s", info.messageId);
  return info;
    } catch (error) {
        console.error("❌ Mail Error", error.message)
        throw error
    }
}