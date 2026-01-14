import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Astrologer from "../models/Astrologer.js";
import { env } from "../config/env.js";
import Wallet from "../models/Wallet.js";

const SALT_ROUNDS = 10;

// ------------------ USER REGISTER ------------------
export async function register(payload) {
  const { name, email, phone, password, role = "user" } = payload;

  const hashed = password ? await bcrypt.hash(password, SALT_ROUNDS) : undefined;

  const user = await User.create({
    name,
    email,
    phone,
    password: hashed,
    role,
  });

    await Wallet.create({
    user: user._id,
    balance: 0,
  });

  return user.toObject();
}

// ------------------  LOGIN ------------------
export async function loginCombined({ email, phone, password }) {
  let user;

  if (email) user = await User.findOne({ email });
  else if (phone) user = await User.findOne({ phone });

  if (!user) return { error: "User not found" };

  const ok = await bcrypt.compare(password, user.password || "");
  if (!ok) return { error: "Invalid password" };

  const userObj = user.toObject();
  delete userObj.password;

  // If astrologer → fetch astrologer profile
  if (user.role === "astrologer") {
    const astro = await Astrologer.findOne({ userId: user._id });

    if (!astro) return { error: "Astrologer profile missing" };
    if (astro.status !== "approved") {
      return { error: "Your astrologer profile is not approved yet" };
    }

    const astroObj = astro.toObject();
    astroObj._id = String(astroObj._id);

    const token = jwt.sign(
      { sub: String(astroObj._id), role: "astrologer" },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: userObj,
      astrologer: astroObj,
      token
    };
  }

  // If normal user
  const token = jwt.sign(
    { sub: String(user._id), role: "user" },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user: userObj, astrologer: null, token };
}


// ------------------ REGISTER ASTROLOGER ------------------
export async function registerAstrologer(payload) {
  const {
    name, email, phone, password,
    languages, skills, experience, bio,
    chatPrice, callPrice, image, gender,
  } = payload;

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    phone,
    password: hashed,
    role: "astrologer",
  });

  const astro = await Astrologer.create({
    userId: user._id,
    name,
    languages,
    skills,
    experience,
    bio,
    chatPrice,
    callPrice,
    image,
    status: "pending",
  });

  return {
    user: user.toObject(),
    astrologer: astro.toObject()
  };
}
