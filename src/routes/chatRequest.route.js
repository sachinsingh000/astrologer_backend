import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  getChatRequests,
  acceptChatRequest,
  declineChatRequest,
  userAcceptChat,
  cancelChatRequest,
  cancelUserRinging,
  cancelAstrologerRinging
} from "../controllers/chatRequest.controller.js";

const r = Router();

// Fetch astrologer's pending requests
r.get("/", auth, getChatRequests);

// Accept a request by Astrologer
r.post("/accept", auth, acceptChatRequest);

// Decline a request by Astrologer
r.post("/decline", auth, declineChatRequest);


// Cancel incoming call by User
r.post("/cancel-user-ringing", auth, cancelUserRinging);

// Cancel outgoing Call by Astrologer
r.post("/cancel-astrologer-ringing", auth, cancelAstrologerRinging);

// User: Cancel pending/astrologer request
r.post("/cancel", auth, cancelChatRequest);

// User: Accept astrologer request
r.post("/user-accept", auth, userAcceptChat);


export default r;
