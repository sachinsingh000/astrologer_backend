import http from 'http';
import app from './app.js';
import { initSocket, io } from './loaders/socket.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { startBillingTimer } from "./services/billingTimer.service.js";
import "./loaders/firebase.js";
import ChatSession from "./models/ChatSession.js";

const server = http.createServer(app);

await connectDB();

initSocket(server); // socket.io + namespaces
app.set("io", io);

//billing timer

startBillingTimer(io);
console.log("MODEL CHECK:", ChatSession.collection.name);
server.listen(env.PORT, "0.0.0.0", () => {
  console.log(`API listening on http://0.0.0.0:${env.PORT}`);
});

