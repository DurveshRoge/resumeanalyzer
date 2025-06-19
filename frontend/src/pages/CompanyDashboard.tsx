import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Users, Plus, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Internship {
  _id?: string;
  id: string;
  title: string;
  description: string;
  requirements: string[];
  company: string | {
    _id: string;
    name?: string;
    email?: string;
    companyName?: string;
  };
  location: string;
  type: string;
  duration: string;
  stipend: number;
  createdAt: string;
}

interface ApplicationUser {
  firstName: string;
  lastName: string;
  email: string;
  university?: string;
  major?: string;
  graduationYear?: number;
}

interface Application {
  _id?: string;
  id: string;
  internshipId: string;
  userId: string;
  resumeId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  appliedAt: string;
  user?: ApplicationUser;
  applicant?: ApplicationUser; // Backend might use this field name
  resume?: {
    _id?: string;
    url?: string;
    resumeUrl?: string; // Backend uses this field name
    filename?: string;
    mimeType?: string;
    fileSize?: number;
  };
  internship?: {
    id: string;
    title: string;
    company: string;
  };
}

interface NewInternship {
  title: string;
  description: string;
  requirements: string;
  company: string;
  location: string;
  type: string;
  duration: string;
  stipend: string;
}

interface InternshipWithApplications extends Internship {
  applications?: Application[];
}

const CompanyDashboard: React.FC<{}> = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newInternship, setNewInternship] = useState<NewInternship>({
    title: '',
    description: '',
    requirements: '',
    company: user?.companyName || '',
    location: '',
    type: '',
    duration: '',
    stipend: ''
  });

  useEffect(() => {
    console.log('CompanyDashboard: User object:', user);
    console.log('CompanyDashboard: User ID:', user?._id);
    console.log('CompanyDashboard: Company Name:', user?.companyName);
    console.log('CompanyDashboard: User Role:', user?.role);
    console.log('CompanyDashboard: Loading state:', loading);

    const userId = user?._id || user?.id;
    if (!user || !userId || !user.companyName) {
      console.log('User not ready or missing required fields — stopping loader');
      console.log('User ID:', userId, 'Company Name:', user?.companyName);
      setLoading(false); // ✅ Stop loading even if user is invalid
      return;
    }

    console.log('All required user data available, fetching data...');
    fetchData();
  }, [user]);

  // Helper function to get applicant information
  const getApplicantInfo = (application: Application) => {
    // Check for applicant data in different possible locations
    const applicant = application.user || application.applicant;
    
    if (!applicant) {
      console.log('No applicant data found for application:', application);
      return { name: 'Anonymous Applicant', details: null };
    }
    
    const firstName = applicant.firstName || '';
    const lastName = applicant.lastName || '';
    const name = `${firstName} ${lastName}`.trim() || applicant.email || 'Anonymous Applicant';
    
    console.log('Applicant info extracted:', { name, applicant });
    return { name, details: applicant };
  };

  // Helper function to get proper Cloudinary PDF URL
  const getResumeViewUrl = (resumeUrl: string) => {
    console.log('Original resume URL:', resumeUrl);
    
    // If it's already a Cloudinary URL, ensure it's properly formatted for PDF viewing
    if (resumeUrl.includes('cloudinary.com')) {
      // For raw files (PDFs), the URL should work as-is
      // But we can add fl_attachment to force download if viewing fails
      const viewUrl = resumeUrl.includes('fl_attachment') 
        ? resumeUrl 
        : resumeUrl.replace('/upload/', '/upload/fl_attachment/');
      
      console.log('Processed Cloudinary URL:', viewUrl);
      return viewUrl;
    }
    
    // If it's not a Cloudinary URL, return as-is
    return resumeUrl;
  };

