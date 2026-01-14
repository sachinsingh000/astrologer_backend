// src/controllers/agora.controller.js
import asyncHandler from "../utils/asyncHandler.js";
import { generateAgoraTokenForUid } from "../services/agora.service.js";
import { hashStringToNumber } from "../utils/agora.js";

export const getAgoraToken = asyncHandler(async (req, res) => {
  const { channel } = req.body;
  if (!channel) {
    return res.status(400).json({ error: "channelName is required" });
  }

  // deterministic uid for user
  const userId = req.user?.id || "guest_" + Date.now();
  const numericUid = hashStringToNumber(userId.toString());

  const token = generateAgoraTokenForUid(numericUid, channel);

  res.json({
    token,
    appId: process.env.AGORA_APP_ID,
    channel,
    uid: numericUid
  });
});

