import express from 'express';
import {
  applyToInternship,
  getApplicants,
  getMyApplications,
  updateApplicationStatus,
  getUserApplications
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Application submission
router.post('/:internshipId', protect, applyToInternship);

// Get applications
router.get('/user/:userId', protect, getUserApplications); // New route for student dashboard
router.get('/company/:internshipId', protect, getApplicants);
router.get('/my', protect, getMyApplications);

// Update application status
router.put('/:applicationId', protect, updateApplicationStatus);

export default router;
