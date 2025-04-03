import { Router } from 'express';
import frameHandler from './api/frame';
import frameActionHandler from './api/frame-action';

const router = Router();

// Frame image generation endpoint
router.get('/api/frame', frameHandler);

// Frame action handling endpoint
router.post('/api/frame-action', frameActionHandler);

export default router; 