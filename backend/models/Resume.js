import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    email: String,
    resumeUrl: String,
    filename: String, // Original filename
    mimeType: String, // File MIME type
    fileSize: Number, // File size in bytes
    cloudinaryPublicId: String, // Cloudinary public ID for management
    parsedSkills: [String], // for AI output
  },
  { timestamps: true }
);

export default mongoose.model('Resume', ResumeSchema);
