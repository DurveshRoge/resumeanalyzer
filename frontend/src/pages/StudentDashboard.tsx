import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Briefcase, User, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Types
interface Resume {
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
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  type: string;
  requirements: string[];
  duration: string;
  stipend: number;
  createdAt: string;
}

interface Application {
  id: string;
  internship: Internship;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
  resume: Resume;
}

// Component
const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      console.log('User ID changed, fetching new data');
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available');
        return;
      }
      
      console.log('Fetching data for user:', user.id);
      const [resumesRes, applicationsRes, internshipsRes] = await Promise.all([
        api.get(`/resume/user/${user.id}`),
        api.get(`/apply/user/${user.id}`),
        api.get('/internship')
      ]);

      console.log('Raw resume response:', resumesRes.data);
      
      // Extract resume data from response
      const resumeData = resumesRes.data?.data || [];
      console.log('Processed resume data:', resumeData);
      
      // Extract application data from response
      const applicationData = applicationsRes.data?.data || [];
      console.log('Processed application data:', applicationData);
      
      // Extract internship data from response
      const internshipData = internshipsRes.data || [];
      console.log('Processed internship data:', internshipData);

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
  console.log('File upload triggered');
  const file = event.target.files?.[0];
  if (!file) {
    console.log('No file selected');
    toast({
      title: "Error",
      description: "Please select a file to upload",
      variant: "destructive"
    });
    return;
  }

  console.log('File selected:', file.name, file.type, file.size);

  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    console.log('File too large:', file.size);
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
    console.log('Invalid file type:', file.type);
    toast({
      title: "Error",
      description: "Only PDF, DOC, and DOCX files are allowed",
      variant: "destructive"
    });
    return;
  }

  try {
    setUploading(true);
    console.log('Starting upload...');
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('Upload response:', response);
    toast({
      title: "Success",
      description: "Resume uploaded successfully!"
    });

    // Clear the input
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
      await api.post(`/apply/${internshipId}`, {
        resumeId
      });

      toast({
        title: "Success",
        description: "Application submitted successfully!"
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit application",
        variant: "destructive"
      });
    }
  };

  const handleUploadClick = () => {
    console.log('Upload button clicked');
    document.getElementById('resume-upload')?.click();
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(resumeId);
      console.log('Deleting resume:', resumeId);

      const response = await api.delete(`/resume/${resumeId}`);
      console.log('Delete response:', response.data);

      toast({
        title: "Success",
        description: "Resume deleted successfully"
      });

      // Update the resumes list by filtering out the deleted resume
      setResumes(current => current.filter(resume => resume.id !== resumeId));
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">Manage your internship applications and profile</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resumes">Resumes</TabsTrigger>
            <TabsTrigger value="internships">Internships</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
                  <FileText className="h-4 w-4 text-mute-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resumes.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Applications Sent</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{applications.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Internships</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{internships.length}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">University</p>
                    <p className="text-gray-900">{user?.university || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Major</p>
                    <p className="text-gray-900">{user?.major || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Graduation Year</p>
                    <p className="text-gray-900">{user?.graduationYear || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resumes" className="space-y-6">
            <Card>
    <CardHeader>
      <CardTitle>Upload Resume</CardTitle>
      <CardDescription>Upload your resume to apply for internships</CardDescription>
    </CardHeader>
    <CardContent>
      <form onSubmit={(e) => e.preventDefault()} className="flex items-center space-x-2">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
          id="resume-upload"
        />
        <Button 
          type="button"
          variant="outline" 
          className="w-full sm:w-auto cursor-pointer"
          onClick={handleUploadClick}
          disabled={uploading}
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              <span>Uploading...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Upload className="h-4 w-4 mr-2" />
              <span>Upload Resume</span>
            </div>
          )}
        </Button>
      </form>
    </CardContent>
  </Card>

            <div className="grid gap-4">
              {resumes.map((resume: Resume) => (
                <Card key={resume.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{resume.filename}</CardTitle>
                    <CardDescription>
                      Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(resume.url, '_blank')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Resume
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteResume(resume.id)}
                        disabled={deleting === resume.id}
                      >
                        {deleting === resume.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="internships" className="space-y-6">
            <div className="grid gap-6">
              {internships.map((internship: Internship) => (
                <Card key={internship.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{internship.title}</CardTitle>
                        <CardDescription className="text-base mt-1">
                          {internship.company} • {internship.location}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{internship.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{internship.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {internship.requirements?.map((req: string, index: number) => (
                        <Badge key={index} variant="outline">{req}</Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Duration: {internship.duration} • Stipend: ${internship.stipend}
                      </div>
                      {resumes.length > 0 && (
                        <Button onClick={() => applyToInternship(internship.id, resumes[0].id)}>
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="grid gap-4">
              {applications.map((application: Application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{application.internship?.title}</CardTitle>
                        <CardDescription>
                          {application.internship?.company} • Applied on {new Date(application.appliedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={
                          application.status === 'accepted' ? 'default' :
                          application.status === 'rejected' ? 'destructive' : 'secondary'
                        }
                      >
                        {application.status}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
