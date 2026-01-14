import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { getWallet, credit } from '../controllers/wallet.controller.js';

const r = Router();
r.get('/me', auth, getWallet);
r.post('/credit', auth, credit);


export default r;
 