// services/sessionConnect.helper.js
export async function connectSession(session) {
  // HARD INVARIANTS
  session.status = "CONNECTED";
  session.connectedAt = new Date();
  session.isActive = true;

  // BILLING BASELINE
  session.lastBilledMinute = 0;
  session.warningSent = false;

  // INITIAL PREPAID WINDOW (5 minutes minimum)
  if (!session.endsAt) {
    session.endsAt = new Date(session.connectedAt.getTime() + 5 * 60 * 1000);
  } 

  // if (session.type === "call") {
  //   session.callJoined = true;
  // }

   if (!session.ratePerMinute || session.ratePerMinute <= 0) {
    const astro = await Astrologer.findById(session.astrologerId);

    if (!astro) {
      throw new Error("Astrologer not found for billing");
    }

    session.ratePerMinute =
      session.type === "call"
        ? astro.callPrice
        : astro.chatPrice;
  }
  await session.save();
}