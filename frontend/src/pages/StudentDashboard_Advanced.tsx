import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Upload, 
  FileText, 
  Briefcase, 
  User, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  GraduationCap,
  Mail,
  University,
  CheckCircle,
  XCircle,
  Hourglass,
  Star,
  TrendingUp,
  Award,
  Target,
  BookOpen,
  Building2,
  Activity,
  ArrowUpRight,
  Download,
  Eye,
  Zap,
  Sparkles,
  Trophy,
  Search,
  Filter
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Types
interface Resume {
  _id?: string;
  id: string;
  filename: string;
  url: string;
  userId: string;
  uploadedAt: string;
  skills?: string[];
  education?: string[];
  experience?: string[];
}

interface Internship {
  _id?: string;
  id: string;
  title: string;
  company: string | {
    _id: string;
    name?: string;
    email?: string;
    companyName?: string;
  };
  description: string;
  location: string;
  type: string;
  requirements: string[];
  duration: string;
  stipend: number;
  createdAt: string;
}

interface Application {
  _id?: string;
  id: string;
  internship: Internship;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
  resume: Resume;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Helper function to safely get company name
  const getCompanyName = (company: string | { _id: string; name?: string; email?: string; companyName?: string; }): string => {
    if (typeof company === 'string') {
      return company;
    }
    return company?.companyName || company?.name || 'Unknown Company';
  };

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const userId = user?._id || user?.id;
      if (!userId) {
        console.log('No user ID available');
        setLoading(false);
        return;
      }
      
      const [resumesRes, applicationsRes, internshipsRes] = await Promise.all([
        api.get(`/resume/user/${userId}`).catch(error => {
          console.error('Error fetching resumes:', error);
          return { data: { data: [] } };
        }),
        api.get(`/apply/user/${userId}`).catch(error => {
          console.error('Error fetching applications:', error);
          return { data: { data: [] } };
        }),
        api.get('/internship').catch(error => {
          console.error('Error fetching internships:', error);
          return { data: { data: [] } };
        })
      ]);

      const resumeData = resumesRes.data?.data || [];
      const applicationData = applicationsRes.data?.data || applicationsRes.data || [];
      const internshipData = internshipsRes.data?.data || internshipsRes.data || [];

