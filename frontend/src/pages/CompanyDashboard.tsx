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
  id: string;
  internshipId: string;
  userId: string;
  resumeId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  appliedAt: string;
  user?: ApplicationUser;
  resume?: {
    url: string;
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
    fetchData();
  }, [user?.companyName]); // Add dependency to re-fetch when company name changes

  const fetchData = async () => {
    if (!user?.companyName) return;
    
    try {
      setLoading(true);
      const internshipsRes = await api.get('/internship');
      const companyInternships = internshipsRes.data.filter((intern: Internship) => intern.company === user.companyName);
      setInternships(companyInternships);

      // Fetch applications for company's internships
      // Fetch applications for each internship in parallel
      const applicationPromises = companyInternships.map(internship => 
        api.get(`/apply/company/${internship.id}`).catch(error => {
          console.error(`Error fetching applications for internship ${internship.id}:`, error);
          return { data: [] };
        })
      );

      const applicationResponses = await Promise.all(applicationPromises);
      const appData = applicationResponses.flatMap(response => response.data);
      setApplications(appData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load dashboard data",
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
      
      fetchData();
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
                  <div className="text-2xl font-bold">{internships.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{applications.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {applications.filter((app: Application) => app.status === 'pending').length}
                  </div>
                </CardContent>
              </Card>
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
                      Stipend: ${internship.stipend} • Applications: {applications.filter((app: Application) => app.internshipId === internship.id).length}
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
                        <CardTitle>
                          {application.user ? `${application.user.firstName} ${application.user.lastName}` : 'Anonymous Applicant'}
                        </CardTitle>
                        <CardDescription>
                          {application.internship ? (
                            <>Applied for: {application.internship.title} • {new Date(application.createdAt).toLocaleDateString()}</>
                          ) : (
                            <>Applied on {new Date(application.createdAt).toLocaleDateString()}</>
                          )}
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
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateApplicationStatus(application.id, 'accepted')}
                        disabled={application.status !== 'pending'}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateApplicationStatus(application.id, 'rejected')}
                        disabled={application.status !== 'pending'}
                      >
                        Reject
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Resume
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      {application.user?.university && <p>University: {application.user.university}</p>}
                      {application.user?.major && <p>Major: {application.user.major}</p>}
                      {application.user?.graduationYear && <p>Graduation: {application.user.graduationYear}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompanyDashboard;
