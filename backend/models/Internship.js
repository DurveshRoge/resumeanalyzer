import mongoose from 'mongoose';

const InternshipSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: String,
    requiredSkills: [String],
    location: String,
    duration: String,
    stipend: String,
  },
  { timestamps: true }
);

export default mongoose.model('Internship', InternshipSchema);
