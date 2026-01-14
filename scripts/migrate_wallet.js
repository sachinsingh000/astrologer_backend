import mongoose from "mongoose";
import User from "../src/models/User.js";
import Wallet from "../src/models/Wallet.js";

await mongoose.connect("mongodb://localhost:27017/astrotalk");

const users = await User.find({});

for (const user of users) {
  const exists = await Wallet.findOne({ user: user._id });

  if (!exists) {
    await Wallet.create({
      user: user._id,
      balance: user.wallet ?? 0, // fallback if old field exists
    });

    console.log("✅ Wallet created for", user.email);
  }
}

console.log("🎯 Wallet migration done");
process.exit();
