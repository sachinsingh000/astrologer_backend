import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, index: true },
    balance: { type: Number, default: 0 } 
  },
  { timestamps: true }
);

export default mongoose.model('Wallet', walletSchema);
