import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  GraduationCap, 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowRight,
  CheckCircle,
  Users,
  Sparkles,
  Calendar,
  MapPin,
  BookOpen
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StudentRegistrationData {
  email: string;
  password: string;
  role: 'student';
  firstName: string;
  lastName: string;
  university: string;
  major: string;
  graduationYear: number;
}

interface CompanyRegistrationData {
  email: string;
  password: string;
  role: 'company';
  companyName: string;
  industry: string;
  companySize: string;
  contactPerson: string;
}

const Register: React.FC = () => {
  const [role, setRole] = useState<'student' | 'company' | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
    university: '',
    major: '',
    graduationYear: '',
    industry: '',
    companySize: '',
    contactPerson: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let registrationData: StudentRegistrationData | CompanyRegistrationData;

      if (role === 'student') {
        if (!formData.firstName || !formData.lastName || !formData.university || !formData.major || !formData.graduationYear) {
          throw new Error('Please fill in all student details');
        }
        registrationData = {
          email: formData.email,
          password: formData.password,
          role: 'student',
          firstName: formData.firstName,
          lastName: formData.lastName,
          university: formData.university,
          major: formData.major,
          graduationYear: parseInt(formData.graduationYear)
        };
      } else {
        if (!formData.companyName || !formData.industry || !formData.companySize || !formData.contactPerson) {
          throw new Error('Please fill in all company details');
        }
        registrationData = {
          email: formData.email,
          password: formData.password,
          role: 'company',
          companyName: formData.companyName,
          industry: formData.industry,
          companySize: formData.companySize,
          contactPerson: formData.contactPerson
        };
      }

      await register(registrationData);
      
      if (role === 'student') {
        navigate('/student/dashboard');
      } else if (role === 'company') {
        navigate('/company/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({length: 10}, (_, i) => currentYear + i);

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Consulting', 'Media & Entertainment', 'Non-profit', 'Government'
  ];

  const companySizes = [
    '1-10 employees', '11-50 employees', '51-200 employees', 
    '201-500 employees', '501-1000 employees', '1000+ employees'
  ];

  const majors = [
    'Computer Science', 'Engineering', 'Business', 'Economics', 'Marketing',
    'Data Science', 'Psychology', 'Biology', 'Chemistry', 'Physics',
    'Mathematics', 'English', 'Communications', 'Design', 'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-1/3 left-20 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-bounce" />
        <div className="absolute bottom-20 right-1/4 w-24 h-24 bg-white/15 rounded-full blur-lg animate-pulse delay-300" />
        
        <div className="relative z-10 flex flex-col justify-center items-start px-12 py-16 text-white">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">InternPortal</h1>
            </div>
            <h2 className="text-5xl font-bold leading-tight mb-6">
              Start Your
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Success Story
              </span>
              Today
            </h2>
            <p className="text-xl text-purple-100 leading-relaxed max-w-md">
              Join thousands of students and companies creating meaningful career connections through our AI-powered platform.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Students</h3>
                <p className="text-purple-100 text-sm">Build your career with top internships</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Companies</h3>
                <p className="text-purple-100 text-sm">Discover exceptional talent for your team</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Smart Matching</h3>
                <p className="text-purple-100 text-sm">AI-powered resume analysis and matching</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8">
          {/* Mobile Branding */}
          <div className="text-center lg:hidden">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Join InternPortal
            </h2>
          </div>

          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="hidden lg:flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Create Account
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Start your journey to success
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label htmlFor="role" className="text-sm font-semibold text-gray-700">
                    I am a <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                        role === 'student'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                      }`}
                    >
                      <GraduationCap className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-semibold">Student</div>
                      <div className="text-xs text-gray-500">Looking for internships</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('company')}
                      className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                        role === 'company'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                      }`}
                    >
                      <Building2 className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-semibold">Company</div>
                      <div className="text-xs text-gray-500">Hiring interns</div>
                    </button>
                  </div>
                </div>

                {role && (
                  <>
                    {/* Common Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                            placeholder="your@email.com"
                            className="pl-10 h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                          Password <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                            placeholder="••••••••"
                            className="pl-10 pr-10 h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Student Fields */}
                    {role === 'student' && (
                      <div className="space-y-4">
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                            <GraduationCap className="h-4 w-4 mr-2" />
                            Student Information
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                First Name <span className="text-red-500">*</span>
                              </Label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  value={formData.firstName}
                                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                                  required
                                  placeholder="John"
                                  className="pl-10 h-10 border-gray-300 focus:border-purple-500"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Last Name <span className="text-red-500">*</span>
                              </Label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  value={formData.lastName}
                                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                                  required
                                  placeholder="Doe"
                                  className="pl-10 h-10 border-gray-300 focus:border-purple-500"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                University <span className="text-red-500">*</span>
                              </Label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  value={formData.university}
                                  onChange={(e) => handleInputChange('university', e.target.value)}
                                  required
                                  placeholder="Stanford University"
                                  className="pl-10 h-10 border-gray-300 focus:border-purple-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Major <span className="text-red-500">*</span>
                                </Label>
                                <Select value={formData.major} onValueChange={(value) => handleInputChange('major', value)}>
                                  <SelectTrigger className="h-10 border-gray-300 focus:border-purple-500">
                                    <div className="flex items-center">
                                      <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                                      <SelectValue placeholder="Select major" />
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {majors.map(major => (
                                      <SelectItem key={major} value={major}>{major}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Graduation Year <span className="text-red-500">*</span>
                                </Label>
                                <Select value={formData.graduationYear} onValueChange={(value) => handleInputChange('graduationYear', value)}>
                                  <SelectTrigger className="h-10 border-gray-300 focus:border-purple-500">
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                      <SelectValue placeholder="Year" />
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {graduationYears.map(year => (
                                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Company Fields */}
                    {role === 'company' && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                            <Building2 className="h-4 w-4 mr-2" />
                            Company Information
                          </h4>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Company Name <span className="text-red-500">*</span>
                              </Label>
                              <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  value={formData.companyName}
                                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                                  required
                                  placeholder="Acme Corporation"
                                  className="pl-10 h-10 border-gray-300 focus:border-blue-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Industry <span className="text-red-500">*</span>
                                </Label>
                                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                                  <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500">
                                    <SelectValue placeholder="Select industry" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {industries.map(industry => (
                                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Company Size <span className="text-red-500">*</span>
                                </Label>
                                <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                                  <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500">
                                    <SelectValue placeholder="Select size" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {companySizes.map(size => (
                                      <SelectItem key={size} value={size}>{size}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Contact Person <span className="text-red-500">*</span>
                              </Label>
                              <div className="relative">
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  value={formData.contactPerson}
                                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                                  required
                                  placeholder="HR Manager, CEO, etc."
                                  className="pl-10 h-10 border-gray-300 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Creating your account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </>
                )}
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="text-purple-600 hover:text-purple-500 font-semibold hover:underline transition-all duration-200"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>

              {/* Benefits */}
              <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  What you get:
                </h4>
                <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Badge variant="secondary" className="mr-2 text-xs">✓</Badge>
                    AI-powered resume analysis and job matching
                  </div>
                  <div className="flex items-center">
                    <Badge variant="secondary" className="mr-2 text-xs">✓</Badge>
                    Secure cloud storage for your documents
                  </div>
                  <div className="flex items-center">
                    <Badge variant="secondary" className="mr-2 text-xs">✓</Badge>
                    Direct connection with top companies and students
                  </div>
                  <div className="flex items-center">
                    <Badge variant="secondary" className="mr-2 text-xs">✓</Badge>
                    Real-time application tracking and notifications
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
