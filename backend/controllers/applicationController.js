import asyncHandler from 'express-async-handler';
import Application from '../models/Application.js';
import Internship from '../models/Internship.js';
import Resume from '../models/Resume.js';

// @desc Apply to an internship
// @route POST /api/apply/:internshipId
// @access Private (students only)
export const applyToInternship = asyncHandler(async (req, res) => {  const { resumeId } = req.body;
  
  console.log('Apply to internship request:', {
    internshipId: req.params.internshipId,
    resumeId,
    userId: req.user._id,
    userRole: req.user.role
  });

  // Validate resumeId is provided
  if (!resumeId) {
    console.error('No resume ID provided in application');
    res.status(400);
    throw new Error('Resume ID is required to apply for internship');
  }

  const internship = await Internship.findById(req.params.internshipId);
  if (!internship) {
    res.status(404);
    throw new Error('Internship not found');
  }
  console.log('Found internship:', internship.title);

  if (req.user.role !== 'student') {
    res.status(403);
    throw new Error('Only students can apply');
  }

  // Validate that the resume exists and belongs to the user
  const resume = await Resume.findById(resumeId);
  if (!resume) {
    console.error('Resume not found:', resumeId);
    res.status(404);
    throw new Error('Resume not found');
  }

  if (resume.user.toString() !== req.user._id.toString()) {
    console.error('Resume does not belong to user:', resumeId, 'User:', req.user._id);
    res.status(403);
    throw new Error('You can only apply with your own resume');
  }

  console.log('Resume validated:', resume._id, 'URL:', resume.resumeUrl);

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
    resume: resume._id, // Use the validated resume._id
  });

  console.log('Created application:', {
    id: application._id,
    internship: application.internship,
    applicant: application.applicant,
    resume: application.resume,
    resumeValidated: resume._id
  });

  res.status(201).json({ 
    success: true,
    message: 'Application submitted', 
    application: {
      ...application.toObject(),
      resumeId: resume._id
    }
  });
});

// @desc Get applications for a company’s internship
// @route GET /api/apply/company/:internshipId
// @access Private (company only)
export const getApplicants = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.internshipId);

  if (!internship || internship.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Unauthorized to view applicants');
  }  const applications = await Application.find({ internship: internship._id })
    .populate('applicant', 'firstName lastName email university major graduationYear')
    .populate({
      path: 'resume',
      select: 'resumeUrl filename mimeType fileSize user',
      model: 'Resume'
    })
    .sort({ createdAt: -1 });

  console.log('Found applications for internship:', applications.length);
  if (applications.length > 0) {
    console.log('Sample application with resume data:', {
      id: applications[0]._id,
      resume: applications[0].resume,
      applicant: applications[0].applicant
    });
  }

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

// @desc    Get applications for a specific user
// @route   GET /api/apply/user/:userId
// @access  Private
export const getUserApplications = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  console.log('Getting applications for user:', userId);
  console.log('Request user:', req.user._id);

  // Check if the requesting user is the owner of the applications
  if (req.user._id.toString() !== userId) {
    console.log('Authorization failed: user mismatch');
    res.status(403);
    throw new Error('Not authorized to access these applications');
  }

  const applications = await Application.find({ applicant: userId })
    .populate('internship')
    .populate('resume')
    .sort({ createdAt: -1 });
  console.log('Found applications:', applications.length);
  console.log('Applications data:', applications);

  res.json({
    success: true,
    data: applications
  });
});

// @desc    Update application status
// @route   PUT /api/apply/:applicationId
// @access  Private (companies only)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { applicationId } = req.params;

  const application = await Application.findById(applicationId)
    .populate('internship');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }
  // Check if the requesting user is the owner of the internship
  const internship = await Internship.findById(application.internship);
  if (!internship || internship.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this application');
  }

  // Validate status
  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status. Must be pending, accepted, or rejected');
  }

  application.status = status;
  await application.save();

  res.json(application);
});
