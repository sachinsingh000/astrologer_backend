// src/controllers/user.controller.js
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import Astrologer from "../models/Astrologer.js";

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId).lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  let extra = null;
  if (user.role === "astrologer") {
    extra = await Astrologer.findOne({ userId }).lean();
  }

  delete user.password;
  res.json({ user, profile: extra });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updates = req.body;

  // prevent role change via this endpoint
  delete updates.role;
  delete updates.password;

  const user = await User.findByIdAndUpdate(userId, updates, { new: true }).lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  delete user.password;
  res.json({ user });
});
