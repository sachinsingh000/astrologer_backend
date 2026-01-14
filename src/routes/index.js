import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import walletRoutes from './wallet.routes.js';
import remediesRoutes from './remedies.routes.js';
import poojaRoutes from './pooja.routes.js';
import paymentRoutes from './payment.routes.js';
 import chatRoutes from './chat.routes.js';
import agoraRoutes from './agora.routes.js';
import otpRoutes from './otp.routes.js';
import astrologerRoutes from './astrologer.routes.js';
import callRoutes from "./call.routes.js";
import chatSessionRoutes from "./chatSession.route.js";
import chatRequestRoutes from "./chatRequest.route.js";
import { registerFcmToken } from "../controllers/fcm.controller.js";
import { auth as authMiddleware } from "../middleware/auth.js";

const router = Router();


router.get("/health", (_req, res) => {
  res.json({ ok: true });
});


router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/wallet', walletRoutes);
router.use('/remedies', remediesRoutes);
router.use('/pooja', poojaRoutes);
router.use('/payments', paymentRoutes);
router.use('/chat', chatRoutes);
router.use('/agora', agoraRoutes);
router.use("/otp", otpRoutes);
router.use("/astrologers", astrologerRoutes);
router.use("/call", callRoutes);
router.use("/chat-session", chatSessionRoutes);
router.use("/chat-request", chatRequestRoutes);
router.post("/fcm/register", authMiddleware, registerFcmToken);



export default router;
