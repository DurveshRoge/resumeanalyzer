import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
import type { User, LoginResponse, RegistrationData, APIResponse, APILoginResponse } from '@/types/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<'student' | 'company'>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(userData);
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const getDashboardPath = (userRole?: 'student' | 'company') => {
    if (userRole === 'student') return '/student/dashboard';
    if (userRole === 'company') return '/company/dashboard';
    return '/dashboard';
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password
      });

      // Debug response
      console.log('Full response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });

      // Check if response has the expected structure
      if (!response.data) {
        console.error('Empty response data:', response);
        throw new Error("No data received from server");
      }

      const { token: newToken, user: userData } = response.data;

      if (!newToken || !userData) {
        console.error('Invalid response format:', response.data);
        throw new Error("Invalid response format from server");
      }

      if (!newToken || !userData) {
        throw new Error("Invalid response format");
      }

      // Verify user data before saving
      if (!userData.id || !userData.email || !userData.role) {
        console.error('Invalid user data:', userData);
        throw new Error("Incomplete user data received");
      }
      
      setToken(newToken);
      setUser(userData);
      
      // Save to localStorage after validation
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set API authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in."
      });

      // Return the user role for navigation
      return userData.role as 'student' | 'company';
    } catch (error: any) {
      // Enhanced error logging
      console.error('Login error details:', {
        error,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMsg = error.response?.data?.message || error.message || "Failed to login. Please check your credentials.";
      toast({
        title: "Login Failed",
        description: errorMsg,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegistrationData) => {
    try {
      setLoading(true);
      const response = await api.post<LoginResponse>('/auth/register', userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast({
        title: "Welcome!",
        description: "Your account has been created successfully."
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Registration failed. Please try again.";
      toast({
        title: "Registration Failed",
        description: errorMsg,
        variant: "destructive"
      });
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    toast({
      title: "Goodbye!",
      description: "You've been successfully logged out."
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
