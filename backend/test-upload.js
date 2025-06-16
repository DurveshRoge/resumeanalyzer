import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test configuration
const API_BASE_URL = 'http://localhost:5000/api';
const TEST_FILE_PATH = './uploads/resume-1749649567205-464426041.pdf';

// Create a test user and get token
async function getTestToken() {
  try {
    // Try logging in first
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'test123'
    });
    return loginResponse.data.token;
  } catch (error) {
    // If login fails, register a new user
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123',
      role: 'student'
    });
    return registerResponse.data.token;
  }
}

async function testUpload() {
  try {
    console.log('🔍 Getting test token...');
    const token = await getTestToken();
    
    console.log('🧪 Testing Resume Upload...');
    
    // Check if test file exists
    if (!fs.existsSync(TEST_FILE_PATH)) {
      console.error('❌ Test file not found:', TEST_FILE_PATH);
      console.log('Please create a test PDF file or update the TEST_FILE_PATH');
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append('resume', fs.createReadStream(TEST_FILE_PATH));

    console.log('📤 Uploading file:', TEST_FILE_PATH);

    // Make request
    const response = await axios.post(`${API_BASE_URL}/resume/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`,
      },
      timeout: 30000, // 30 second timeout
    });

    console.log('✅ Upload successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Upload failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Check if server is running.');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run test
testUpload();