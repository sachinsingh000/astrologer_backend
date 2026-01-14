import ChatMessage from '../models/ChatMessage.js';

/**
 * Save a chat message
 * data: { roomId, from, to, text, attachments, meta }
 */
export const saveMessage = async (data) => {
  const msg = await ChatMessage.create(data);
  return msg;
};

/**
 * Get messages by roomId with pagination
 */
export const listMessagesByRoom = async (roomId, { limit = 50, before } = {}) => {
  const query = { roomId };
  if (before) query.createdAt = { $lt: new Date(before) };
  return ChatMessage.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();
};

/**
 * Mark messages as read for a room and recipient
 */
export const markRead = async (roomId, userId) => {
  return ChatMessage.updateMany({ roomId, to: userId, read: false }, { $set: { read: true } });
};
