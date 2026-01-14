import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    items: [
      {
        kind: { type: String, enum: ['remedy', 'pooja'], required: true },
        refId: { type: mongoose.Schema.Types.ObjectId, required: true },
        title: String,
        price: Number,
        qty: { type: Number, default: 1 }
      }
    ],

    total: Number,

    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },

    paymentProvider: {
      type: String,
      enum: ['razorpay', 'stripe', 'mock'],
      default: 'mock'
    },

    paymentRef: String
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
