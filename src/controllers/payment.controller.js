import * as PaymentService from '../services/payment.service.js';
import asyncHandler from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const result = await PaymentService.createOrder({
    userId: req.user.id,
    ...req.body
  });
  res.status(201).json(result);
});

export const confirm = asyncHandler(async (req, res) => {
  const order = await PaymentService.confirmPayment(req.body);
  res.json(order);
});
 