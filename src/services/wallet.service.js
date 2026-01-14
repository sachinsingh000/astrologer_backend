import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";

export async function getWallet(userId) {
  return Wallet.findOne({ user: userId });
}

export async function credit(userId, amount, ref = "", meta = {}) {
  const wallet = await Wallet.findOneAndUpdate(
    { user: userId },
    { $inc: { balance: amount } },
    { new: true, upsert: true }
  );

  await Transaction.create({
    user: userId,
    type: "credit",
    amount,
    ref,
    meta,
  });

  return wallet;
}

export async function debit(userId, amount, ref = "", meta = {}) {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet || wallet.balance < amount) {
    throw new Error("Insufficient balance");
  }

  wallet.balance -= amount;
  await wallet.save();

  await Transaction.create({
    user: userId,
    type: "debit",
    amount,
    ref,
    meta,
  });

  return wallet;
}
