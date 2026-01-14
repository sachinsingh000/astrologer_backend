// import { sendOtp, verifyOtp } from "../services/otp.service.js";

// let otpStore = {};

// export const sendOtpController = async (req, res) => {
//   try {
//     const { phone } = req.body;
//     if (!phone) return res.status(400).json({ error: "Phone is required" });

//     const otp = await sendOtp(phone);
//     otpStore[phone] = otp;

//     res.json({ success: true, message: "OTP sent successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const verifyOtpController = async (req, res) => {
//   try {
//     const { phone, otp } = req.body;
//     if (!phone || !otp)
//       return res.status(400).json({ error: "Phone and OTP are required" });

//     const valid = verifyOtp(otp, otpStore[phone]);
//     if (!valid)
//       return res.status(400).json({ success: false, message: "Invalid OTP" });

//     delete otpStore[phone];

//     // find or create user
//     let user = await User.findOne({ phone });
//     if (!user) {
//       user = await User.create({ phone, name: "New User" });
//     }

//     // generate JWT token
//     const token = generateToken(user._id, user.role);

//     res.json({
//       success: true,
//       message: "OTP verified successfully",
//       token,
//       user,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// *****  test locally *****

import Otp from "../models/Otp.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const sendOtpController = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone)
      return res
        .status(400)
        .json({ success: false, message: "Phone number required" });

    // check user existence
    const user = await User.findOne({ phone });

    // generate OTP (4-digit)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // store or update OTP
    await Otp.findOneAndUpdate(
      { phone },
      { otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) }, // 5 min expiry
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      message: "OTP generated",
      otp, // for dev only
      userExists: !!user,
    });
  } catch (error) {
    console.error("sendOtpController error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const verifyOtpController = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP required" });

    const record = await Otp.findOne({ phone });
    if (!record || record.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (record.expiresAt < new Date())
      return res.status(400).json({ success: false, message: "OTP expired" });

    // find or create user
    let user = await User.findOne({ phone });
    let isNewUser = false;
    if (!user) {
      user = await User.create({
        phone,
        name: "New User",
        role: "user",
      });
      isNewUser = true;
    }

    // create JWT
    const token = jwt.sign({ sub: user._id, role: user.role }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // cleanup otp
    await Otp.deleteOne({ phone });

    return res.json({
      success: true,
      message: "OTP verified successfully",
      token,
      user,
      isNewUser,
    });
  } catch (error) {
    console.error("verifyOtpController error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
