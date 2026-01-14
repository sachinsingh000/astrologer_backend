// src/routes/chatSession.route.js
import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { startChat, extendChat, endChat, listSessions, } from "../controllers/chatSession.controller.js";
const r = Router();

r.post("/start", auth, startChat);
r.post("/extend", auth, extendChat);
r.post("/end", auth, endChat);
r.get("/list", auth, listSessions);


export default r;   
