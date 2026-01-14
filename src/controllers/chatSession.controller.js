// src/controllers/chatSession.controller.js
import asyncHandler from "../utils/asyncHandler.js";
import ChatSession from "../models/ChatSession.js";
import User from "../models/User.js";
import Astrologer from "../models/Astrologer.js";
import ChatMessage from "../models/ChatMessage.js";
import { createChatRequest } from "./chatRequest.controller.js";
import { generateAgoraTokenForUid } from "../services/agora.service.js";
import { hashStringToNumber } from "../utils/agora.js";
import Wallet from "../models/Wallet.js";
import {
  transitionSession,
  SESSION_STATES,
} from "../utils/sessionTransition.js";
import ChatRequest from "../models/ChatRequest.js";
``;
/**
 * POST /api/chat-session/start
 * body: { astrologerId }
 * auth required (req.user.id expected)
 *
 * Behaviour:
 * - Check astrologer exists & chat available
 * - Check user.wallet >= rate*5
 * - Deduct upfront for 5 minutes
 * - Create ChatSession with endsAt = now + 5min and isActive=false (running will start when astrologer replies)
 * - Respond with roomId and session
 */
// helpers

export const startChat = asyncHandler(async (req, res) => {
  console.log(
    "📥 USER START SESSION:",
    req.user.id,
    "->",
    req.body.astrologerId
  );

  const userId = req.user.id;
  const { astrologerId, type = "chat" } = req.body;

  const sessionType = type === "call" ? "call" : "chat";
const pendingSession = await ChatSession.findOne({
  userId,
  status: "CONNECTED",
  isActive: true,
});

  if (pendingSession) {
    console.log("🚨 BLOCKED BY SESSION:", {
      sessionId: pendingSession._id,
      status: pendingSession.status,
      isActive: pendingSession.isActive,
      startedAt: pendingSession.startedAt,
    });
    return res.status(400).json({
      message: "Session already in progress",
    });
  }

  if (!astrologerId)
    return res.status(400).json({ message: "astrologerId required" });

  const astro = await Astrologer.findById(astrologerId);
  if (!astro) return res.status(404).json({ message: "Astrologer not found" });
  if (!astro.isChatAvailable)
    return res.status(400).json({ message: "Astrologer not available" });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // const rate = astro.chatPrice || astro.pricePerMinute || 0;
  let rate = 0;

if (sessionType === "chat") {
  rate = astro.chatPrice || 0;
}

if (sessionType === "call") {
  rate = astro.callPrice || 0;
}
  const need = rate * 5;
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    return res.status(500).json({ message: "Wallet not initialized" });
  }

  if (wallet.balance < need) {
    return res.status(402).json({
      message: "Insufficient balance",
      need,
      balance: wallet.balance,
    });
  }

  // Deduct 5 mins upfront

  // const roomId = `${userId}_${astrologerId}`;
  const roomId = `${userId}_${astrologerId}_${Date.now()}`;

  const session = await ChatSession.findOneAndUpdate(
    { roomId },
    {
      $setOnInsert: {
        roomId,
        userId,
        astrologerId,
        ratePerMinute: rate,
        status: SESSION_STATES.CREATED,
        isActive: false,
        type: sessionType,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  // 🔒 BACKEND AUTHORITY: move to REQUESTED
  transitionSession(session, SESSION_STATES.REQUESTED);
  await session.save();

  // If call → create agora channel/token pair for caller & callee
  let callChannel = null;
  let callerToken = null;
  let callerUid = null;
  let calleeUid = null;
  let calleeToken = null;

  if (type === "call") {
    callChannel = `CALL_${Date.now()}_${session._id}`;

    // deterministic caller uid from userId (server-controlled)
    callerUid = hashStringToNumber(userId.toString());
    if (!Number.isInteger(callerUid) || callerUid <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid computed caller uid" });
    }

    // deterministic callee uid from astrologerId (stable, avoids collisions)
    calleeUid = hashStringToNumber(astrologerId.toString());
    if (!Number.isInteger(calleeUid) || calleeUid <= 0) {
      // fallback to random if something weird
      calleeUid = Math.floor(Math.random() * 100000000) + 1000;
    }

    // build tokens
    callerToken = generateAgoraTokenForUid(callerUid, callChannel);
    calleeToken = generateAgoraTokenForUid(calleeUid, callChannel);
    // ---------------------logs -----------------------------//
    console.log("========== AGORA TOKEN DEBUG ==========");
    console.log("[AGORA TOKENS] channel =", callChannel);
    console.log("[AGORA TOKENS] callerUid =", callerUid);
    console.log("[AGORA TOKENS] calleeUid =", calleeUid);
    console.log("[AGORA TOKENS] callerToken len =", (callerToken || "").length);
    console.log("[AGORA TOKENS] calleeToken len =", (calleeToken || "").length);
    console.log(
      "[AGORA TOKENS] callerToken sample =",
      (callerToken || "").slice(0, 40)
    );
    console.log(
      "[AGORA TOKENS] calleeToken sample =",
      (calleeToken || "").slice(0, 40)
    );
    console.log("========================================");

    if (!Number.isInteger(callerUid))
      console.error(">> callerUid NOT integer:", callerUid);
    if (!Number.isInteger(calleeUid))
      console.error(">> calleeUid NOT integer:", calleeUid);
    // ---------------------logs -----------------------------//
  }

  // Save ChatRequest with tokens/uids persisted
  const result = await createChatRequest({
    sessionId: session._id,
    roomId,
    astrologerId,
    userId,
    userName: user.name,
    userImage: user.avatar,
    ratePerMinute: rate,
    type,
    callChannel,
    callCallerUid: callerUid,
    callCallerToken: callerToken,
    callCalleeUid: calleeUid,
    callCalleeToken: calleeToken,
    meta: {},
  });

  if (result.duplicate) return res.json(result);

  return res.json(result);
});

/**
 * POST /api/chat-session/extend
 * body: { sessionId }
 * Auth required: user
 */
export const extendChat = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { sessionId } = req.body;
  if (!sessionId)
    return res.status(400).json({ message: "sessionId required" });

  const session = await ChatSession.findById(sessionId);
  if (!session) return res.status(404).json({ message: "Session not found" });
  if (String(session.userId) !== String(userId))
    return res.status(403).json({ message: "Not your session" });

  const need = (session.ratePerMinute || 0) * 5;

  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    return res.status(500).json({ message: "Wallet not initialized" });
  }

  if (wallet.balance < need) {
    return res.status(402).json({
      message: "Insufficient balance",
      need,
      balance: wallet.balance,
    });
  }

  // ❗ DO NOT DEDUCT HERE ❗
  // Billing timer handles all deductions

  session.endsAt = new Date(session.endsAt.getTime() + 5 * 60000);
  session.totalMinutes += 5;
  session.amountDeducted += need;
  session.status = "running";
  session.isActive = true;
  await session.save();

  // notify socket room
  try {
    const io = req.app.get("io");
    if (io)
      io.of("/chat").to(session.roomId).emit("session_extended", {
        sessionId: session._id,
        endsAt: session.endsAt,
      });
  } catch (e) {}

  res.json({ ok: true, session });
});

