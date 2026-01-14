import CallSession from "../models/CallSession.js";

export function registerCallNamespace(callNS) {
  console.log("📞 Call namespace active");

  callNS.on("connection", (socket) => {
    console.log("📞 Connected call socket:", socket.id);

    // ------------------------------
    // USER STARTS CALL
    // ------------------------------
    socket.on("call:start", async ({ callerId, astrologerId, channel, token }) => {
      // Save session as ringing
      const session = await CallSession.create({
        callerId,
        astrologerId,
        channel,
        token,
        status: "ringing",
      });

      socket.join(channel);

      // Notify astrologer → incoming call popup
      callNS.emit(`incoming:${astrologerId}`, {
        sessionId: session._id,
        callerId,
        astrologerId,
        channel,
      });
    });

    // ------------------------------
    // ASTRO ACCEPTS CALL
    // ------------------------------
    socket.on("call:accept", async ({ sessionId }) => {
      await CallSession.findByIdAndUpdate(sessionId, {
        status: "accepted",
        startTime: new Date(),
      });

      callNS.emit(`call:accepted:${sessionId}`);
    });

    // ------------------------------
    // END CALL
    // ------------------------------
    socket.on("call:end", async ({ sessionId }) => {
      const end = new Date();
      const session = await CallSession.findById(sessionId);

      const duration = Math.floor((end - session.startTime) / 1000);

      await CallSession.findByIdAndUpdate(sessionId, {
        status: "ended",
        endTime: end,
        durationSecs: duration,
      });

      callNS.emit(`call:ended:${sessionId}`);
    });
  });
}
