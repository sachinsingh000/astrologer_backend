import * as ChatService from '../services/chat.service.js';
import asyncHandler  from '../utils/asyncHandler.js';

/**
 * POST /api/chat/send
 * body: { roomId, to, text, attachments? }
 * auth required (req.user should be set by auth middleware)
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { roomId, to, text, attachments, meta } = req.body;
  if (!roomId || !text) return res.status(400).json({ message: 'roomId and text required' });
 
  const payload = {
    roomId,
    from: req.user.id, 
    to,
    text,
    attachments,
    meta
  };

  const msg = await ChatService.saveMessage(payload);
  res.status(201).json({ message: msg });

  console.log("🔎 SEND MESSAGE CHECK", {
  msgRoomId: msg.roomId,
  session: await ChatSession.findOne({ roomId: msg.roomId })
});
});

/**
 * GET /api/chat/room/:roomId?limit=50&before=ISODate
 * returns messages for room (most recent first)
 */
export const getRoomMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { limit, before } = req.query;
  const messages = await ChatService.listMessagesByRoom(roomId, { limit, before });
  res.json({ items: messages });
});

/**
 * POST /api/chat/mark-read
 * body: { roomId }
 */
export const markRoomRead = asyncHandler(async (req, res) => {
  const { roomId } = req.body;
  const userId = req.user.id ;
  await ChatService.markRead(roomId, userId);
  res.json({ ok: true });
});


