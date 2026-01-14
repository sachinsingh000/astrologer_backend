import { Server } from "socket.io";
import logger from "../config/logger.js";
import { registerChatNamespace } from "../sockets/chat.namespace.js";
import { registerCallNamespace } from "../sockets/call.namespace.js";
export let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });


  // ✅ Initialize namespaces
  registerChatNamespace(io.of("/chat"));
  registerCallNamespace(io.of("/call"));  

  logger.info("✅ Socket.IO initialized with /chat and /call namespaces");
}
