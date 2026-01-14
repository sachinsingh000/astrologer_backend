import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true },
    ref: { type: String }, // paymentId | orderId | chatId | custom ref
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
