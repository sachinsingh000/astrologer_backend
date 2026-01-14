import { Router } from "express";
import { startCall, acceptCall, endCall } from "../controllers/call.controller.js";
import { auth } from "../middleware/auth.js";

const r = Router();

r.post("/start", auth, startCall);
r.post("/accept", auth, acceptCall);
r.post("/end", auth, endCall);

export default r;
