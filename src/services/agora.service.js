// src/services/agora.service.js
import { env } from "../config/env.js";
import { buildTokenWithUidOrThrow } from "../utils/agora.js";

export function generateAgoraTokenForUid(numericUid, channelName) {
  const appID = env.AGORA_APP_ID;
  const appCertificate = env.AGORA_APP_CERTIFICATE;
  if (!appID || !appCertificate) throw new Error("Missing Agora credentials");
  // buildTokenWithUidOrThrow already validates numeric uid
  return buildTokenWithUidOrThrow(appID, appCertificate, channelName, numericUid);
}
