import Order from "../models/Order.js";

export async function createOrder({ userId, items, total, provider = "mock" }) {
  const order = await Order.create({
    user: userId,
    items,
    total,
    status: "pending",
    paymentProvider: provider,
  });

  return {
    order,
    providerPayload: {
      mockOrderId: order._id.toString(),
    },
  };
}

export async function confirmPayment({ orderId, paymentRef, success }) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  order.status = success ? "paid" : "failed";
  order.paymentRef = paymentRef;
  await order.save();

  return order;
}
