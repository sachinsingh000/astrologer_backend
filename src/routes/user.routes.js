// src/routes/user.routes.js
import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { auth } from "../middleware/auth.js";

const r = Router();

r.get("/profile", auth, getProfile);
r.patch("/profile", auth, updateProfile);

export default r;
