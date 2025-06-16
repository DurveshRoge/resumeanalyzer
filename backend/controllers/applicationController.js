import asyncHandler from 'express-async-handler';
import Application from '../models/Application.js';
import Internship from '../models/Internship.js';

// @desc Apply to an internship
// @route POST /api/apply/:internshipId
// @access Private (students only)
export const applyToInternship = asyncHandler(async (req, res) => {
  const { resumeId } = req.body;

  const internship = await Internship.findById(req.params.internshipId);
  if (!internship) {
    res.status(404);
    throw new Error('Internship not found');
  }

  if (req.user.role !== 'user') {
    res.status(403);
    throw new Error('Only students can apply');
  }

  const existing = await Application.findOne({
    internship: internship._id,
    applicant: req.user._id,
  });

  if (existing) {
    res.status(400);
    throw new Error('You have already applied to this internship');
  }

  const application = await Application.create({
    internship: internship._id,
    applicant: req.user._id,
    resume: resumeId,
  });

  res.status(201).json({ message: 'Application submitted', application });
});

// @desc Get applications for a company’s internship
// @route GET /api/apply/company/:internshipId
// @access Private (company only)
export const getApplicants = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.internshipId);

  if (!internship || internship.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Unauthorized to view applicants');
  }

  const applications = await Application.find({ internship: internship._id })
    .populate('applicant', 'name email')
    .populate('resume');

  res.json(applications);
});

// @desc Get all applications for a student
// @route GET /api/apply/my
// @access Private (student)
export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id }).populate(
    'internship'
  );
  res.json(applications);
});
