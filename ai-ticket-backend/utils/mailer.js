import nodemailer from "nodemailer"
import dns from "dns";

export const sendMail = async (to, subject, text) => {

    dns.setDefaultResultOrder('ipv4first');
    try {
        const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
  },

  tls: {
                rejectUnauthorized: false
            },

        socketTimeout: 20000,
            dnsTimeout: 20000,
            family: 4
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