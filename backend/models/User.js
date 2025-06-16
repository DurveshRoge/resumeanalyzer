import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    // Common fields
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'company', 'admin'],
      default: 'student',
    },

    // Student specific fields
    university: { type: String },
    major: { type: String },
    graduationYear: { type: Number },

    // Company specific fields
    industry: { type: String },
    companySize: { type: String },
    contactPerson: { type: String },
  },
  { timestamps: true }
);

// Password match method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Password hash middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model('User', userSchema);
