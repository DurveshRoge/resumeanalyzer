import axios from 'axios';
import asyncHandler from 'express-async-handler';
import Resume from '../models/Resume.js';
import Internship from '../models/Internship.js';

// @desc    Parse resume using APILayer, match against internships using Gemini
// @route   GET /api/ai/match/:resumeId
// @access  Private (students)
export const parseAndMatchResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.resumeId);
  if (!resume) {
    res.status(404);
    throw new Error('Resume not found');
  }

  // 1. Call APILayer to parse resume
  const parsedResponse = await axios.post(
    'https://api.apilayer.com/resume_parser/upload',
    {
      url: resume.resumeUrl,
    },
    {
      headers: {
        apikey: process.env.APILAYER_API_KEY,
      },
    }
  );

  const parsedSkills = parsedResponse.data?.skills || [];
  if (!parsedSkills.length) {
    return res.status(400).json({ message: 'No skills extracted from resume' });
  }

  resume.parsedSkills = parsedSkills;
  await resume.save();

  // 2. Get all internships
  const internships = await Internship.find();

  // 3. Send resume skills + internship skills to Gemini API to get match scores
  const geminiResponse = await axios.post(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' +
      process.env.GEMINI_API_KEY,
    {
      contents: [
        {
          parts: [
            {
              text: `You are an AI resume matcher. Given the following resume skills:\n${parsedSkills.join(
                ', '
              )}\n\nand the following internships:\n${internships
                .map(
                  (job, i) =>
                    `Job ${i + 1}: ${job.title}, Skills: ${job.requiredSkills.join(', ')}`
                )
                .join('\n')}\n\nReturn a JSON array of objects like: [{ internshipTitle: '', matchPercentage: 85 }]`,
            },
          ],
        },
      ],
    }
  );

  const matchText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  let matches;
  try {
    matches = JSON.parse(matchText);
  } catch {
    return res.status(500).json({ message: 'Failed to parse Gemini response', raw: matchText });
  }

  res.json({
    resumeId: resume._id,
    matchedSkills: parsedSkills,
    matches,
  });
});
