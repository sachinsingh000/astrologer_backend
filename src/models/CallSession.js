import mongoose from "mongoose";

const callSessionSchema = new mongoose.Schema(
  {
    channel: { type: String, required: true },
    token: { type: String, required: false },

    callerId: { type: String, required: true },        // Caller
    astrologerId: { type: String, required: true },    // Receiver

    status: {
      type: String,
      enum: ["ringing", "accepted", "ended", "rejected", "missed"],
      default: "ringing"
    },

    startTime: Date,
    endTime: Date,
    durationSecs: Number,
    cost: Number,

     warningSent: {
    type: Boolean,
    default: false,
  },
  
  },

  { timestamps: true }
);

export default mongoose.model("CallSession", callSessionSchema);
