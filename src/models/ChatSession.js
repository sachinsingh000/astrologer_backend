// server/models/ChatSession.js

import mongoose from "mongoose";

const ChatSessionSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true, unique: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    astrologerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔒 CANONICAL SESSION STATES (DAY-1 LOCKED)
    status: {
      type: String,
      enum: [
        "CREATED", // session object created
        "REQUESTED", // chat request sent
        "ACCEPTED", // astrologer accepted
        "RINGING_USER", // call initiated, user ringing
        "CONNECTED", // call connected (billing ON)
        "ENDED", // normal end
        "EXPIRED", // prepaid time exhausted
        "MISSED", // user didn’t accept call
        "CANCELLED", // cancelled before connect
      ],
      default: "CREATED",
      index: true,
    },
    type: {
      type: String,
      enum: ["chat", "call"],
      required: true,
      index: true,
    },
    isActive: { type: Boolean, default: false, index: true },

    // ---- Billing / lifecycle ----
    ratePerMinute: { type: Number, default: 0 },

    connectedAt: { type: Date }, // billing reference start
    lastHeartbeatAt: { type: Date }, // liveness check
    endsAt: { type: Date }, // prepaid end time

    lastBilledMinute: { type: Number, default: 0 },
    warningSent: { type: Boolean, default: false },

    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("ChatSession", ChatSessionSchema);
