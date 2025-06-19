import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import Internship from '../models/Internship.js';

// @desc    Create internship
// @route   POST /api/internship
// @access  Private (companies only)
export const createInternship = asyncHandler(async (req, res) => {
  if (req.user.role !== 'company') {
    res.status(403);
    throw new Error('Only companies can post internships');
  }

  console.log('Creating internship with data:', req.body);
  console.log('Company ID:', req.user._id);

  const internship = await Internship.create({
    company: req.user._id,
    title: req.body.title,
    description: req.body.description,
    requirements: req.body.requirements || [],
    location: req.body.location,
    type: req.body.type,
    duration: req.body.duration,
    stipend: req.body.stipend,
  });

  console.log('Created internship:', internship);

  res.status(201).json(internship);
});

// @desc    Get all internships or filter by company
// @route   GET /api/internship?company=COMPANY_ID
// @access  Public
export const getAllInternships = asyncHandler(async (req, res) => {
  const { company } = req.query;

  try {
    let filter = {};
    console.log('getAllInternships called with company:', company);

    if (company && mongoose.Types.ObjectId.isValid(company)) {
      filter = { company };
      console.log('Valid company ObjectId, filtering by:', filter);
    } else if (company) {
      console.log('Invalid company ObjectId:', company);
    }

    const internships = await Internship.find(filter)
      .populate('company', 'name email companyName')
      .sort({ createdAt: -1 });

    console.log('Found internships:', internships.length);
    console.log('Internships data:', internships);

    res.json({
      success: true,
      data: internships
    });
  } catch (error) {
    console.error('Error in getAllInternships:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching internships',
      error: error.message
    });
  }
});

// @desc    Get single internship
// @route   GET /api/internship/:id
// @access  Public
export const getInternshipById = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id).populate('company', 'name email');
  if (!internship) {
    res.status(404);
    throw new Error('Internship not found');
  }
  res.json(internship);
});

// @desc    Update internship
// @route   PUT /api/internship/:id
// @access  Private (companies only)
export const updateInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) {
    res.status(404);
    throw new Error('Internship not found');
  }

  if (internship.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only update your own internships');
  }

  const updated = await Internship.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(updated);
});

// @desc    Delete internship
// @route   DELETE /api/internship/:id
// @access  Private (companies only)
export const deleteInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) {
    res.status(404);
    throw new Error('Internship not found');
  }

  if (internship.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only delete your own internships');
  }

  await internship.deleteOne();
  res.json({ message: 'Internship deleted successfully' });
});
