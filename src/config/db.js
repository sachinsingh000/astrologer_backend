import mongoose from "mongoose";
import { env } from "./env.js";
import logger from "./logger.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      dbName: "astrotalk",
      autoIndex: true
    });
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
