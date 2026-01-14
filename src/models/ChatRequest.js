// src/models/ChatRequest.js
import mongoose from "mongoose";

const ChatRequestSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    roomId: { type: String, required: true },

    astrologerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Astrologer",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userName: { type: String, required: true },
    userImage: { type: String, default: "" },

    ratePerMinute: { type: Number, default: 0 },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "declined",
        "declined_by_astrologer",
        "cancelled_by_user",
        "expired",
      ],
      default: "pending",
    },

    type: { type: String, enum: ["chat", "call"], default: "chat" },

    // -------- CALL FIELDS --------
    callChannel: { type: String, default: "" },

    // caller = USER app side
    callCallerUid: { type: Number, default: null },
    callCallerToken: { type: String, default: "" },

    // callee = ASTROLOGER app side
    callCalleeUid: { type: Number, default: null },
    callCalleeToken: { type: String, default: "" },

    // additional data
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("ChatRequest", ChatRequestSchema);