import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";

export function registerChatNamespace(chatNS) {
  console.log("📡 Chat namespace active");

  // periodic expiry checker (server enforced)
  setInterval(async () => {
    const now = new Date();
    const sessions = await ChatSession.find({
      isActive: true,
      endsAt: { $lte: now },
    });
    for (const session of sessions) {
      session.isActive = false;
      // session.status = "expired";
      session.status = "EXPIRED";
      await session.save();
      chatNS.to(session.roomId).emit("session_expired", {
        sessionId: session._id,
        message: "Your chat time has ended",
      });
    }
  }, 5000);

  const onlineUsers = new Map();

  chatNS.on("connection", (socket) => {
    console.log("💬 Connected:", socket.id);
    console.log("🔥 CHAT SOCKET CONNECTED:", socket.id);

    socket.on("join", ({ roomId, userId }) => {
      socket.join(roomId);
      socket.join(String(userId));
      socket.data.userId = userId;
      socket.data.roomId = roomId;

      if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
      onlineUsers.get(userId).add(socket.id);

      chatNS.to(roomId).emit("presence", { userId, online: true });
    });

    socket.on("typing", ({ roomId, userId, typing }) => {
      socket.to(roomId).emit("typing", { userId, typing });
    });

socket.on("send_message", async (msg) => {
  try {
    const session = await ChatSession.findOne({ roomId: msg.roomId });

    if (!session) {
      socket.emit("blocked", { message: "Session not found" });
      return;
    }

    // Soft guard only
    if (session.status === "ENDED" || session.status === "EXPIRED") {
      socket.emit("blocked", { message: "Session ended" });
      return;
    }

    const saved = await ChatMessage.create({
      roomId: msg.roomId,
      from: socket.data.userId, // ✅ FIX
      to: msg.to,
      text: msg.text,
    });

    chatNS.to(msg.roomId).emit("message", saved);
  } catch (err) {
    console.error("❌ send_message failed:", err);
    socket.emit("blocked", { message: "Message failed to send" });
  }
});



    socket.on("read", async ({ roomId, userId }) => {
      await ChatMessage.updateMany(
        { roomId, to: userId, read: false },
        { $set: { read: true } }
      );
      chatNS.to(roomId).emit("read", { userId });
    });

    socket.on("join_astrologer", ({ astroId }) => {
      socket.join(String(astroId));
      console.log("🟢 Astrologer joined own channel:", astroId);
    });

    socket.on("join_user", ({ userId }) => {
      socket.join(String(userId));
      console.log("🟢 User joined personal room:", userId);
    });

    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      if (userId && onlineUsers.has(userId)) {
        onlineUsers.get(userId).delete(socket.id);
        if (onlineUsers.get(userId).size === 0) {
          onlineUsers.delete(userId);
          chatNS.emit("presence", { userId, online: false });
        }
      }
      console.log("❌ Disconnected:", socket.id);
    });
  });
}
