import mongoose from 'mongoose';

const poojaSchema = new mongoose.Schema(
  {
    title: String,
    image: String,
    price: { type: Number, default: 0 },
    durationMin: Number,
    description: String
  },
  { timestamps: true }
);

export default mongoose.model('Pooja', poojaSchema);