      setResumes(resumeData);
      setApplications(applicationData);
      setInternships(internshipData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive"
      });
      return;
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Only PDF, DOC, and DOCX files are allowed",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('resume', file);

      await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast({
        title: "Success",
        description: "Resume uploaded successfully!"
      });

      event.target.value = '';
      await fetchData();
    } catch (error: any) {
      console.error('Resume upload error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload resume",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const applyToInternship = async (internshipId: string, resumeId: string) => {
    try {
      await api.post(`/apply/${internshipId}`, { resumeId });

      toast({
        title: "Success",
        description: "Application submitted successfully!"
      });

      await fetchData();
    } catch (error: any) {
      console.error('Error applying to internship:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit application",
        variant: "destructive"
      });
    }
  };

  const handleUploadClick = () => {
    document.getElementById('resume-upload')?.click();
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(resumeId);
      await api.delete(`/resume/${resumeId}`);
      toast({
        title: "Success",
        description: "Resume deleted successfully"
      });
      await fetchData();
    } catch (error: any) {
      console.error('Error deleting resume:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete resume",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  // Calculate stats
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
  const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 border-2 border-purple-200">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0] || user?.email?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Welcome back, {user?.firstName || 'Student'}!
                </h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  {user?.university || 'Student Dashboard'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Search className="h-4 w-4 mr-2" />
                Search Internships
              </Button>
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button 
                onClick={handleUploadClick}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-gray-200/50">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium"
            >
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="resumes" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium"
            >
              <FileText className="h-4 w-4 mr-2" />
              My Resumes
            </TabsTrigger>
            <TabsTrigger 
              value="internships" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Find Internships
            </TabsTrigger>
            <TabsTrigger 
              value="applications" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium"
            >
              <Trophy className="h-4 w-4 mr-2" />
              My Applications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">Total Applications</CardTitle>
                  <Trophy className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">{totalApplications}</div>
                  <p className="text-xs text-purple-600 mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    Keep applying!
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-800">Pending Review</CardTitle>
                  <Hourglass className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-900">{pendingApplications}</div>
                  <p className="text-xs text-yellow-600 mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Awaiting response
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Accepted</CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">{acceptedApplications}</div>
                  <p className="text-xs text-green-600 mt-1">
                    <Star className="h-3 w-3 inline mr-1" />
                    Congratulations!
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Success Rate</CardTitle>
                  <Target className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">
                    {totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0}%
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    <Award className="h-3 w-3 inline mr-1" />
                    Keep improving!
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Student Profile Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-purple-600" />
                    Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-6">
                    <Avatar className="h-20 w-20 border-4 border-purple-200">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-2xl font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0] || user?.email?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </h3>
                        <p className="text-gray-600 flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {user?.email}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {user?.university && (
                          <div className="flex items-center">
                            <University className="h-4 w-4 mr-2 text-purple-500" />
                            <span className="font-medium text-gray-600">University:</span>
                            <span className="ml-2 text-gray-800">{user.university}</span>
                          </div>
                        )}
                        {user?.major && (
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-2 text-purple-500" />
                            <span className="font-medium text-gray-600">Major:</span>
                            <span className="ml-2 text-gray-800">{user.major}</span>
                          </div>
                        )}
                        {user?.graduationYear && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                            <span className="font-medium text-gray-600">Graduation:</span>
                            <span className="ml-2 text-gray-800">{user.graduationYear}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-purple-500" />
                          <span className="font-medium text-gray-600">Resumes:</span>
                          <span className="ml-2 text-gray-800">{resumes.length} uploaded</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleUploadClick}
                    className="w-full justify-start bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Resume
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Internships
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Trophy className="h-4 w-4 mr-2" />
                    View Applications
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Update Profile
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Application Progress */}
            {totalApplications > 0 && (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Application Progress
                  </CardTitle>
                  <CardDescription>Track your internship application journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Pending Applications</span>
                      <span className="text-sm font-bold text-yellow-600">{pendingApplications}</span>
                    </div>
                    <Progress value={totalApplications > 0 ? (pendingApplications / totalApplications) * 100 : 0} className="h-3 bg-yellow-100" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Accepted Applications</span>
                      <span className="text-sm font-bold text-green-600">{acceptedApplications}</span>
                    </div>
                    <Progress value={totalApplications > 0 ? (acceptedApplications / totalApplications) * 100 : 0} className="h-3 bg-green-100" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Rejected Applications</span>
                      <span className="text-sm font-bold text-red-600">{rejectedApplications}</span>
                    </div>
                    <Progress value={totalApplications > 0 ? (rejectedApplications / totalApplications) * 100 : 0} className="h-3 bg-red-100" />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resumes" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-purple-600" />
                  Upload Resume
                </CardTitle>
                <CardDescription>
                  Upload your resume to apply for internships. Files are securely stored in Cloudinary cloud storage.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors duration-200">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-purple-50 rounded-full">
                      <Upload className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Upload your resume</h3>
                      <p className="text-gray-600 mt-1">Choose a PDF, DOC, or DOCX file (max 10MB)</p>
                    </div>
                    <Button 
                      onClick={handleUploadClick}
                      disabled={uploading}
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  <p>• Supported formats: PDF, DOC, DOCX</p>
                  <p>• Maximum file size: 10MB</p>
                  <p>• Files are securely stored in Cloudinary cloud storage</p>
                  <p>• Your resume can be viewed and downloaded by potential employers</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              {Array.isArray(resumes) && resumes.length > 0 ? (
                resumes.map((resume) => (
                  <Card key={resume._id || resume.id} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg text-gray-900">{resume.filename}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()} • 
                              Stored in Cloudinary
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(resume.url, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteResume(resume._id || resume.id)}
                            disabled={deleting === (resume._id || resume.id)}
                          >
                            {deleting === (resume._id || resume.id) ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="text-sm text-gray-600 space-y-2">
                          <p><strong>File ID:</strong> {resume._id || resume.id}</p>
                          <p><strong>Storage:</strong> Cloudinary (Cloud Storage)</p>
                          <p><strong>URL:</strong> <span className="text-xs break-all font-mono bg-gray-100 px-2 py-1 rounded">{resume.url}</span></p>
                          {resume.skills && resume.skills.length > 0 && (
                            <div>
                              <strong>Detected Skills:</strong>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {resume.skills.map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {resume.experience && resume.experience.length > 0 && (
                            <div>
                              <strong>Experience:</strong>
                              <ul className="list-disc list-inside ml-2 mt-1">
                                {resume.experience.slice(0, 3).map((exp, index) => (
                                  <li key={index} className="text-xs text-gray-500">{exp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {resume.education && resume.education.length > 0 && (
                            <div>
                              <strong>Education:</strong>
                              <ul className="list-disc list-inside ml-2 mt-1">
                                {resume.education.slice(0, 2).map((edu, index) => (
                                  <li key={index} className="text-xs text-gray-500">{edu}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="p-4 bg-purple-50 rounded-full mb-6">
                      <FileText className="h-12 w-12 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No resumes uploaded yet</h3>
                    <p className="text-gray-600 text-center mb-6 max-w-md">
                      Upload your first resume to start applying for internships and showcase your skills to potential employers
                    </p>
                    <Button 
                      onClick={handleUploadClick}
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Your First Resume
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="internships" className="space-y-6">
            <div className="grid gap-6">
              {Array.isArray(internships) && internships.length > 0 ? (
                internships.map((internship) => (
                  <Card key={internship._id || internship.id} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-gray-900 mb-2">{internship.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-1 text-blue-500" />
                              {getCompanyName(internship.company)}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-green-500" />
                              {internship.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-orange-500" />
                              {internship.duration}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-yellow-500" />
                              ${internship.stipend}/month
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {internship.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 leading-relaxed">{internship.description}</p>
                      
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <Star className="h-4 w-4 mr-2 text-yellow-500" />
                          Required Skills:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {internship.requirements?.map((req, index) => (
                            <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Posted {new Date(internship.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {resumes.length > 0 ? (
                          <Button 
                            onClick={() => {
                              const resumeId = resumes[0]._id || resumes[0].id;
                              const internshipId = internship._id || internship.id;
                              applyToInternship(internshipId, resumeId);
                            }}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Apply Now
                          </Button>
                        ) : (
                          <Button variant="outline" disabled>
                            Upload resume first
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="p-4 bg-blue-50 rounded-full mb-6">
                      <Briefcase className="h-12 w-12 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No internships available</h3>
                    <p className="text-gray-600 text-center mb-6 max-w-md">
                      Check back later for new internship opportunities or contact your career services office
                    </p>
                    <Button variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Refresh Listings
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="grid gap-6">
              {Array.isArray(applications) && applications.length > 0 ? (
                applications.map((application) => (
                  <Card key={application._id || application.id} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                            <Briefcase className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-gray-900">{application.internship.title}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Building2 className="h-4 w-4 mr-1" />
                              {getCompanyName(application.internship.company)} • 
                              <Calendar className="h-4 w-4 ml-2 mr-1" />
                              Applied {new Date(application.appliedAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge 
                          variant={
                            application.status === 'accepted' ? 'default' :
                            application.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                          className="px-3 py-1 text-sm"
                        >
                          {application.status === 'accepted' && <CheckCircle className="h-4 w-4 mr-1" />}
                          {application.status === 'rejected' && <XCircle className="h-4 w-4 mr-1" />}
                          {application.status === 'pending' && <Hourglass className="h-4 w-4 mr-1" />}
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium text-gray-600">Location:</span>
                            <span className="ml-2 text-gray-800">{application.internship.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium text-gray-600">Duration:</span>
                            <span className="ml-2 text-gray-800">{application.internship.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium text-gray-600">Stipend:</span>
                            <span className="ml-2 text-gray-800">${application.internship.stipend}/month</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium text-gray-600">Resume:</span>
                            <span className="ml-2 text-gray-800">{application.resume?.filename || 'Attached'}</span>
                          </div>
                        </div>
                        
                        {application.status === 'accepted' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                              <span className="text-green-800 font-semibold">Congratulations! Your application was accepted.</span>
                            </div>
                          </div>
                        )}
                        
                        {application.status === 'rejected' && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                            <div className="flex items-center">
                              <XCircle className="h-5 w-5 text-red-600 mr-2" />
                              <span className="text-red-800 font-semibold">Application was not successful this time.</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="p-4 bg-yellow-50 rounded-full mb-6">
                      <Trophy className="h-12 w-12 text-yellow-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications submitted yet</h3>
                    <p className="text-gray-600 text-center mb-6 max-w-md">
                      Start your internship journey by applying to opportunities that match your skills and interests
                    </p>
                    <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                      <Search className="h-4 w-4 mr-2" />
                      Browse Internships
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
