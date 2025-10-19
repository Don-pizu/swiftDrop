//util/emailService.js

const nodemailer = require("nodemailer");

exports.sendOtpEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
     tls: {
      rejectUnauthorized: false, //  allow self-signed certs
    },
  });

  await transporter.sendMail({
    from: `"swiftDrop OTP" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your Registration OTP Code",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    html: `<!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8" />
              <style>
                body { font-family: Arial, sans-serif; background:#f9f9f9; padding:20px; }
                .box { background:#fff; padding:20px; border-radius:8px; max-width:400px; margin:auto; }
                .otp { font-size:28px; font-weight:bold; color:#2c3e50; }
                p { font-size:16px; color:#555; }
              </style>
            </head>
            <body>
              <div class="box">
                <h2>🚖 swiftDrop Verification</h2>
                <p>Hello,</p>
                <p>Your One-Time Password (OTP) is:</p>
                <p class="otp">${otp}</p>
                <p>This code will expire in <b>10 minutes</b>. Please do not share it with anyone.</p>
                <p>Thank you,<br>swiftDrop Team</p>
              </div>
            </body>
            </html>
            `
  });

  console.log(`OTP sent to ${to}: ${otp}`); // dev log
};
