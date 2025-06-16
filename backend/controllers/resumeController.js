import asyncHandler from 'express-async-handler';
import Resume from '../models/Resume.js';

// @desc    Upload a resume file and save metadata
// @route   POST /api/resume/upload
// @access  Private (user must be logged in)
export const uploadResume = asyncHandler(async (req, res) => {
  console.log("🔍 Starting resume upload process...");
  
  try {
    // Log Cloudinary config status (without sensitive data)
    console.log("Cloudinary Configuration Status:", {
      cloud_name_set: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key_set: !!process.env.CLOUDINARY_API_KEY,
      api_secret_set: !!process.env.CLOUDINARY_API_SECRET
    });

    console.log("✅ Upload Resume Controller - Request received");
    console.log("✅ File object:", req.file);
    console.log("✅ User object:", req.user);
    console.log("✅ Request body:", req.body);
    
    const file = req.file;
    
    // Validate file exists
    if (!file) {
      console.error("❌ No file uploaded");
      res.status(400);
      throw new Error('No file uploaded. Please select a file to upload.');
    }

    // Validate file properties
    if (!file.path) {
      console.error("❌ File details missing:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: file.fieldname
      });
      res.status(400);
      throw new Error('File upload failed: Missing Cloudinary path. This usually indicates a problem with the Cloudinary upload.');
    }

    // Log file details for debugging
    console.log("📄 File Details:", {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      fieldName: file.fieldname,
      cloudinaryUrl: file.path // Should contain the Cloudinary URL
    });

    // Validate user exists
    if (!req.user || !req.user._id) {
      console.error("❌ User not found in request");
      res.status(401);
      throw new Error('User authentication required.');
    }

    console.log("💾 Attempting to save resume to database...");
    
    // Create resume record with Cloudinary URL
    const resume = await Resume.create({
      user: req.user._id,
      resumeUrl: file.path, // This will be the Cloudinary URL
      name: req.user.name || 'Unknown',
      email: req.user.email || 'unknown@email.com',
    });

    console.log("✅ Resume created successfully:", {
      id: resume._id,
      url: resume.resumeUrl,
      user: resume.user
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully to Cloudinary',
      data: {
        id: resume._id,
        resumeUrl: resume.resumeUrl,
        uploadedAt: resume.createdAt,
        user: resume.user,
        storageType: 'cloudinary',
        cloudinaryUrl: file.path
      },
    });
  } catch (error) {
    console.error("❌ Error in resume upload process:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cloudinaryError: error.error // Specific to Cloudinary errors
    });
    
    // Send appropriate error response
    res.status(error.http_code || 500).json({
      success: false,
      message: error.message || 'Failed to upload resume',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});
