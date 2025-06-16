import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { parseAndMatchResume } from '../controllers/aiController.js';

const router = express.Router();

router.get('/match/:resumeId', protect, parseAndMatchResume);

export default router;
