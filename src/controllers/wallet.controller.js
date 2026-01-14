import asyncHandler from "../utils/asyncHandler.js";
import * as walletService from "../services/wallet.service.js";

export const getWallet = asyncHandler(async (req, res) => {
  const wallet = await walletService.getWallet(req.user.id);
  res.json({ wallet });
});

export const credit = asyncHandler(async (req, res) => {
  const { amount, ref, meta } = req.body;
  const wallet = await walletService.credit(req.user.id, amount, ref, meta);
  const io = req.app.get("io");
  if (io) {
    io.of("/chat").to(req.user.id.toString()).emit("wallet_updated", {
      wallet: wallet.balance,
    });
  }

  res.json({ wallet });
});

export const debit = asyncHandler(async (req, res) => {
  const { amount, ref, meta } = req.body;
  const wallet = await walletService.debit(req.user.id, amount, ref, meta);
  res.json({ wallet });
});
