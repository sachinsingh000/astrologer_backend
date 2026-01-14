// src/controllers/chatRequest.controller.js
import mongoose from "mongoose";
import ChatRequest from "../models/ChatRequest.js";
import ChatSession from "../models/ChatSession.js";
import { io } from "../loaders/socket.js";
import {
  transitionSession,
  SESSION_STATES,
} from "../utils/sessionTransition.js";
import { sendFCM } from "../utils/fcmSender.js";
import { NOTIFICATION_EVENTS } from "../constants/notificationEvents.js";
import { connectSession } from "../services/sessionConnect.helper.js";

/* ------------------------- CREATE NEW REQUEST ------------------------- */
/**
 * Called from server-side when user starts chat session.
 * Saves ChatRequest in DB (idempotent by sessionId) and emits socket to astrologer.
 *
 * Note: this is a helper (not an Express handler) used by chatSession.controller.startChat
 */

/**
 * createChatRequest helper
 * - accepts: { sessionId, roomId, astrologerId, userId, userName, userImage, ratePerMinute, type='chat', callChannel, callToken, meta }
 * - returns { duplicate, request }
 */

// 🔔 Active ringing timers (sessionId -> interval)
const ringingIntervals = new Map();

export const createChatRequest = async ({
  sessionId,
  roomId,
  astrologerId,
  userId,
  userName,
  userImage,
  ratePerMinute,
  type,
  callChannel,
  callCallerUid,
  callCallerToken,
  callCalleeUid,
  callCalleeToken,
  meta,
}) => {
  const existing = await ChatRequest.findOne({
    userId,
    astrologerId,
    status: "pending",
    type,
  });

  if (existing) {
    return { duplicate: true, request: existing };
  }

  const payload = {
    sessionId: sessionId.toString(),
    roomId,
    astrologerId,
    userId,
    userName,
    userImage,
    ratePerMinute,
    type,
    callChannel,
    callCallerUid,
    callCallerToken,
    callCalleeUid,
    callCalleeToken,
    meta,
    status: "pending",
  };

  const request = await ChatRequest.create(payload);

  // notify astrologer of the incoming request
  if (io) {
    io.of("/chat").to(String(astrologerId)).emit("session_started", {
      sessionId,
      roomId,
      type,
      userId,
      userName,
      userImage,
      ratePerMinute,
      callChannel,
    });
  }
  // 🔔 FCM: chat request notification
  sendFCM({
    toUserId: astrologerId,
    type: NOTIFICATION_EVENTS.CHAT_REQUESTED,
    sessionId,
  });

  return { duplicate: false, request };
};

