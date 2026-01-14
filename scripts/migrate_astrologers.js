import mongoose from "mongoose";
import dotenv from "dotenv";
import Astrologer from "../src/models/Astrologer.js";

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB\n");

    const all = await Astrologer.find();

    for (const astro of all) {
      const updates = {};

      if (astro.chatPrice === undefined)
        updates.chatPrice = astro.pricePerMinute || 10;

      if (astro.callPrice === undefined)
        updates.callPrice = astro.pricePerMinute || 10;

      if (astro.skills === undefined)
        updates.skills = [];

      if (astro.bio === undefined)
        updates.bio = "";

      if (astro.isChatAvailable === undefined)
        updates.isChatAvailable = true;

      if (astro.isCallAvailable === undefined)
        updates.isCallAvailable = true;

      if (Object.keys(updates).length > 0) {
        await Astrologer.findByIdAndUpdate(astro._id, { $set: updates });
        console.log(`Updated: ${astro.name}`, updates);
      }
    }

    console.log("\nMigration completed.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
})();
