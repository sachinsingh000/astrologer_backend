// src/utils/sessionTransition.js

export const SESSION_STATES = {
  CREATED: "CREATED",
  REQUESTED: "REQUESTED",
  ACCEPTED: "ACCEPTED",
  RINGING_USER: "RINGING_USER",
  CONNECTED: "CONNECTED",
  ENDED: "ENDED",
  EXPIRED: "EXPIRED",
  MISSED: "MISSED",
  CANCELLED: "CANCELLED",
};

// Allowed transitions map (THE LAW)
const ALLOWED_TRANSITIONS = {
  CREATED: ["REQUESTED", "CANCELLED"],
  REQUESTED: ["ACCEPTED", "CANCELLED", "EXPIRED"],
  ACCEPTED: ["RINGING_USER", "CANCELLED"],
  RINGING_USER: ["CONNECTED", "MISSED", "CANCELLED"],
  CONNECTED: ["ENDED", "EXPIRED"],
  ENDED: [],
  EXPIRED: [],
  MISSED: [],
  CANCELLED: [],
};

/**
 * Enforce legal session state transitions.
 * Throws if an illegal transition is attempted.
 */
export function transitionSession(session, nextState) {
  if (!session || !session.status) {
    throw new Error("Invalid session object");
  }

  const currentState = session.status;
  const allowed = ALLOWED_TRANSITIONS[currentState] || [];

  if (!allowed.includes(nextState)) {
    throw new Error(
      `Illegal session transition: ${currentState} → ${nextState}`
    );
  }

  session.status = nextState;
  return session;
}
