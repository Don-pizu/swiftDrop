// util/otpService.js

const { sendOtpEmail } = require("./emailService");
const { sendOtpSMS, sendOtpWhatsApp } = require("./smsWhatsappService");
const { sendOtpVoice } = require("./voiceService");

exports.sendOtp = async ({ type, to, otp }) => {
  if (type === "email") {
    return sendOtpEmail(to, otp);
  }
  if (type === "sms") {
    return sendOtpSMS(to, otp);
  }
  if (type === "whatsapp") {
    return sendOtpWhatsApp(to, otp);
  }
  if (type === "voice") {
    return sendOtpVoice(to, otp);
  }
  
  throw new Error("Unsupported OTP channel");
};








//usage
/*
await sendOtp({ type: "email", to: user.email, otp });
await sendOtp({ type: "sms", to: user.phone, otp });      to: "+2348012345678"
await sendOtp({ type: "whatsapp", to: user.phone, otp });    to: "+2348012345678"


const { sendOtp } = require("./util/otpService");

// Email OTP
await sendOtp({ type: "email", to: "user@example.com", otp: 123456 });

// SMS OTP
await sendOtp({ type: "sms", to: "+2348012345678", otp: 654321 });

// WhatsApp OTP
await sendOtp({ type: "whatsapp", to: "+2348012345678", otp: 987654 });
*/
