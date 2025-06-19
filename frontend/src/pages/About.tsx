import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Brain, 
  Target, 
  Users, 
  Zap, 
  Shield, 
  Globe, 
  Award, 
  TrendingUp,
  Heart,
  Sparkles,
  Building2,
  GraduationCap,
  Rocket,
  CheckCircle,
  Star,
  Code,
  Database,
  Cloud,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Matching",
      description: "Advanced machine learning algorithms analyze resumes and match students with perfect opportunities",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with encrypted data storage and SOC 2 compliance",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Connect with companies and students from around the world",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Apply to multiple internships in seconds with our streamlined process",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Co-Founder",
      bio: "Former VP of Engineering at Google. Stanford CS graduate with 15 years in tech.",
      avatar: "SJ",
      social: { linkedin: "#", twitter: "#" }
    },
    {
      name: "Michael Chen",
      role: "CTO & Co-Founder", 
      bio: "Ex-Principal Engineer at Microsoft. MIT PhD in Machine Learning and AI.",
      avatar: "MC",
      social: { linkedin: "#", twitter: "#" }
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      bio: "Former Product Lead at Airbnb. Harvard MBA with focus on user experience.",
      avatar: "ER",
      social: { linkedin: "#", twitter: "#" }
    },
    {
      name: "David Kim",
      role: "Head of Engineering",
      bio: "Senior Staff Engineer from Meta. Carnegie Mellon CS with distributed systems expertise.",
      avatar: "DK",
      social: { linkedin: "#", twitter: "#" }
    }
  ];

  const stats = [
    { number: "10,000+", label: "Students Placed", description: "Successful internship placements" },
    { number: "2,500+", label: "Partner Companies", description: "From startups to Fortune 500" },
    { number: "95%", label: "Success Rate", description: "Students finding internships" },
    { number: "50+", label: "Countries", description: "Global reach and impact" }
  ];

  const technologies = [
    { name: "React & TypeScript", icon: Code, description: "Modern frontend development" },
    { name: "Node.js & Express", icon: Database, description: "Scalable backend architecture" },
    { name: "MongoDB & Redis", icon: Database, description: "High-performance databases" },
    { name: "AWS Cloud", icon: Cloud, description: "Enterprise cloud infrastructure" },
    { name: "AI/ML Models", icon: Brain, description: "Advanced matching algorithms" },
    { name: "Security First", icon: Lock, description: "End-to-end encryption" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 text-white">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 -left-32 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 mr-2" />
              About InternPortal
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-8">
              Transforming
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Career Connections
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              We're building the future of internship discovery, where AI meets human potential to create perfect career matches.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                  <Rocket className="h-5 w-5 mr-2" />
                  Join Our Mission
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                  <Heart className="h-5 w-5 mr-2" />
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <Badge className="bg-purple-100 text-purple-800 px-4 py-2 mb-6">
            <Target className="h-4 w-4 mr-2" />
            Our Mission
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Bridging the Gap Between
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Talent and Opportunity
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We believe every student deserves access to meaningful career opportunities, and every company should be able to find exceptional talent. Our AI-powered platform makes this vision a reality.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">For Students</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 leading-relaxed">
                Discover internships that match your skills, interests, and career goals. Our AI analyzes your resume and connects you with opportunities that truly fit.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">For Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 leading-relaxed">
                Find the perfect interns for your team. Our platform delivers pre-qualified candidates whose skills and aspirations align with your company culture.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">For Everyone</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 leading-relaxed">
                We're building a more equitable future where career success is determined by potential and passion, not just connections or luck.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white/80 backdrop-blur-sm border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <Badge className="bg-green-100 text-green-800 px-4 py-2 mb-6">
              <TrendingUp className="h-4 w-4 mr-2" />
              Our Impact
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Making a Real Difference</h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-800 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <Badge className="bg-blue-100 text-blue-800 px-4 py-2 mb-6">
            <Zap className="h-4 w-4 mr-2" />
            Platform Features
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Powered by
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cutting-Edge Technology
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`p-4 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-lg leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technology Stack */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Built with Modern Technology</h3>
            <p className="text-gray-600">Enterprise-grade infrastructure ensuring reliability, security, and performance</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {technologies.map((tech, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <tech.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{tech.name}</div>
                  <div className="text-xs text-gray-600">{tech.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2 mb-6">
              <Users className="h-4 w-4 mr-2" />
              Our Team
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Meet the Visionaries Behind
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                InternPortal
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A team of experienced technologists, educators, and career experts united by a common goal: democratizing access to career opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-purple-200">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xl font-bold">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-purple-600 font-semibold">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {member.bio}
                  </p>
                  <div className="flex justify-center space-x-3">
                    <Button variant="outline" size="sm">LinkedIn</Button>
                    <Button variant="outline" size="sm">Twitter</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <Badge className="bg-yellow-100 text-yellow-800 px-4 py-2 mb-6">
            <Award className="h-4 w-4 mr-2" />
            Our Values
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">What Drives Us</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Innovation",
              description: "We constantly push the boundaries of what's possible in career technology",
              icon: Rocket
            },
            {
              title: "Equality", 
              description: "Everyone deserves equal access to career opportunities regardless of background",
              icon: Users
            },
            {
              title: "Excellence",
              description: "We maintain the highest standards in everything we build and deliver",
              icon: Star
            }
          ].map((value, index) => (
            <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {value.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Join Our Mission?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Be part of the future of career development. Whether you're a student or company, we're here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Get Started Today
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
                  <Heart className="h-5 w-5 mr-2" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
