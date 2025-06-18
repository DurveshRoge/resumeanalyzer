import express from 'express';
import multer from 'multer';
import { storage } from '../utils/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';
import { 
  uploadResume, 
  getUserResumes, 
  getResumeById,
  deleteResume
} from '../controllers/resumeController.js';

const router = express.Router();

// Configure multer with Cloudinary storage and file validation
const upload = multer({ 
  storage, // Use Cloudinary storage directly
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log("🔍 File Filter - Checking file type:", file.mimetype);
    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (allowedTypes.includes(file.mimetype)) {
      console.log("✅ File type accepted");
      cb(null, true);
    } else {
      console.log("❌ File type rejected:", file.mimetype);
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
    }
  }
});

// Debug middleware to log request details
const debugMiddleware = (req, res, next) => {
  console.log('🔍 Upload Request Debug:');
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Authorization:', req.headers.authorization ? 'Present' : 'Missing');
  console.log('Storage Type: Cloudinary');
  next();
};

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  console.log('🔍 Multer Error:', error);
  console.log('🔍 Error Type:', error.constructor.name);
  console.log('🔍 Error Message:', error.message);
  
  if (error instanceof multer.MulterError) {
    console.log('🔍 Multer Error Code:', error.code);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File too large. Maximum size is 10MB.' 
      });
    }
    return res.status(400).json({ 
      success: false, 
      message: `Upload error: ${error.message || 'Unknown upload error'}` 
    });
  }
  
  // Check if error.message exists before calling includes
  if (error && error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }

  // Handle Cloudinary-specific errors
  if (error && error.message && error.message.includes('cloudinary')) {
    console.error('❌ Cloudinary Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Cloudinary upload failed. Please check your credentials and try again.' 
    });
  }
  
  // Handle other errors
  console.error('❌ Unknown Upload Error:', error);
  return res.status(500).json({ 
    success: false, 
    message: error && error.message ? error.message : 'File upload failed. Please try again.' 
  });
};

router.post('/upload', 
  protect, 
  debugMiddleware,
  upload.single('resume'), 
  handleMulterError,
  uploadResume
);

// Get resumes by user ID
router.get('/user/:userId', protect, getUserResumes);

// Get single resume by ID
router.get('/:id', protect, getResumeById);

// Delete resume
router.delete('/:id', protect, deleteResume);

export default router;
