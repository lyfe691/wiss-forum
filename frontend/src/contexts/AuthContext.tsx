import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api';

// Update the role type to match the backend enum
type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  role: Role;
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

  // Parse the stored user data on mount and check with server
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      console.log('Auth initialization - token exists:', !!token);
      
      if (storedUser && token) {
        try {
          // Set from localStorage first for quick UI rendering
          const parsedUser = JSON.parse(storedUser);
          console.log('Initial user from localStorage:', parsedUser.username);
          setUser(parsedUser);
          
          // Then immediately check with server for the latest user data
          await checkAuth();
        } catch (error) {
          console.error('Error during authentication check:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        console.log('No stored credentials found');
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);
  
  // Check if the token is valid and get fresh user data
  const checkAuth = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found during auth check');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      console.log('Checking auth with token');
      
      try {
        // First try to get current user
        const currentUser = await authAPI.getCurrentUser();
        console.log('Current user retrieved:', currentUser.username);
        
        // If successful, update user
        localStorage.setItem('user', JSON.stringify(currentUser));
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to get current user, trying to refresh token:', error);
        
        // If current user fails, try to refresh token
        try {
          const { token: newToken, user } = await authAPI.refreshToken();
          console.log('Token refreshed for user:', user.username);
          
          // Update token and user in localStorage
          localStorage.setItem('token', newToken);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Update state
          setUser(user);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw refreshError;
        }
      }
      
      console.log('Auth check complete');
    } catch (error) {
      console.error('Auth check failed completely:', error);
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
      console.log('Refreshing user data');
      // First refresh the token to get latest role
      const tokenResponse = await authAPI.refreshToken();
      const { token, user } = tokenResponse;
      
      console.log('User refreshed:', user.username);
      
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
      console.log('Attempting to register user:', username);
      const response = await authAPI.register({ username, email, password, displayName });
      console.log('Registration successful, response:', response);
      
      const { user, token } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      console.log('User registered and stored:', user.username);
      
      toast.success("Registration successful!", {
        description: `Welcome, ${user.displayName}!`,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error("Registration failed", {
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
      console.log('Attempting to login user:', username);
      const response = await authAPI.login({ username, password });
      console.log('Login successful, response:', response);
      
      const { user, token } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      console.log('User logged in and stored:', user.username);
      
      toast.success("Login successful!", {
        description: `Welcome back, ${user.displayName}!`,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error("Login failed", {
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
    
    console.log('User logged out');
    
    toast.success("Logged out", {
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