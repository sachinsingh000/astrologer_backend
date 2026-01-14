import { io } from "socket.io-client";

function createClient(name) {
  const socket = io("ws://127.0.0.1:4000/chat", {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log(`✅ ${name} connected:`, socket.id);
    socket.emit("join", "room1");

    // Wait 1 second and send a message
    setTimeout(() => {
      socket.emit("message", { roomId: "room1", text: `Hello from ${name}!` });
    }, 1000);
  });

  socket.on("message", (msg) => {
    console.log(`💬 ${name} received:`, msg);
  });

  socket.on("disconnect", () => {
    console.log(`⚠️ ${name} disconnected`);
  });

  socket.on("connect_error", (err) => {
    console.error(`❌ ${name} connection error:`, err.message);
  });

  return socket;
}

// Simulate two users
const userA = createClient("User A");
const userB = createClient("User B");

// Optional: close them after 10s
setTimeout(() => {
  userA.close();
  userB.close();
  console.log("🛑 Test finished.");
}, 10000);
