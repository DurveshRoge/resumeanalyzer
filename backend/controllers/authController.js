import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register user
export const registerUser = asyncHandler(async (req, res) => {
  const { 
    firstName,
    lastName,
    companyName,
    email, 
    password, 
    role,
    // Optional fields
    university,
    major,
    graduationYear,
    industry,
    companySize,
    contactPerson
  } = req.body;
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please enter a valid email address');
  }
  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(409); // Using 409 Conflict for already existing resource
    throw new Error('This email address already exists. Please try logging in instead.');
  }

  // Construct name based on role
  const name = role === 'student' 
    ? `${firstName} ${lastName}`.trim()
    : companyName;
  if (!name) {
    res.status(400);
    throw new Error(role === 'student' 
      ? 'Please provide both first name and last name' 
      : 'Please provide your company name'
    );
  }

  // Create user with role-specific fields
  const userData = {
    name,
    email,
    password,
    role,
    ...(role === 'student' ? {
      university,
      major,
      graduationYear
    } : role === 'company' ? {
      industry,
      companySize,
      contactPerson
    } : {})
  };

  const user = await User.create(userData);

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...(user.role === 'student' ? {
        university: user.university,
        major: user.major,
        graduationYear: user.graduationYear
      } : user.role === 'company' ? {
        industry: user.industry,
        companySize: user.companySize,
        contactPerson: user.contactPerson
      } : {}),
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login user
export const loginUser = asyncHandler(async (req, res) => {
  try {
    console.log('Login attempt:', {
      email: req.body.email,
      body: req.body,
      headers: req.headers
    });
    
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400);
      throw new Error('Missing request body');
    }
    
    const { email, password } = req.body;
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Invalid email format');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.role === 'student' ? {
      university: user.university,
      major: user.major,
      graduationYear: user.graduationYear
    } : user.role === 'company' ? {
      industry: user.industry,
      companySize: user.companySize,
      contactPerson: user.contactPerson
    } : {}),
    token: generateToken(user._id),
  });
});
