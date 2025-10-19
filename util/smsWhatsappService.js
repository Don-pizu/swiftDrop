// util/smsWhatsappService.js
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send SMS OTP
exports.sendOtpSMS = async (to, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your SwiftDrop OTP is ${otp}. It expires in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to, // must be in E.164 format e.g. +2348012345678
    });
    console.log("✅ SMS OTP sent:", message.sid);
    return true;
  } catch (error) {
    console.error("❌ SMS Error:", error.message);
    return false;
  }
};

// Send WhatsApp OTP
exports.sendOtpWhatsApp = async (to, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your SwiftDrop WhatsApp OTP is ${otp}. It expires in 10 minutes.`,
      from: "whatsapp:+14155238886", // Twilio Sandbox WhatsApp number
      to: `whatsapp:${to}`, // must be in format whatsapp:+2348012345678
    });
    console.log("✅ WhatsApp OTP sent:", message.sid);
    return true;
  } catch (error) {
    console.error("❌ WhatsApp Error:", error.message);
    return false;
  }
};






















/*
//Termii

const axios = require("axios");

const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER = process.env.TERMII_SENDER || "swiftDrop"; // fallback if not set
const TEST_NUMBER = process.env.TEST_NUMBER || "+2348061180670"; // phone number with country code


exports.sendOtpSMSWhatsApp = async ({ channel, to, otp }) => {
  try {
    const message = `Your swiftDrop OTP is ${otp}. It expires in 10 minutes.`;

    if (channel === "sms") {
      await axios.post("https://api.ng.termii.com/api/sms/send", {
        api_key: process.env.TERMII_API_KEY,
        to,
        from: process.env.TERMII_SENDER,
        sms: message,
        type: "plain",
        channel: "generic"
      });
    } 
    
    else if (channel === "whatsapp") {
      await axios.post("https://api.ng.termii.com/api/whatsapp/send", {
        api_key: process.env.TERMII_API_KEY,
        to,
        from: process.env.TERMII_SENDER,
        sms: message,
        type: "plain",
        channel: "whatsapp"
      });
    }

    console.log(`✅ OTP sent via ${channel} to ${to}: ${otp}`);
    return true;
  } catch (err) {
    console.error("❌ Error sending OTP:", err.response?.data || err.message);
    return false;
  }
};

*/

