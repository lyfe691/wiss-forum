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
  refreshUser: () => Promise<User>;
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
          
          // Then try to check auth with server, but don't unset user if it fails
          try {
            await checkAuth();
          } catch (serverError) {
            console.error('Server auth check failed, but keeping user logged in:', serverError);
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Only clear if we can't parse the data
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        console.log('No stored credentials found');
        setUser(null);
      }
      
      setIsLoading(false);
    };
    
    initialize();
  }, []);
  
  // Check if the token is valid and get fresh user data
  const checkAuth = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        console.log('No token or user found during auth check');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      // Parse the stored user data
      const parsedUser = JSON.parse(storedUser);
      console.log('Using stored user data:', parsedUser.username);
      
      // Set user from localStorage first, so the user remains logged in even if API calls fail
      setUser(parsedUser);
      
      console.log('Checking auth with token');
      
      try {
        // Try to get current user from the server - use silent method to prevent console errors
        const currentUser = await authAPI.silentGetCurrentUser();
        if (currentUser) {
          console.log('Current user retrieved from server:', currentUser.username);
          
          // Create properly formatted user object
          const userData = {
            _id: currentUser.id || currentUser._id,
            username: currentUser.username,
            email: currentUser.email,
            displayName: currentUser.displayName,
            role: currentUser.role,
            avatar: currentUser.avatar,
            bio: currentUser.bio,
            createdAt: currentUser.createdAt
          };
          
          // Update user in localStorage and state
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        }
      } catch (error) {
        console.log('Using fallback authentication method');
        
        // If current user fails, try to refresh token - use silent method
        try {
          const refreshResponse = await authAPI.silentRefreshToken();
          
          if (refreshResponse) {
            // Create properly formatted user object from refresh response
            const userData = {
              _id: refreshResponse.id,
              username: refreshResponse.username,
              email: refreshResponse.email,
              displayName: refreshResponse.displayName,
              role: refreshResponse.role,
              avatar: refreshResponse.avatar
            };
            
            console.log('Token refreshed for user:', userData.username);
            
            // Update token and user in localStorage
            localStorage.setItem('token', refreshResponse.token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Update state
            setUser(userData);
          }
        } catch (refreshError) {
          // No need to log refresh errors
          console.log('Continuing with stored user data');
        }
      }
      
      console.log('Auth check complete');
    } catch (error) {
      console.error('Auth check failed completely:', error);
      
      // Try to recover with stored user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          console.log('Recovering from localStorage');
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (parseError) {
          console.error('Failed to parse stored user:', parseError);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh user data from the server
  const refreshUser = async () => {
    try {
      console.log('Refreshing user data');
      // First refresh the token to get latest role
      const response = await authAPI.refreshToken();
      
      // Clean token format
      const token = response.token?.replace(/^Bearer\s+/i, '') || '';
      
      // The API returns the user data directly in the response, not nested in a user property
      const userData = {
        _id: response.id,
        username: response.username,
        email: response.email,
        displayName: response.displayName,
        role: response.role,
        avatar: response.avatar
      };
      
      console.log('User refreshed:', userData.username);
      
      // Update token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      return userData;
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
      
      // Clean token format
      const token = response.token?.replace(/^Bearer\s+/i, '') || '';
      
      // The API returns the user data directly in the response, not nested in a user property
      const userData = {
        _id: response.id,
        username: response.username,
        email: response.email,
        displayName: response.displayName,
        role: response.role,
        avatar: response.avatar
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('User registered and stored:', userData.username);
      
      toast.success("Registration successful!", {
        description: `Welcome, ${userData.displayName}!`,
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
      
      // Extract and clean the token, ensuring no "Bearer " prefix is stored
      const token = response.token?.replace(/^Bearer\s+/i, '') || '';
      
      // The API returns the user data directly in the response, not nested in a user property
      const userData = {
        _id: response.id,
        username: response.username,
        email: response.email,
        displayName: response.displayName,
        role: response.role,
        avatar: response.avatar
      };
      
      // Save token and user to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('User logged in and stored:', userData.username);
      
      toast.success("Login successful!", {
        description: `Welcome back, ${userData.displayName}!`,
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