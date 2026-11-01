import { Router } from 'express';
import { trackEvents } from '../controllers/track.controller';

const router = Router();

// Route to ingest tracking event batches from tracker.js
router.post('/track', trackEvents);

export default router;
