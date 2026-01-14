// src/utils/agora.js
import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = pkg;

// deterministic hash -> numeric uid (32-bit positive)
export function hashStringToNumber(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // keep 32-bit
  }
  return Math.abs(hash) % 2147483647; // fits Agora int32 positive
}

export function buildTokenWithUidOrThrow(appID, appCertificate, channelName, uid, role = RtcRole.PUBLISHER, expireInSec = 3600) {
  const numeric = Number(uid);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    throw new Error(`Invalid UID: ${uid}`);
  }
  const current = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = current + expireInSec;
  return RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, numeric, role, privilegeExpiredTs);
}
