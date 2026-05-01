import { Router } from 'express';
import {
  chat, generateBullets, generateSummary,
  atsScore, review, matchJob, skillGaps, getChatHistory,
} from '../controllers/ai.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.post('/chat', chat);
router.get('/chat-history/:resumeId', getChatHistory);

router.post('/generate-bullets', generateBullets);
router.post('/bullets', generateBullets);

router.post('/generate-summary', generateSummary);
router.post('/summary', generateSummary);

router.post('/ats-score', atsScore);
router.post('/review', review);
router.post('/match-job', matchJob);
router.post('/skill-gaps', skillGaps);

export default router;