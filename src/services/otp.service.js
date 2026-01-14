import axios from "axios";
import crypto from "crypto";

export async function sendOtp(phone) {
  const otp = Math.floor(1000 + Math.random() * 9000); 

  const payload = {
    template_id: process.env.MSG91_TEMPLATE_ID,
    mobile: `91${phone}`,
    authkey: process.env.MSG91_AUTH_KEY,
    sender: process.env.MSG91_SENDER_ID,
    otp: otp,
  };

  console.log("🔐 MSG91 CONFIG:", {
  key: process.env.MSG91_AUTH_KEY,
  template: process.env.MSG91_TEMPLATE_ID,
  sender: process.env.MSG91_SENDER_ID,
});

  try {
    await axios.get("https://control.msg91.com/api/v5/otp", { params: payload });
    console.log("✅ OTP sent to:", phone);
    return otp; 
  } catch (err) {
    console.error("❌ OTP send error:", err.response?.data || err.message);
    throw new Error("Failed to send OTP");
  }
}

export function verifyOtp(inputOtp, realOtp) {
  return inputOtp === realOtp;
}
