// src/controllers/astrologer.controller.js
import asyncHandler from "../utils/asyncHandler.js";
import Astrologer from "../models/Astrologer.js";

// ------------------------------------------------------
// CREATE ASTROLOGER (ADMIN USE OR TEMP PUBLIC CREATION)
// ------------------------------------------------------
export const createAstrologer = asyncHandler(async (req, res) => {
  const data = req.body;

  const astro = await Astrologer.create(data);

  res.status(201).json({
    success: true,
    astrologer: astro
  });
});

// ------------------------------------------------------
// GET ALL ASTROLOGERS (PUBLIC)
// ------------------------------------------------------
export const getAllAstrologers = asyncHandler(async (req, res) => {
  const list = await Astrologer.find().sort({ online: -1, rating: -1 });
  res.json({
    success: true,
    data: list
  });
});

// ------------------------------------------------------
// GET ASTROLOGER BY ID
// ------------------------------------------------------
export const getAstrologerById = asyncHandler(async (req, res) => {
  const astro = await Astrologer.findById(req.params.id);

  if (!astro)
    return res.status(404).json({ message: "Astrologer not found" });

  res.json({
    success: true,
    astrologer: astro
  });
});

// ------------------------------------------------------
// GET MY ASTROLOGER PROFILE (AUTH REQUIRED)
// ------------------------------------------------------
export const getMyAstrologer = asyncHandler(async (req, res) => {
  const astrologerId = req.user.id; // JWT sub

  const astro = await Astrologer.findById(astrologerId).lean();

  if (!astro)
    return res.status(404).json({ message: "Astrologer profile not found" });

  res.json({
    success: true,
    astrologer: astro
  });
});

// ------------------------------------------------------
// UPDATE MY ASTROLOGER PROFILE (AUTH REQUIRED)
// ------------------------------------------------------
export const updateMyAstrologer = asyncHandler(async (req, res) => {
  const astrologerId = req.user.id;

  const astro = await Astrologer.findByIdAndUpdate(
    astrologerId,
    req.body,
    { new: true }
  ).lean();

  if (!astro)
    return res.status(404).json({ message: "Astrologer profile not found" });

  res.json({
    success: true,
    astrologer: astro
  });
});


// ------------------------------------------------------
// VERIFY ASTROLOGER TOKEN (AUTH REQUIRED)
// ------------------------------------------------------

export const verifyAstrologerToken = asyncHandler(async (req, res) => {
  if (req.user.role !== "astrologer") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const astro = await Astrologer.findById(req.user.id).select("_id");

  if (!astro) {
    return res.status(401).json({ message: "Invalid token" });
  }

  res.json({
    success: true,
    astrologerId: astro._id
  });
});

