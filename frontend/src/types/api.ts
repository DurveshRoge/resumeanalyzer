export interface APIResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  _id?: string; // MongoDB ObjectId, optional for compatibility
  id?: string;  // Optional, for frontend compatibility
  name: string;
  email: string;
  role: 'student' | 'company';
  firstName?: string;
  lastName?: string;
  companyName?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  industry?: string;
  companySize?: string;
  contactPerson?: string;
}

export interface StudentRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student';
  university: string;
  major: string;
  graduationYear: number;
}

export interface CompanyRegistrationData {
  companyName: string;
  email: string;
  password: string;
  role: 'company';
  industry: string;
  companySize: string;
  contactPerson: string;
}

export type RegistrationData = StudentRegistrationData | CompanyRegistrationData;

export interface Resume {
  id: string;
  userId: string;
  url: string;
  skills: string[];
  education: string[];
  experience: string[];
}

export interface Internship {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  company: string;
  location: string;
  type: string;
  duration: string;
  stipend: number;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  internshipId: string;
  userId: string;
  resumeId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
