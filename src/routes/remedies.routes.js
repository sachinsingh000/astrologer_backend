import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { list } from '../controllers/remedies.controller.js';

const r = Router();
r.get('/', auth, list);

export default r;
