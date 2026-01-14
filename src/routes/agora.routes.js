// src/routes/agora.routes.js
import { Router } from 'express';
import { getAgoraToken } from "../controllers/agora.controller.js"; 
import { auth } from '../middleware/auth.js';

const r = Router();
// require authenticated users
r.post('/token', auth, getAgoraToken);

export default r;
