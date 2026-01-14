import express from "express";
import mongoose from "mongoose";
import {
  verifyAstrologerToken,
  createAstrologer,
  getAllAstrologers,
  getAstrologerById,
  getMyAstrologer,
  updateMyAstrologer
} from "../controllers/astrologer.controller.js";

import { auth } from "../middleware/auth.js";

const router = express.Router();


router.get("/verify-token", auth, verifyAstrologerToken);

// Create astrologer (admin only normally)
router.post("/", createAstrologer);

// Get all astrologers (public)
router.get("/", getAllAstrologers);

// FILTER: astrologers available for CALL
router.get("/call", async (req, res) => {
  const list = await mongoose.model("Astrologer").find({
    isCallAvailable: true
  }).sort({ online: -1, rating: -1 });

  res.json(list);
});

// FILTER: astrologers available for CHAT
router.get("/chat", async (req, res) => {
  const list = await mongoose.model("Astrologer").find({
    isChatAvailable: true
  }).sort({ online: -1, rating: -1 });

  res.json(list);
});

// 🔒 Authenticated astrologer profile
router.get("/me", auth, getMyAstrologer);
router.patch("/me", auth, updateMyAstrologer);

// Get astrologer by ID (public)
router.get("/:id", getAstrologerById);

export default router;
