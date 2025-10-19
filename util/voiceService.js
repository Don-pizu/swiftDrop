// util/voiceService.js
 
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Voice Call OTP
exports.sendOtpVoice = async (to, otp) => {
  try {
    const call = await client.calls.create({
      twiml: `<Response><Say voice="alice">Hello! Your SwiftDrop verification code is ${otp}. I repeat, ${otp}. It expires in ten minutes.</Say></Response>`,
      to: to, // e.g. +2348012345678
      from: process.env.TWILIO_PHONE_NUMBER, // must be a Twilio number with voice capability
    });

    console.log("✅ Voice OTP call initiated:", call.sid);
    return true;
  } catch (error) {
    console.error("❌ Voice OTP Error:", error.message);
    return false;
  }
};






/*
//Termii
const axios = require("axios");

exports.sendOtpVoice = async (to, otp) => {
  try {
    const res = await axios.post("https://api.ng.termii.com/api/sms/otp/send/voice", {
      api_key: process.env.TERMII_API_KEY,
      phone_number: to,   // e.g. 2348XXXXXXXXX
      pin_type: "numeric",
      pin_attempts: 3,
      pin_time_to_live: 10,  // 10 minutes
      pin_length: 6,
      pin_placeholder: "<123456>", 
      message_text: `Your SwiftDrop OTP code is <123456>`, // Termii will replace <123456> with OTP
      channel: "voice",
    });

    console.log("✅ Voice OTP sent:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Error sending Voice OTP:", err.response?.data || err.message);
    return null;
  }
};

*/