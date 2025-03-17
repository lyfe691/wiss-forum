import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  bio?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Parse the stored user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);
  
  // Check if the token is valid and get fresh user data
  const checkAuth = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      const { user } = await authAPI.getCurrentUser();
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh user data from the server
  const refreshUser = async () => {
    try {
      // First refresh the token to get latest role
      const tokenResponse = await authAPI.refreshToken();
      const { token, user } = tokenResponse;
      
      // Update token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setUser(user);
      return user;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };
  
  // Register a new user
  const register = async (username: string, email: string, password: string, displayName: string) => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.register({ username, email, password, displayName });
      const { user, token } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast({
        title: "Registration successful!",
        description: `Welcome, ${user.displayName}!`,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Login an existing user
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.login({ username, password });
      const { user, token } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast({
        title: "Login successful!",
        description: `Welcome back, ${user.displayName}!`,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast({
        variant: "destructive",
        title: "Login failed",
        description: message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout the current user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 