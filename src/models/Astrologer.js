// src/models/Astrologer.js
import mongoose from "mongoose";

const astrologerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, sparse: true }, // link to user
    customId: { type: String, unique: true, sparse: true },

    // BASIC FIELDS
    name: { type: String, required: true },
    image: { type: String, default: "" },

    // MULTI SELECT FIELDS
    languages: [{ type: String, default: [] }],
    skills: [{ type: String, default: [] }],

    // PROFESSIONAL DETAILS
    experience: { type: String, default: "" },
    bio: { type: String, default: "" },

    // PRICING
    chatPrice: { type: Number, default: 10 },
    callPrice: { type: Number, default: 10 },

    // AVAILABILITY FLAGS
    isChatAvailable: { type: Boolean, default: true },
    isCallAvailable: { type: Boolean, default: true },

    // EXISTING FIELDS (KEEPING THEM)
    pricePerMinute: { type: Number, default: 10 },
    totalOrders: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },

    // RUNTIME STATUS
    online: { type: Boolean, default: true },

    // STATUS
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },

  },
  { timestamps: true }
);

// Auto-generate customId if missing
astrologerSchema.pre("save", async function (next) {
  if (!this.customId) {
    const count = await mongoose.model("Astrologer").countDocuments();
    this.customId = "ASTRO_" + String(count + 1).padStart(4, "0");
  }
  next();
});

export default mongoose.model("Astrologer", astrologerSchema);
