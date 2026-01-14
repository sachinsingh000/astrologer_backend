import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

export default mongoose.model("Otp", otpSchema);
