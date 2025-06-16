import express from 'express';
import {
  applyToInternship,
  getApplicants,
  getMyApplications,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:internshipId', protect, applyToInternship);
router.get('/company/:internshipId', protect, getApplicants);
router.get('/my', protect, getMyApplications);

export default router;
