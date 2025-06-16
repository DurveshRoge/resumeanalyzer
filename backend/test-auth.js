import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:5000/api';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

async function testAuth() {
  try {
    await connectDB();
    
    // Clean up existing test users
    console.log('🧹 Cleaning up test users...');
    await User.deleteMany({ 
      email: { 
        $in: [
          'student@test.com', 
          'company@test.com',
          'durvesh@test.com',
          'john.smith@test.com'
        ] 
      } 
    });
    
    console.log('🧪 Starting Authentication Tests...\n');

    // Test Cases for Student Registration
    console.log('1️⃣ Testing Student Registration:');
    
    // Test Case 1: Valid Student Registration
    console.log('\na) Testing valid student registration:');
    const validStudentData = {
      firstName: 'Test',
      lastName: 'Student',
      email: 'student@test.com',
      password: 'Test123!',
      role: 'student',
      university: 'Test University',
      major: 'Computer Science',
      graduationYear: 2025
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, validStudentData);
      console.log('✅ Valid student registration successful:', {
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role
      });
    } catch (error) {
      console.log('❌ Valid student registration failed:', error.response?.data?.message || error.message);
    }

    // Test Case 2: Duplicate Email Registration
    console.log('\nb) Testing duplicate email registration:');
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, validStudentData);
      console.log('❌ Duplicate registration should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Duplicate email correctly rejected:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    // Test Company Registration
    console.log('\n2️⃣ Testing Company Registration:');
    
    // Test Case 3: Valid Company Registration
    console.log('\na) Testing valid company registration:');
    const validCompanyData = {
      companyName: 'Test Company',
      email: 'company@test.com',
      password: 'Test123!',
      role: 'company',
      industry: 'Technology',
      companySize: '50-100',
      contactPerson: 'John Doe'
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, validCompanyData);
      console.log('✅ Valid company registration successful:', {
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role
      });
    } catch (error) {
      console.log('❌ Valid company registration failed:', error.response?.data?.message || error.message);
    }

    // Test Login Functionality
    console.log('\n3️⃣ Testing Login Functionality:');
    
    // Test Case 4: Valid Student Login
    console.log('\na) Testing valid student login:');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'student@test.com',
        password: 'Test123!'
      });
      console.log('✅ Student login successful:', {
        id: response.data._id,
        name: response.data.name,
        role: response.data.role
      });
    } catch (error) {
      console.log('❌ Student login failed:', error.response?.data?.message || error.message);
    }

    // Test Case 5: Valid Company Login
    console.log('\nb) Testing valid company login:');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'company@test.com',
        password: 'Test123!'
      });
      console.log('✅ Company login successful:', {
        id: response.data._id,
        name: response.data.name,
        role: response.data.role
      });
    } catch (error) {
      console.log('❌ Company login failed:', error.response?.data?.message || error.message);
    }

    // Test Case 6: Invalid Login Credentials
    console.log('\nc) Testing invalid login credentials:');
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'student@test.com',
        password: 'WrongPassword123!'
      });
      console.log('❌ Invalid login should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid credentials correctly rejected:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    // Test Case 7: Non-existent User Login
    console.log('\nd) Testing non-existent user login:');
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'nonexistent@test.com',
        password: 'Test123!'
      });
      console.log('❌ Non-existent user login should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Non-existent user correctly rejected:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\n🔚 Test completed, database connection closed.');
  }
}

// Run tests
testAuth();
