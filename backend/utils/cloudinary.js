import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in the root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// // Debug logging
// console.log('🔍 Current working directory:', process.cwd());
// console.log('🔍 .env file path:', path.join(__dirname, '..', '.env'));
// console.log('🔍 Environment variables loaded:', {
//   CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? '✓' : '✗',
//   CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '✓' : '✗',
//   CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '✓' : '✗'
// });

// Validate environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Missing Cloudinary credentials. Please check your .env file');
  console.log('Required variables:');
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✓' : '✗');
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✓' : '✗');
  console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✓' : '✗');
  throw new Error('Missing Cloudinary credentials');
}

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'resumes',
    resource_type: 'raw', // for PDF/DOCX
    allowed_formats: ['pdf', 'doc', 'docx'],
    transformation: [{ quality: 'auto' }],
  },
});

export { cloudinary, storage };