/* ------------------------- GET REQUESTS (Astrologer) ------------------------- */
export const getChatRequests = async (req, res) => {
  try {
    const astrologerId = req.user?.id;
    if (!astrologerId)
      return res
        .status(400)
        .json({ success: false, message: "Missing astrologer id" });
    console.log("🔍 getChatRequests for astrologer:", astrologerId);

    // If stored as ObjectId in DB, convert:
    const query = { astrologerId: astrologerId };
    const requests = await ChatRequest.find(query)
      .sort({ createdAt: -1 })
      .lean();
    console.log("🔍 FOUND requests count:", requests.length);
    res.json({ success: true, requests });
  } catch (e) {
    console.error("❌ getChatRequests error", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------------- ACCEPT REQUEST (Astrologer) ------------------------- */
export const acceptChatRequest = async (req, res) => {
  const { sessionId } = req.body;
  const astrologerId = req.user.id;

  const request = await ChatRequest.findOne({
    sessionId: sessionId.toString(),
    astrologerId: new mongoose.Types.ObjectId(astrologerId),
  });

  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  // 🔒 Load authoritative session
  const session = await ChatSession.findById(request.sessionId);
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  // 🔒 Enforce legal transition: REQUESTED → ACCEPTED
  // 🔒 ACCEPT only once
  if (session.status === SESSION_STATES.REQUESTED) {
    try {
      transitionSession(session, SESSION_STATES.ACCEPTED);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  // Update request status AFTER session is valid
  request.status = "accepted";
  await request.save();

  session.status = SESSION_STATES.RINGING_USER;
  await session.save();
  console.log("🔥 startUserRinging called for session", session._id);
  startUserRinging(session._id);

  // 🔔 FCM: chat accepted notification
  sendFCM({
    toUserId: request.userId,
    type: NOTIFICATION_EVENTS.CHAT_ACCEPTED,
    sessionId: request.sessionId,
  });

  // SEND TOKENS TO USER
  // if (io) {
  //   io.of("/chat").to(String(request.userId)).emit("session_calling", {
  //     sessionId: request.sessionId,
  //     roomId: request.roomId,
  //     type: request.type,
  //     callChannel: request.callChannel,
  //     callUid: request.callCallerUid,
  //     callToken: request.callCallerToken,
  //     role: "caller",
  //     userName: request.userName,
  //     userImage: request.userImage,
  //   });
  // }

  // RETURN TOKENS TO ASTROLOGER IN HTTP RESPONSE
  return res.json({
    success: true,
    callChannel: request.callChannel,
    callUid: request.callCalleeUid,
    callToken: request.callCalleeToken,
    role: "callee",
  });
};

export const startUserRinging = (sessionId) => {
  const key = sessionId.toString();

  // 🔒 Prevent duplicate ringing loops
  if (ringingIntervals.has(key)) {
    return;
  }

  const interval = setInterval(async () => {
    const session = await ChatSession.findById(sessionId);

    // 🛑 Stop ringing if session is no longer valid
    if (!session || session.status !== SESSION_STATES.RINGING_USER) {
      clearInterval(interval);
      ringingIntervals.delete(key);
      return;
    }

    io.of("/chat").to(String(session.userId)).emit("session_calling", {
      sessionId: session._id,
      roomId: session.roomId,
      type: session.type,
      callChannel: session.callChannel,
      callUid: session.callCallerUid,
      callToken: session.callCallerToken,
      role: "caller",
      userName: session.userName,
      userImage: session.userImage,
    });
  }, 2000);

  ringingIntervals.set(key, interval);
};

/* ------------------------- CANCEL OUTGOING CALL (Astrologer)  ------------------------- */

export const cancelAstrologerRinging = async (req, res) => {
  const { sessionId } = req.body;
  const astrologerId = req.user.id;

  const session = await ChatSession.findById(sessionId);
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  if (String(session.astrologerId) !== String(astrologerId)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (session.status !== SESSION_STATES.RINGING_USER) {
    return res.status(400).json({ message: "Session not ringing" });
  }

  const key = session._id.toString();

  // ✅ 1️⃣ STOP interval FIRST
  if (ringingIntervals.has(key)) {
    clearInterval(ringingIntervals.get(key));
    ringingIntervals.delete(key);
  }

  // ✅ 2️⃣ THEN update session state
  session.status = SESSION_STATES.MISSED;
  await session.save();

  // ✅ 3️⃣ THEN notify user
  io.of("/chat").to(String(session.userId)).emit("session_missed", {
    sessionId: session._id,
  });

  console.log("❌ Astrologer cancelled ringing for session", session._id);
  return res.json({ success: true });
};

/* ------------------------- CANCEL INCOMING CALL (User)  ------------------------- */

export const cancelUserRinging = async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.user.id;

  const session = await ChatSession.findById(sessionId);
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  // Only allow decline if still ringing
  if (session.status !== SESSION_STATES.RINGING_USER) {
    return res.status(400).json({ message: "Session not ringing" });
  }

  session.status = SESSION_STATES.DECLINED_BY_USER;
  await session.save();

  // 🔔 Notify astrologer immediately
  const room = String(session.astrologerId);

  const socketsInRoom = await io.of("/chat").in(room).fetchSockets();
  console.log("🧪 SOCKETS IN ASTRO ROOM:", room, socketsInRoom.length);

  io.of("/chat").to(room).emit("session_ringing_declined", {
    sessionId: session._id,
    reason: "declined_by_user",
  });

  console.log(
    "📤 EMITTING session_ringing_declined TO ASTRO ROOM:",
    String(session.astrologerId)
  );

  return res.json({ success: true });
};

/* ------------------------- DECLINE REQUEST (Astrologer)  ------------------------- */
export const declineChatRequest = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const astrologerId = req.user?.id || req.user?._id || req.user?.sub;
    if (!sessionId)
      return res
        .status(400)
        .json({ success: false, message: "sessionId required" });

    const request = await ChatRequest.findOne({
      sessionId: sessionId.toString(),
      astrologerId: new mongoose.Types.ObjectId(astrologerId),
    });

    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });

    request.status = "declined_by_astrologer";
    await request.save();

    // Notify user
    if (io) {
      io.of("/chat").to(String(request.userId)).emit("request_declined", {
        sessionId: request.sessionId,
      });
    }

    res.json({ success: true, request });
  } catch (e) {
    console.error("❌ declineChatRequest error", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------------- USER CANCEL REQUEST ------------------------- */
export const cancelChatRequest = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.body;

    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "Missing user id" });

    if (!sessionId)
      return res
        .status(400)
        .json({ success: false, message: "sessionId required" });

    const request = await ChatRequest.findOne({
      sessionId: sessionId.toString(),
      userId: userId,
      status: "pending",
    });

    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Pending request not found" });

    request.status = "cancelled_by_user";
    await request.save();

    return res.json({ success: true, request });
  } catch (e) {
    console.error("❌ cancelChatRequest error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------------- USER ACCEPT REQUEST ------------------------- */

export const userAcceptChat = async (req, res) => {
  const userId = req.user.id;
  const { sessionId } = req.body;

  const request = await ChatRequest.findOne({
    sessionId: sessionId.toString(),
    userId,
  });

  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  const session = await ChatSession.findById(request.sessionId);
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  if (session.status !== SESSION_STATES.RINGING_USER) {
    return res.status(400).json({
      message: `Cannot join session in state ${session.status}`,
    });
  }

  // 1️⃣ CONNECT THIS SESSION FIRST
  await connectSession(session);

  console.log("✅ Session after connect:", {
  id: session._id,
  status: session.status,
  type: session.type,
  connectedAt: session.connectedAt,
  roomId: session.roomId,
});


  // ✅ CHAT → NO CALL DATA
  if (request.type === "chat") {
    io.of("/chat").to(String(request.userId)).emit("session_connected", {
      sessionId: request.sessionId,
      roomId: request.roomId,
      type: "chat",
      role: "caller",
    });

    io.of("/chat").to(String(request.astrologerId)).emit("session_connected", {
      sessionId: request.sessionId,
      roomId: request.roomId,
      type: "chat",
      role: "callee",
    });
  }

  // ✅ CALL → SEND CALL DATA
  if (request.type === "call") {
    io.of("/chat").to(String(request.userId)).emit("session_connected", {
      sessionId: request.sessionId,
      roomId: request.roomId,
      type: "call",
      callChannel: request.callChannel,
      callToken: request.callCallerToken,
      callUid: request.callCallerUid,
      role: "caller",
    });

    io.of("/chat").to(String(request.astrologerId)).emit("session_connected", {
      sessionId: request.sessionId,
      roomId: request.roomId,
      type: "call",
      callChannel: request.callChannel,
      callToken: request.callCalleeToken,
      callUid: request.callCalleeUid,
      role: "callee",
    });
  }

  return res.json({ success: true });
};
