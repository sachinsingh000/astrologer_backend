import ChatSession from "../models/ChatSession.js";
import Wallet from "../models/Wallet.js";
import { sendFCM } from "../utils/fcmSender.js";
import { NOTIFICATION_EVENTS } from "../constants/notificationEvents.js";

let timerStarted = false;

export function startBillingTimer(io) {
  if (timerStarted) return;
  timerStarted = true;

  console.log("💰 Billing timer started (1s tick)");

  setInterval(async () => {
    try {
      // ✅ BILL ONLY VALID, READY SESSIONS
      const sessions = await ChatSession.find({
        status: "CONNECTED",
        $or: [
          { type: "chat" },
          { type: "call"}, // IMPORTANT
        ],
      });

      for (const session of sessions) {
        // -------------------------------
        // SAFETY: WALLET
        // -------------------------------
        const wallet = await Wallet.findOne({ user: session.userId });
        if (!wallet) continue;

        const rate = session.ratePerMinute || 0;
        if (rate <= 0) continue;

        // -------------------------------
        // SAFETY: CONNECTION TIME
        // -------------------------------
        if (!session.connectedAt) continue;

        // -------------------------------
        // INIT BILLING FIELDS (IDEMPOTENT)
        // -------------------------------
        if (typeof session.lastBilledMinute !== "number") {
          session.lastBilledMinute = 0;
        }

        if (typeof session.warningSent !== "boolean") {
          session.warningSent = false;
        }

        // -------------------------------
        // TIME CALCULATION
        // -------------------------------
        const elapsedSeconds = Math.floor(
          (Date.now() - session.connectedAt.getTime()) / 1000
        );

        // Charge first minute immediately (business rule)
        const elapsedMinutes = Math.floor(elapsedSeconds / 60) + 1;

        // -------------------------------
        // BILLING LOGIC
        // -------------------------------
        if (elapsedMinutes > session.lastBilledMinute) {
          // ❌ INSUFFICIENT BALANCE → END SESSION
          if (wallet.balance < rate) {
            session.status = "ENDED";
            session.endsAt = new Date();
            session.isActive = false;
            await session.save();

            io?.of("/chat").to(session.roomId).emit("session_ended", {
              sessionId: session._id,
              reason: "balance_exhausted",
            });

            io?.of("/chat")
              .to(String(session.astrologerId))
              .emit("session_ended", {
                sessionId: session._id,
                reason: "balance_exhausted",
              });

            sendFCM({
              toUserId: session.userId,
              type: NOTIFICATION_EVENTS.CALL_ENDED,
              sessionId: session._id,
            });

            sendFCM({
              toUserId: session.astrologerId,
              type: NOTIFICATION_EVENTS.CALL_ENDED,
              sessionId: session._id,
            });

            continue;
          }

          // ✅ DEDUCT ONE FULL MINUTE
          wallet.balance -= rate;
          await wallet.save();

          session.lastBilledMinute = elapsedMinutes;
          await session.save();
        }

        // -------------------------------
        // LOW BALANCE WARNING (ONCE)
        // -------------------------------
        if (wallet.balance < rate && !session.warningSent) {
          session.warningSent = true;
          await session.save();

          io?.of("/chat").to(session.roomId).emit("low_balance_warning", {
            sessionId: session._id,
            remainingMinutes: 1,
          });

          sendFCM({
            toUserId: session.userId,
            type: NOTIFICATION_EVENTS.LOW_BALANCE,
            sessionId: session._id,
          });
        }

        // -------------------------------
        // LIVE TICKS (NON-BILLING)
        // -------------------------------
        console.log("📡 EMIT session_tick → ROOM", {
          roomId: session.roomId,
          sessionId: session._id.toString(),
          type: session.type,
          elapsedSeconds,
          wallet: wallet.balance,
        });

        io?.of("/chat").to(session.roomId).emit("session_tick", {
          event: "session_tick",
          sessionId: session._id,
          elapsedSeconds,
          wallet: wallet.balance,
          type: session.type,
        });

        io?.of("/chat")
          .to(String(session.astrologerId))
          .emit("session_tick", {
            sessionId: session._id,
            elapsedSeconds,
            earned: session.lastBilledMinute * rate,
          });

        console.log("💡 BILLING CHECK", {
          id: session._id,
          type: session.type,
          status: session.status,
          connectedAt: session.connectedAt,
          lastBilledMinute: session.lastBilledMinute,
          rate: session.ratePerMinute,
        });
      }
    } catch (err) {
      console.error("❌ Billing timer error:", err);
    }
  }, 1000);
}
