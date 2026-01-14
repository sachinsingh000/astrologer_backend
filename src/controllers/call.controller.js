import * as CallService from "../services/call.service.js";
import { io } from "../loaders/socket.js";
import { generateAgoraTokenForUid } from "../services/agora.service.js";

export async function startCall(req, res) {
  const { astrologerId } = req.body;
  const callerId = req.user.id;

  const channel = "CALL_" + Date.now();
  const token = generateAgoraTokenForUid(callerId, channel);

  const call = await CallService.createCall({
    channel,
    token,
    callerId,
    astrologerId
  });

  // notify astrologer via sockets
  io.of("/chat").to(astrologerId).emit("incoming_call", {
    channel,
    token,
    callerId,
    callId: call._id
  });

  res.json({ channel, token, callId: call._id });
}

export async function acceptCall(req, res) {
  const { callId } = req.body;
  await CallService.acceptCall(callId);
  res.json({ ok: true });
}

export async function endCall(req, res) {
  const { callId } = req.body;
  const call = await CallService.endCall(callId);
  res.json({
    ok: true,
    duration: call.durationSecs,
    cost: call.cost
  });
}
