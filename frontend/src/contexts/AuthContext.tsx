import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api';
import { userAPI } from '@/lib/api';

type Role = 'student' | 'teacher' | 'admin';

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
  login: (username: string, password: string, options?: { suppressNotification?: boolean }) => Promise<void>;
  register: (username: string, email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Normalize the role format for consistent comparisons
const normalizeUserData = (userData: any): User | null => {
  if (!userData) return null;
  
  // Handle role
  let role: Role = 'student';
  if (userData.role) {
    const roleValue = typeof userData.role === 'string' 
      ? userData.role.toLowerCase() 
      : typeof userData.role === 'object' && userData.role !== null
        ? String(userData.role.name || userData.role).toLowerCase()
        : 'student';
    
    if (roleValue === 'admin' || roleValue === 'teacher' || roleValue === 'student') {
      role = roleValue as Role;
    }
  }
  
  // Use fallbacks for required fields
  const id = userData._id || userData.id || '';
  const username = userData.username || '';
  const email = userData.email || '';
  const displayName = userData.displayName || username || '';
  
  if (!id || !username) {
    console.error('Missing required user data fields:', { id, username });
    return null;
  }
  
  return {
    _id: id,
    username: username,
    email: email,
    displayName: displayName,
    role: role,
    avatar: userData.avatar,
    bio: userData.bio,
    createdAt: userData.createdAt
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Parse the stored user data on mount
  useEffect(() => {
    setIsLoading(true);
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  }, []);
  
  // Refresh user data from the server
  const refreshUser = async (): Promise<User> => {
    try {
      const data = await userAPI.getUserProfile();
      const normalizedUser = normalizeUserData(data);
      if (normalizedUser) {
        setUser(normalizedUser);
        return normalizedUser;
      }
      throw new Error('Failed to refresh user data');
    } catch (error) {
      // If fetching user fails, log out
      logout();
      throw error;
    }
  };
  
  // Register a new user
  const register = async (username: string, email: string, password: string, displayName: string) => {
    setIsLoading(true);
    
    try {
      console.log('Registration attempt for:', username);
      
      // First, try to register the user
      const response = await authAPI.register({ username, email, password, displayName });
      console.log('Register response from API:', response);
      
      // Check if the register response contains a success message
      if (response && response.message && response.message.includes('success')) {
        console.log('Registration successful, attempting to login');
        
        // If registration is successful but no user data is returned, login immediately
        try {
          // Use the login function to get the user data but suppress the notification
          await login(username, password, { suppressNotification: true });
          
          // Login successful, we now have the user data
          toast.success("Registration successful!", {
            description: `Welcome, ${displayName}!`,
          });
          
          return;
        } catch (loginError) {
          console.error('Auto-login after registration failed:', loginError);
          // Continue processing the registration response
        }
      }
      
      // Process the response if it has user data
      const token = response.token?.replace(/^Bearer\s+/i, '') || '';
      console.log('Token extracted:', token ? 'Token present' : 'No token');
      
      // If we don't have an ID but registration was successful, create a temporary user object
      if (!response.id) {
        console.log('No user ID in response, but registration was successful');
        
        const userData: User = {
          _id: 'temp-' + Date.now(), // Temporary ID until login refreshes it
          username: username,
          email: email,
          displayName: displayName,
          role: 'student',
          avatar: undefined
        };
        console.log('Created temporary user data:', userData);
        
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        }
        
        // Try to login immediately to get the actual user data
        try {
          await login(username, password, { suppressNotification: true });
        } catch (loginError) {
          console.warn('Could not auto-login after registration', loginError);
          // Continue with the temporary user data
        }
        
        toast.success("Registration successful!", {
          description: `Welcome, ${displayName}!`,
        });
        
        return;
      }
      
      // If we do have proper user data in the response, use it
      // Ensure displayName is never undefined
      const finalDisplayName = response.displayName || displayName || username;
      console.log('Display name resolved to:', finalDisplayName);
      
      // Handle role
      let role: Role = 'student';
      if (response.role) {
        const lowerRole = String(response.role).toLowerCase();
        if (lowerRole === 'admin' || lowerRole === 'teacher' || lowerRole === 'student') {
          role = lowerRole as Role;
        }
      }
      console.log('Role resolved to:', role);
      
      const userData: User = {
        _id: response.id,
        username: response.username || username,
        email: response.email || email,
        displayName: finalDisplayName,
        role: role,
        avatar: response.avatar || undefined
      };
      console.log('Final user data to store:', userData);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success("Registration successful!", {
        description: `Welcome, ${userData.displayName}!`,
      });
    } catch (error: any) {
      console.error('Registration error details:', error);
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
  const login = async (username: string, password: string, options?: { suppressNotification?: boolean }) => {
    setIsLoading(true);
    
    try {
      // Check if input is email or username
      const isEmail = username.includes('@');
      console.log(`Login attempt for: ${isEmail ? 'email' : 'username'} - ${username}`);
      
      const response = await authAPI.login({ username, password });
      console.log('Login response from API:', response);
      
      // Get the token from the response
      const token = response.token?.replace(/^Bearer\s+/i, '') || '';
      console.log('Token extracted:', token ? 'Token present' : 'No token');
      
      // Make sure we have a valid user ID and displayName
      if (!response.id) {
        console.error('No user ID returned from login response');
        throw new Error('Invalid login response: No user ID returned');
      }
      
      // Ensure displayName is never undefined - use username as fallback
      const displayName = response.displayName || response.username || username;
      console.log('Display name resolved to:', displayName);
      
      // Get the role and ensure it's one of the valid Role types
      let role: Role = 'student';
      if (response.role) {
        const lowerRole = String(response.role).toLowerCase();
        if (lowerRole === 'admin' || lowerRole === 'teacher' || lowerRole === 'student') {
          role = lowerRole as Role;
        }
      }
      console.log('Role resolved to:', role);
      
      // Get the user data from the response, ensuring each field has a valid value
      const userData: User = {
        _id: response.id,
        username: response.username || username.includes('@') ? username.split('@')[0] : username,
        email: response.email || (username.includes('@') ? username : ''),
        displayName: displayName,
        role: role,
        avatar: response.avatar || undefined
      };
      console.log('Final user data to store:', userData);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Only show toast if not suppressed
      if (!options?.suppressNotification) {
        toast.success("Login successful!", {
          description: `Welcome back, ${userData.displayName}!`,
        });
      }
      
      // Fetch complete user profile to ensure we have all data
      try {
        await refreshUser();
      } catch (refreshError) {
        console.warn('Could not refresh user profile after login', refreshError);
        // Continue anyway since we have basic user data
      }
      
    } catch (error: any) {
      console.error('Login error details:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      // Only show toast if not suppressed
      if (!options?.suppressNotification) {
        const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
        toast.error("Login failed", {
          description: message,
        });
      }
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
    
    toast.success("Logged out", {
      description: "You have been successfully logged out.",
    });
  };

  // Check authentication status and refresh user data
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }
    
    try {
      await refreshUser();
    } catch (error) {
      console.error('Error checking auth status:', error);
      logout();
    }
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
        refreshUser,
        checkAuth,
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