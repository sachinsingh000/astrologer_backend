// src/models/FcmToken.js
import mongoose from "mongoose";

const FcmTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },

    platform: {
      type: String,
      enum: ["android", "ios", "web"],
      default: "android",
    },
  },
  { timestamps: true }
);

export default mongoose.model("FcmToken", FcmTokenSchema);
