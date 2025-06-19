
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StudentDashboard from './StudentDashboard';
import CompanyDashboard from './CompanyDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, GraduationCap, Building2, Sparkles } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8">
            <div className="relative mb-8">
              {/* Animated Logo */}
              <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl relative">
                <Briefcase className="h-12 w-12 text-white" />
                <div className="absolute -top-2 -right-2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                  <Sparkles className="h-4 w-4 text-white animate-pulse" />
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
              <div className="absolute -bottom-2 -right-4 w-4 h-4 bg-green-400 rounded-full animate-pulse delay-300"></div>
            </div>
            
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Loading InternPortal
              </h2>
              <p className="text-gray-600">Preparing your personalized dashboard...</p>
              
              {/* Enhanced Loading Spinner */}
              <div className="flex justify-center mt-6">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent absolute inset-0"></div>
                </div>
              </div>
              
              {/* Feature Icons */}
              <div className="flex justify-center items-center space-x-8 mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="p-2 bg-purple-100 rounded-lg mb-2">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-xs text-gray-500">Students</span>
                </div>
                <div className="text-center">
                  <div className="p-2 bg-blue-100 rounded-lg mb-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-500">Companies</span>
                </div>
                <div className="text-center">
                  <div className="p-2 bg-yellow-100 rounded-lg mb-2">
                    <Sparkles className="h-5 w-5 text-yellow-600" />
                  </div>
                  <span className="text-xs text-gray-500">AI Powered</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return user.role === 'student' ? <StudentDashboard /> : <CompanyDashboard />;
};

export default Dashboard;
