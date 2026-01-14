import mongoose from "mongoose";

const remedySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: String,
    price: Number,
    status: { type: String, enum: ["suggested", "purchased"], default: "suggested" },
    astrologer: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
    meta: Object,
  },
  { timestamps: true }
);

export default mongoose.model("Remedy", remedySchema);
