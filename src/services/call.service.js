import CallSession from "../models/CallSession.js";

/**
 * Create a new call session (when user starts a call)
 */
export async function createCall({ channel, token, callerId, astrologerId }) {
  return await CallSession.create({
    channel,
    token,
    callerId,
    astrologerId,
    startTime: new Date(),
  });
}

/**
 * Mark call as accepted
 */
export async function acceptCall(callId) {
  return CallSession.findByIdAndUpdate(
    callId,
    { status: "accepted" },
    { new: true }
  );
}

/**
 * End the call and calculate the cost
 */
export async function endCall(callId) {
  const call = await CallSession.findById(callId);

  if (!call) return null;

  call.endTime = new Date();
  call.durationSecs = Math.floor((call.endTime - call.startTime) / 1000);

  // Example cost: ₹10/min
  call.cost = Math.ceil(call.durationSecs / 60) * 10;

  call.status = "ended";
  await call.save();

  return call;
}

/**
 * Get call details
 */
export async function getCall(callId) {
  return CallSession.findById(callId);
}
