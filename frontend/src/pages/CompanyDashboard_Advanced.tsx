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
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Briefcase, 
  Users, 
  Plus, 
  FileText, 
  TrendingUp, 
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Hourglass,
  Building2,
  GraduationCap,
  Mail,
  Star,
  BarChart3,
  Activity,
  ArrowUpRight,
  Filter,
  Search,
  Zap,
  Award,
  Target
} from 'lucide-react';
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
  applicant?: ApplicationUser;
  resume?: {
    _id?: string;
    url?: string;
    resumeUrl?: string;
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
    const userId = user?._id || user?.id;
    if (!user || !userId || !user.companyName) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [user]);

  const getApplicantInfo = (application: Application) => {
    const applicant = application.user || application.applicant;
    if (!applicant) {
      return { name: 'Anonymous Applicant', details: null };
    }
    const firstName = applicant.firstName || '';
    const lastName = applicant.lastName || '';
    const name = `${firstName} ${lastName}`.trim() || applicant.email || 'Anonymous Applicant';
    return { name, details: applicant };
  };

  const getResumeViewUrl = (resumeUrl: string) => {
    if (resumeUrl.includes('cloudinary.com')) {
      const viewUrl = resumeUrl.includes('fl_attachment') 
        ? resumeUrl 
        : resumeUrl.replace('/upload/', '/upload/fl_attachment/');
      return viewUrl;
    }
    return resumeUrl;
  };

  const fetchData = async () => {
    const userId = user?._id || user?.id;
    if (!userId || !user?.companyName) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/internship?company=${userId}`);
      
      let internshipList = [];
      if (res.data.success && Array.isArray(res.data.data)) {
        internshipList = res.data.data;
      } else if (Array.isArray(res.data)) {
        internshipList = res.data;
      }

      setInternships(internshipList);

      if (internshipList.length > 0) {
        const applicationPromises = internshipList.map(internship => 
          api.get(`/apply/company/${internship._id || internship.id}`).catch(error => {
            console.error(`Error fetching applications for internship ${internship._id || internship.id}:`, error);
            return { data: [] };
          })
        );

        const applicationResponses = await Promise.all(applicationPromises);
        const allApplications: any[] = [];
        
        applicationResponses.forEach((response, index) => {
          const internship = internshipList[index];
          const apps = Array.isArray(response.data) ? response.data : [];
          
          apps.forEach(app => {
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
        
        setApplications(allApplications);
      } else {
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
      const internshipData = {
        ...newInternship,
        requirements: newInternship.requirements.split(',').map(req => req.trim()),
        stipend: parseInt(newInternship.stipend)
      };

      await api.post('/internship', internshipData);
      
      toast({
        title: "Success",
        description: "Internship posted successfully!"
      });

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

  // Calculate stats
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
  const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {user?.companyName}
                </h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <Activity className="h-4 w-4 mr-2" />
                  Company Dashboard
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Internship
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Create New Internship
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Post an exciting opportunity for talented students to join your team
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateInternship} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Position Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g. Software Development Intern"
                          value={newInternship.title}
                          onChange={(e) => setNewInternship({...newInternship, title: e.target.value})}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-semibold text-gray-700">Location</Label>
                        <Input
                          id="location"
                          placeholder="e.g. San Francisco, CA"
                          value={newInternship.location}
                          onChange={(e) => setNewInternship({...newInternship, location: e.target.value})}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Job Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the role, responsibilities, learning opportunities, and what makes this internship special..."
                        value={newInternship.description}
                        onChange={(e) => setNewInternship({...newInternship, description: e.target.value})}
                        className="min-h-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="requirements" className="text-sm font-semibold text-gray-700">Skills & Requirements</Label>
                      <Input
                        id="requirements"
                        value={newInternship.requirements}
                        onChange={(e) => setNewInternship({...newInternship, requirements: e.target.value})}
                        placeholder="React, JavaScript, Node.js, Python, Git"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                      <p className="text-xs text-gray-500">Separate multiple skills with commas</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-sm font-semibold text-gray-700">Work Type</Label>
                        <Select value={newInternship.type} onValueChange={(value) => setNewInternship({...newInternship, type: value})}>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Remote">Remote</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                            <SelectItem value="On-site">On-site</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">Duration</Label>
                        <Input
                          id="duration"
                          value={newInternship.duration}
                          onChange={(e) => setNewInternship({...newInternship, duration: e.target.value})}
                          placeholder="3 months"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stipend" className="text-sm font-semibold text-gray-700">Monthly Stipend ($)</Label>
                        <Input
                          id="stipend"
                          type="number"
                          value={newInternship.stipend}
                          onChange={(e) => setNewInternship({...newInternship, stipend: e.target.value})}
                          placeholder="2000"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 py-3 text-lg font-semibold shadow-lg">
                      <Zap className="h-5 w-5 mr-2" />
                      Create Internship
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-gray-200/50">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="internships" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              My Internships
            </TabsTrigger>
            <TabsTrigger 
              value="applications" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium"
            >
              <Users className="h-4 w-4 mr-2" />
              Applications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Active Internships</CardTitle>
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">{internships.length}</div>
                  <p className="text-xs text-blue-600 mt-1">
                    <ArrowUpRight className="h-3 w-3 inline mr-1" />
                    Live opportunities
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Total Applications</CardTitle>
                  <Users className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">{totalApplications}</div>
                  <p className="text-xs text-green-600 mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    All time
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
                    Awaiting decision
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">Acceptance Rate</CardTitle>
                  <Award className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">
                    {totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0}%
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    <Target className="h-3 w-3 inline mr-1" />
                    Success rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Application Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Application Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Pending Applications</span>
                      <span className="text-sm font-bold text-yellow-600">{pendingApplications}</span>
                    </div>
                    <Progress value={totalApplications > 0 ? (pendingApplications / totalApplications) * 100 : 0} className="h-2 bg-yellow-100" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Accepted Applications</span>
                      <span className="text-sm font-bold text-green-600">{acceptedApplications}</span>
                    </div>
                    <Progress value={totalApplications > 0 ? (acceptedApplications / totalApplications) * 100 : 0} className="h-2 bg-green-100" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Rejected Applications</span>
                      <span className="text-sm font-bold text-red-600">{rejectedApplications}</span>
                    </div>
                    <Progress value={totalApplications > 0 ? (rejectedApplications / totalApplications) * 100 : 0} className="h-2 bg-red-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="w-full justify-start bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Internship
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    Search Applications
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter Candidates
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Applications */}
            {applications.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Recent Applications
                  </CardTitle>
                  <CardDescription>Latest applicants to your internships</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((application) => {
                      const { name: applicantName } = getApplicantInfo(application);
                      return (
                        <div key={application._id || application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-blue-500 text-white">
                                {applicantName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{applicantName}</p>
                              <p className="text-sm text-gray-500">Applied for: {application.internship?.title}</p>
                            </div>
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
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="internships" className="space-y-6">
            <div className="grid gap-6">
              {Array.isArray(internships) && internships.length > 0 ? (
                internships.map((internship: Internship) => (
                  <Card key={internship._id || internship.id} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-gray-900 mb-2">{internship.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                              {internship.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-green-500" />
                              {internship.duration}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-yellow-500" />
                              ${internship.stipend}/month
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {internship.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Active
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            Posted {new Date(internship.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 leading-relaxed">{internship.description}</p>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Required Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {internship.requirements?.map((req: string, index: number) => (
                            <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">
                            {applications.filter(app => app.internshipId === (internship._id || internship.id)).length}
                          </span> applications received
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No internships posted yet</h3>
                    <p className="text-gray-600 text-center mb-6 max-w-md">
                      Start building your talent pipeline by posting your first internship opportunity
                    </p>
                    <Button 
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Post Your First Internship
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            {Array.isArray(internships) && internships.length > 0 ? (
              internships.map((internship: Internship) => {
                const internshipApplications = applications.filter((app: Application) => 
                  app.internship?.id === (internship._id || internship.id) || 
                  app.internshipId === (internship._id || internship.id)
                );

                return (
                  <Card key={internship._id || internship.id} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-xl text-gray-900">{internship.title}</CardTitle>
                          <CardDescription className="flex items-center mt-2 text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            {internship.location} • 
                            <DollarSign className="h-4 w-4 ml-2 mr-1" />
                            ${internship.stipend}/month • {internship.type}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-lg px-3 py-1">
                            {internshipApplications.length} Application{internshipApplications.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {internshipApplications.length > 0 ? (
                        <div className="space-y-6">
                          {internshipApplications.map((application: Application) => {
                            const { name: applicantName, details: applicantDetails } = getApplicantInfo(application);
                            return (
                              <Card key={application._id || application.id} className="border-l-4 border-l-blue-500 bg-gray-50/50">
                                <CardHeader className="pb-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-4">
                                      <Avatar className="h-12 w-12">
                                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold">
                                          {applicantName.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <CardTitle className="text-lg text-gray-900">{applicantName}</CardTitle>
                                        <CardDescription className="flex items-center">
                                          <Calendar className="h-4 w-4 mr-1" />
                                          Applied on {new Date(application.createdAt || application.appliedAt).toLocaleDateString()}
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
                                  <div className="space-y-4">
                                    <div className="flex flex-wrap gap-3">
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => updateApplicationStatus(application._id || application.id, 'accepted')}
                                        disabled={application.status !== 'pending'}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Accept
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => updateApplicationStatus(application._id || application.id, 'rejected')}
                                        disabled={application.status !== 'pending'}
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                          if (application.resume?.url || application.resume?.resumeUrl) {
                                            const resumeUrl = application.resume.url || application.resume.resumeUrl;
                                            const processedUrl = getResumeViewUrl(resumeUrl);
                                            const testLink = document.createElement('a');
                                            testLink.href = processedUrl;
                                            testLink.target = '_blank';
                                            testLink.rel = 'noopener noreferrer';
                                            testLink.download = `Resume_${applicantName.replace(/\s+/g, '_')}.pdf`;
                                            document.body.appendChild(testLink);
                                            testLink.click();
                                            document.body.removeChild(testLink);
                                            toast({
                                              title: "Opening Resume",
                                              description: "Resume is being opened in a new tab.",
                                            });
                                          } else {
                                            toast({
                                              title: "Resume Not Available",
                                              description: "This application doesn't have a resume attached.",
                                              variant: "destructive"
                                            });
                                          }
                                        }}
                                        disabled={!application.resume || (!application.resume.url && !application.resume.resumeUrl)}
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        {application.resume ? 'View Resume' : 'No Resume'}
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                          if (application.resume?.url || application.resume?.resumeUrl) {
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
                                              description: "No resume available for download.",
                                              variant: "destructive"
                                            });
                                          }
                                        }}
                                        disabled={!application.resume || (!application.resume.url && !application.resume.resumeUrl)}
                                      >
                                        <Download className="h-4 w-4 mr-2" />
                                        {application.resume ? 'Download' : 'No Resume'}
                                      </Button>
                                    </div>
                                    
                                    {applicantDetails && (
                                      <div className="bg-white rounded-lg p-4 space-y-3">
                                        <h4 className="font-semibold text-gray-800 flex items-center">
                                          <GraduationCap className="h-4 w-4 mr-2 text-blue-500" />
                                          Candidate Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          {applicantDetails.email && (
                                            <div className="flex items-center">
                                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                              <span className="font-medium text-gray-600">Email:</span>
                                              <span className="ml-2 text-gray-800">{applicantDetails.email}</span>
                                            </div>
                                          )}
                                          {applicantDetails.university && (
                                            <div className="flex items-center">
                                              <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                                              <span className="font-medium text-gray-600">University:</span>
                                              <span className="ml-2 text-gray-800">{applicantDetails.university}</span>
                                            </div>
                                          )}
                                          {applicantDetails.major && (
                                            <div className="flex items-center">
                                              <Star className="h-4 w-4 mr-2 text-gray-400" />
                                              <span className="font-medium text-gray-600">Major:</span>
                                              <span className="ml-2 text-gray-800">{applicantDetails.major}</span>
                                            </div>
                                          )}
                                          {applicantDetails.graduationYear && (
                                            <div className="flex items-center">
                                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                              <span className="font-medium text-gray-600">Graduation:</span>
                                              <span className="ml-2 text-gray-800">{applicantDetails.graduationYear}</span>
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="pt-2 border-t border-gray-100">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-600">Resume Status:</span>
                                            {application.resume && (application.resume.url || application.resume.resumeUrl) ? (
                                              <div className="flex items-center text-green-600">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                <span className="text-sm font-medium">Available</span>
                                              </div>
                                            ) : (
                                              <div className="flex items-center text-red-600">
                                                <XCircle className="h-4 w-4 mr-1" />
                                                <span className="text-sm font-medium">Not Available</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Users className="h-8 w-8 text-gray-400" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h4>
                          <p className="text-gray-600">This internship hasn't received any applications yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 bg-blue-50 rounded-full mb-6">
                    <Briefcase className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No internships posted yet</h3>
                  <p className="text-gray-600 text-center mb-6 max-w-md">
                    Post your first internship to start receiving applications from talented students
                  </p>
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Internship
                  </Button>
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