/**
 * POST /api/chat-session/end
 * body: { sessionId, reason? }
 * Auth required for either party
 */
export const endChat = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { sessionId, reason = "ended_by_user" } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: "sessionId is required" });
  }

  const session = await ChatSession.findById(sessionId);
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  const allowed =
    String(session.userId) === String(userId) ||
    String(session.astrologerId) === String(userId) ||
    req.user.role === "admin";

  if (!allowed) {
    return res.status(403).json({ message: "Not authorized" });
  }

  // Idempotent guard
  if (session.status === "ENDED") {
    return res.json({ ok: true, alreadyEnded: true });
  }

  // 🔒 NO BILLING HERE
  session.isActive = false;
  session.status = "ENDED";
  session.endsAt = new Date();
  await session.save();

  // Update related requests
  try {
    await ChatRequest.updateMany(
      { sessionId: session._id, status: { $ne: "ENDED" } },
      { $set: { status: "ENDED" } }
    );
  } catch (e) {
    console.warn("Could not update ChatRequest status:", e);
  }

  const io = req.app.get("io");
  const payload = {
    sessionId: session._id,
    reason,
    endedBy: String(userId),
  };

  if (io) {
    io.of("/chat").to(session.roomId).emit("session_ended", payload);
    io.of("/chat").to(String(session.userId)).emit("session_ended", payload);
    io.of("/chat")
      .to(String(session.astrologerId))
      .emit("session_ended", payload);
  }

  return res.json({ ok: true });
});

// listing chats
export const listSessions = asyncHandler(async (req, res) => {
  const astroId = req.user.id;

  const active = await ChatSession.find({
    astrologerId: astroId,
    isActive: true,
  }).populate("userId", "name avatar");

  const past = await ChatSession.find({
    astrologerId: astroId,
    isActive: false,
  }).populate("userId", "name avatar");

  res.json({
    active,
    past,
  });
});
