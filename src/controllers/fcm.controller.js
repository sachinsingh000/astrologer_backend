// src/controllers/fcm.controller.js
import FcmToken from "../models/FcmToken.js";

/**
 * Register or update FCM token
 * body: { token, platform }
 * auth required
 */
export const registerFcmToken = async (req, res) => {
  const userId = req.user.id;
  const { token, platform = "android" } = req.body;

  if (!token) {
    return res.status(400).json({ message: "FCM token required" });
  }

  // Ensure token is unique globally
  await FcmToken.deleteMany({ token });

  await FcmToken.create({
    userId,
    token,
    platform,
  });

  return res.json({ success: true });
};
