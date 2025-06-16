import express from 'express';
import {
  createInternship,
  getAllInternships,
  getInternshipById,
  updateInternship,
  deleteInternship,
} from '../controllers/internshipController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getAllInternships).post(protect, createInternship);
router
  .route('/:id')
  .get(getInternshipById)
  .put(protect, updateInternship)
  .delete(protect, deleteInternship);

export default router;
