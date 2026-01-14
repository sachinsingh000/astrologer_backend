// src/utils/fcmSender.js
import admin from "firebase-admin";
import FcmToken from "../models/FcmToken.js";

/**
 * Send data-only FCM notification
 */
export async function sendFCM({
  toUserId,
  type,
  sessionId,
  payload = {},
}) {
  if (!toUserId || !type || !sessionId) return;

  const tokens = await FcmToken.find({ userId: toUserId }).lean();
  if (!tokens.length) return;

  const message = {
    data: {
      type,
      sessionId: String(sessionId),
      ...payload,
    },
  };

  const tokenList = tokens.map(t => t.token);

  try {
    const res = await admin.messaging().sendEachForMulticast({
      tokens: tokenList,
      ...message,
    });

    // Remove invalid tokens
    res.responses.forEach((r, idx) => {
      if (!r.success) {
        const err = r.error?.code || "";
        if (
          err.includes("registration-token-not-registered") ||
          err.includes("invalid-argument")
        ) {
          FcmToken.deleteOne({ token: tokenList[idx] }).catch(() => {});
        }
      }
    });
  } catch (err) {
    console.error("❌ FCM send error:", err.message);
  }
}
