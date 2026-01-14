import { io } from "socket.io-client";

const socket = io("http://localhost:4000/chat", { transports: ["websocket"] });

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  socket.emit("join", "room_user123_astro456");

  // Simulate sending a message
  socket.emit("message", {
    roomId: "room_user123_astro456",
    from: "6911e6f8dfd94a3459056e74", // your userId
    to: "6911e38520a56880f660c2fc",   // test another user ID
    text: "Hey there from user!"
  });
});

socket.on("message", (msg) => {
  console.log("💬 Got message:", msg);
});

socket.on("connect_error", (err) => {
  console.error("❌ Connect error:", err.message);
});
