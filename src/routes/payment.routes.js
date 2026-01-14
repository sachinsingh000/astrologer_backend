import { Router } from "express";
import { auth } from "../middleware/auth.js";
import * as PaymentController from "../controllers/payment.controller.js";

const router = Router();

router.post("/order", auth, PaymentController.createOrder);
router.post("/confirm", auth, PaymentController.confirm);

export default router;