const fetchData = async () => {
    const userId = user?._id || user?.id;
    if (!userId || !user?.companyName) {
      console.log('Missing user ID or company name:', { userId, companyName: user?.companyName });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching internships for company ID:', userId);
      
      // First try to get all internships to see if the endpoint works
      console.log('Testing: Fetching all internships first...');
      const allInternshipsRes = await api.get('/internship');
      console.log('All internships response:', allInternshipsRes.data);
      
      // Now fetch company-specific internships
      const res = await api.get(`/internship?company=${userId}`);
      console.log('Internships API response:', res.data);
      console.log('Response structure - success:', res.data.success);
      console.log('Response structure - data:', res.data.data);
      console.log('Response data type:', typeof res.data.data);
      console.log('Response data is array:', Array.isArray(res.data.data));

      // Handle different response formats
      let internshipList = [];
      if (res.data.success && Array.isArray(res.data.data)) {
        internshipList = res.data.data;
      } else if (Array.isArray(res.data)) {
        internshipList = res.data;
      } else {
        console.warn('Unexpected response format:', res.data);
      }

      console.log('Processed internship list:', internshipList);
      setInternships(internshipList);

      // Fetch applications for company's internships if any exist
      if (internshipList.length > 0) {
        console.log('Fetching applications for internships:', internshipList.map(i => i._id || i.id));
        const applicationPromises = internshipList.map(internship => 
          api.get(`/apply/company/${internship._id || internship.id}`).catch(error => {
            console.error(`Error fetching applications for internship ${internship._id || internship.id}:`, error);
            return { data: [] };
          })
        );

        const applicationResponses = await Promise.all(applicationPromises);
        
        // Flatten all applications and map them with their internship info
        const allApplications = [];
        applicationResponses.forEach((response, index) => {
          const internship = internshipList[index];
          const apps = Array.isArray(response.data) ? response.data : [];
          
          console.log(`Applications for internship ${internship.title}:`, apps.length);
          
          // Add internship reference to each application
          apps.forEach(app => {
            console.log('Processing application:', {
              applicationId: app._id,
              resumeData: app.resume,
              applicantData: app.applicant
            });
            
            allApplications.push({
              ...app,
              internshipId: internship._id || internship.id,
              internship: {
                id: internship._id || internship.id,
                title: internship.title,
                company: internship.company
              }
            });
          });
        });
        
        console.log('Processed all applications:', allApplications);
        console.log('Applications with resume data:');
        allApplications.forEach((app, index) => {
          console.log(`Application ${index + 1}:`, {
            id: app._id,
            hasResume: !!app.resume,
            resumeData: app.resume,
            resumeUrl: app.resume?.url || app.resume?.resumeUrl,
            applicantName: app.applicant ? `${app.applicant.firstName} ${app.applicant.lastName}` : 'Unknown'
          });
        });
        
        setApplications(allApplications);
      } else {
        console.log('No internships found for company, clearing applications');
        setApplications([]);
      }
    } catch (err) {
      console.error('Error fetching company internships:', err);
      setInternships([]);
      toast({
        title: "Error",
        description: "Failed to load internships. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  const handleCreateInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Creating internship with data:', newInternship);
      const internshipData = {
        ...newInternship,
        requirements: newInternship.requirements.split(',').map(req => req.trim()),
        stipend: parseInt(newInternship.stipend)
      };

      const response = await api.post('/internship', internshipData);
      console.log('Internship creation response:', response.data);
      
      toast({
        title: "Success",
        description: "Internship posted successfully!"
      });

      // Reset form and close dialog
      setIsCreateDialogOpen(false);
      setNewInternship({
        title: '',
        description: '',
        requirements: '',
        company: user?.companyName || '',
        location: '',
        type: '',
        duration: '',
        stipend: ''
      });

      // Refetch data to ensure we have the latest internships from the database
      await fetchData();
    } catch (error: any) {
      console.error('Error creating internship:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create internship",
        variant: "destructive"
      });
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      await api.put(`/apply/${applicationId}`, { status });
      
      toast({
        title: "Success",
        description: `Application ${status} successfully!`
      });
      
      fetchData();
    } catch (error: any) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update application",
        variant: "destructive"
      });
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.companyName}!
            </h1>
            <p className="text-gray-600 mt-2">Manage your internship postings and applications</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post Internship
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Post New Internship</DialogTitle>
                <DialogDescription>Create a new internship opportunity</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateInternship} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newInternship.title}
                      onChange={(e) => setNewInternship({...newInternship, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newInternship.location}
                      onChange={(e) => setNewInternship({...newInternship, location: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newInternship.description}
                    onChange={(e) => setNewInternship({...newInternship, description: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                  <Input
                    id="requirements"
                    value={newInternship.requirements}
                    onChange={(e) => setNewInternship({...newInternship, requirements: e.target.value})}
                    placeholder="React, JavaScript, Node.js"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={newInternship.type} onValueChange={(value) => setNewInternship({...newInternship, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="On-site">On-site</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={newInternship.duration}
                      onChange={(e) => setNewInternship({...newInternship, duration: e.target.value})}
                      placeholder="3 months"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stipend">Stipend ($)</Label>
                    <Input
                      id="stipend"
                      type="number"
                      value={newInternship.stipend}
                      onChange={(e) => setNewInternship({...newInternship, stipend: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">Create Internship</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="internships">My Internships</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Array.isArray(internships) ? internships.length : 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Array.isArray(applications) ? applications.length : 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Array.isArray(applications) ? applications.filter((app: Application) => app.status === 'pending').length : 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="internships" className="space-y-6">
            <div className="grid gap-6">
              {Array.isArray(internships) && internships.length > 0 ? (
                internships.map((internship: Internship) => (
                  <Card key={internship._id || internship.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{internship.title}</CardTitle>
                          <CardDescription className="text-base mt-1">
                            {internship.location} • {internship.type}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{internship.duration}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{internship.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {internship.requirements?.map((req: string, index: number) => (
                          <Badge key={index} variant="outline">{req}</Badge>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">
                        Stipend: ${internship.stipend} • Applications: {applications.filter((app: Application) => app.internshipId === (internship._id || internship.id)).length}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-600 text-center">No internships posted yet</p>
                    <p className="text-sm text-gray-500 text-center mt-1">Click the "Post Internship" button to create your first listing!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            {Array.isArray(internships) && internships.length > 0 ? (
              internships.map((internship: Internship) => {
                // Filter applications for this specific internship
                const internshipApplications = applications.filter((app: Application) => 
                  app.internship?.id === (internship._id || internship.id) || 
                  app.internshipId === (internship._id || internship.id)
                );

                return (
                  <Card key={internship._id || internship.id} className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-xl flex justify-between items-center">
                        <span>{internship.title}</span>
                        <Badge variant="secondary">
                          {internshipApplications.length} Application{internshipApplications.length !== 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {internship.location} • {internship.type} • Stipend: ${internship.stipend}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {internshipApplications.length > 0 ? (
                        <div className="space-y-4">
                          {internshipApplications.map((application: Application) => {
                            const { name: applicantName, details: applicantDetails } = getApplicantInfo(application);
                            return (
                              <Card key={application._id || application.id} className="border-l-4 border-l-blue-500">
                                <CardHeader className="pb-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <CardTitle className="text-lg">{applicantName}</CardTitle>
                                      <CardDescription>
                                        Applied on {new Date(application.createdAt || application.appliedAt).toLocaleDateString()}
                                      </CardDescription>
                                    </div>
                                    <Badge 
                                      variant={
                                        application.status === 'accepted' ? 'default' :
                                        application.status === 'rejected' ? 'destructive' : 'secondary'
                                      }
                                    >
                                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex gap-2 mb-4">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateApplicationStatus(application._id || application.id, 'accepted')}
                                      disabled={application.status !== 'pending'}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateApplicationStatus(application._id || application.id, 'rejected')}
                                      disabled={application.status !== 'pending'}
                                    >
                                      Reject
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        console.log('Application data:', application);
                                        console.log('Resume data:', application.resume);
                                        
                                        if (application.resume?.url || application.resume?.resumeUrl) {
                                          // Handle different resume URL field names
                                          const resumeUrl = application.resume.url || application.resume.resumeUrl;
                                          const processedUrl = getResumeViewUrl(resumeUrl);
                                          console.log('Attempting to open resume:', processedUrl);
                                          
                                          // Create a temporary link to test the URL
                                          const testLink = document.createElement('a');
                                          testLink.href = processedUrl;
                                          testLink.target = '_blank';
                                          testLink.rel = 'noopener noreferrer';
                                          
                                          // Add download attribute as fallback
                                          testLink.download = `Resume_${applicantName.replace(/\s+/g, '_')}.pdf`;
                                          
                                          // Attempt to open
                                          document.body.appendChild(testLink);
                                          testLink.click();
                                          document.body.removeChild(testLink);
                                          
                                          // Show success message
                                          toast({
                                            title: "Opening Resume",
                                            description: "Resume is being opened in a new tab. If it doesn't open, check your popup blocker.",
                                          });
                                        } else {
                                          console.error('No resume URL found for application:', application);
                                          toast({
                                            title: "Resume Not Available",
                                            description: "This application doesn't have a resume attached or the resume data is missing.",
                                            variant: "destructive"
                                          });
                                        }
                                      }}
                                      disabled={!application.resume || (!application.resume.url && !application.resume.resumeUrl)}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      {application.resume ? 'View Resume' : 'No Resume'}
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        if (application.resume?.url || application.resume?.resumeUrl) {
                                          // Handle different resume URL field names
                                          const resumeUrl = application.resume.url || application.resume.resumeUrl;
                                          const downloadLink = document.createElement('a');
                                          downloadLink.href = resumeUrl;
                                          downloadLink.download = `Resume_${applicantName.replace(/\s+/g, '_')}.pdf`;
                                          document.body.appendChild(downloadLink);
                                          downloadLink.click();
                                          document.body.removeChild(downloadLink);
                                          
                                          toast({
                                            title: "Downloading Resume",
                                            description: "Resume download has started.",
                                          });
                                        } else {
                                          toast({
                                            title: "Resume Not Available",
                                            description: "No resume available for download for this application",
                                            variant: "destructive"
                                          });
                                        }
                                      }}
                                      disabled={!application.resume || (!application.resume.url && !application.resume.resumeUrl)}
                                    >
                                      📥 {application.resume ? 'Download' : 'No Resume'}
                                    </Button>
                                  </div>
                                  {applicantDetails && (
                                    <div className="text-sm text-gray-600 space-y-1">
                                      {applicantDetails.email && <p><strong>Email:</strong> {applicantDetails.email}</p>}
                                      {applicantDetails.university && <p><strong>University:</strong> {applicantDetails.university}</p>}
                                      {applicantDetails.major && <p><strong>Major:</strong> {applicantDetails.major}</p>}
                                      {applicantDetails.graduationYear && <p><strong>Graduation:</strong> {applicantDetails.graduationYear}</p>}
                                      
                                      {/* Resume Status Indicator */}
                                      <div className="mt-2">
                                        <strong>Resume Status: </strong>
                                        {application.resume && (application.resume.url || application.resume.resumeUrl) ? (
                                          <span className="text-green-600">✓ Resume Available</span>
                                        ) : (
                                          <span className="text-red-600">⚠ No Resume Attached</span>
                                        )}
                                        {application.resume && (
                                          <div className="text-xs text-gray-500 mt-1">
                                            Resume ID: {application.resume._id || 'Unknown'}
                                            {application.resume.filename && <br />}
                                            {application.resume.filename && `Filename: ${application.resume.filename}`}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No applications received for this internship yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-600 text-center">No internships posted yet</p>
                  <p className="text-sm text-gray-500 text-center mt-1">Post your first internship to start receiving applications</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompanyDashboard;
