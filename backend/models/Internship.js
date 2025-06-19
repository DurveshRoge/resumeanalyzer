import mongoose from 'mongoose';

const InternshipSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [String],
    location: { type: String, required: true },
    type: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], required: true },
    duration: { type: String, required: true },
    stipend: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Internship', InternshipSchema);
