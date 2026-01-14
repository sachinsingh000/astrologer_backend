import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    roomId: { type: String, index: true, required: true },
    from: { type: String, required: true }, 
    to: { type: String },
    text: { type: String, trim: true },
    attachments: [{ type: String }],
    read: { type: Boolean, default: false },
    meta: { type: Object }
  },
  { timestamps: true }
);

export default mongoose.models.ChatMessage ||
  mongoose.model("ChatMessage", chatMessageSchema);
