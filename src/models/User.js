import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: String,
    phone: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    password: String,
    role: {
      type: String,
      enum: ["user", "astrologer", "admin"],
      default: "user",
    },
    profile: {
  dob: Date,
  tob: String,
  gender: String,
  placeOfBirth: String,
},


  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (pwd) {
  return bcrypt.compare(pwd, this.password || "");
};

export default mongoose.model("User", userSchema);
