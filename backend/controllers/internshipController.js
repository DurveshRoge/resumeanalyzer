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

  const internship = await Internship.create({
    company: req.user._id,
    title: req.body.title,
    description: req.body.description,
    requiredSkills: req.body.requiredSkills || [],
    location: req.body.location,
    duration: req.body.duration,
    stipend: req.body.stipend,
  });

  res.status(201).json(internship);
});

// @desc    Get all internships
// @route   GET /api/internship
// @access  Public
export const getAllInternships = asyncHandler(async (req, res) => {
  const internships = await Internship.find().populate('company', 'name email');
  res.json(internships);
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
