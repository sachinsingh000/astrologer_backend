import { Router } from "express";
import {
  register,
  loginUser,
  loginAstrologer,
  registerAstrologer
} from "../controllers/auth.controller.js";

const r = Router();

r.post("/register", register);
r.post("/login", loginUser);                


export default r;
