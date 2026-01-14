import { Router } from 'express';
import { sendMessage, getRoomMessages, markRoomRead } from '../controllers/chat.controller.js';
import { auth } from '../middleware/auth.js';

const r = Router();

// send via REST (for clients that want to POST and let server emit)
r.post('/send', auth, sendMessage);

// fetch room messages (pagination with before param)
r.get('/room/:roomId', auth, getRoomMessages);

// mark read
r.post('/mark-read', auth, markRoomRead);

export default r;
