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

const normalizeUserData = (userData: any): User | null => {
  if (!userData) return null;

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
    username,
    email,
    displayName,
    role,
    avatar: userData.avatar,
    bio: userData.bio,
    createdAt: userData.createdAt,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
      logout();
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, displayName: string) => {
    setIsLoading(true);

    try {
      const response = await authAPI.register({ username, email, password, displayName });

      if (response && response.message && response.message.includes('success')) {
        try {
          await login(username, password, { suppressNotification: true });
          toast.success("Registration successful!", {
            description: `Welcome, ${displayName}!`,
          });
          return;
        } catch {}
      }

      const token = response.token?.replace(/^Bearer\s+/i, '') || '';

      if (!response.id) {
        const userData: User = {
          _id: 'temp-' + Date.now(),
          username,
          email,
          displayName,
          role: 'student',
          avatar: undefined,
        };

        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        }

        try {
          await login(username, password, { suppressNotification: true });
        } catch {}

        toast.success("Registration successful!", {
          description: `Welcome, ${displayName}!`,
        });

        return;
      }

      const finalDisplayName = response.displayName || displayName || username;

      let role: Role = 'student';
      if (response.role) {
        const lowerRole = String(response.role).toLowerCase();
        if (lowerRole === 'admin' || lowerRole === 'teacher' || lowerRole === 'student') {
          role = lowerRole as Role;
        }
      }

      const userData: User = {
        _id: response.id,
        username: response.username || username,
        email: response.email || email,
        displayName: finalDisplayName,
        role,
        avatar: response.avatar || undefined,
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      toast.success("Registration successful!", {
        description: `Welcome, ${userData.displayName}!`,
      });
    } catch (error) {
      console.error('Registration error details:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string, options?: { suppressNotification?: boolean }) => {
    setIsLoading(true);

    try {
      const isEmail = username.includes('@');
      const response = await authAPI.login({ username, password });

      const token = response.token?.replace(/^Bearer\s+/i, '') || '';

      if (!response.id) {
        throw new Error('Invalid login response: No user ID returned');
      }

      const displayName = response.displayName || response.username || username;

      let role: Role = 'student';
      if (response.role) {
        const lowerRole = String(response.role).toLowerCase();
        if (lowerRole === 'admin' || lowerRole === 'teacher' || lowerRole === 'student') {
          role = lowerRole as Role;
        }
      }

      const userData: User = {
        _id: response.id,
        username: response.username || (isEmail ? username.split('@')[0] : username),
        email: response.email || (isEmail ? username : ''),
        displayName,
        role,
        avatar: response.avatar || undefined,
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      if (!options?.suppressNotification) {
        toast.success("Login successful!", {
          description: `Welcome back, ${userData.displayName}!`,
        });
      }

      try {
        await refreshUser();
      } catch {}
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);

    toast.success("Logged out", {
      description: "You have been successfully logged out.",
    });
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }

    try {
      await refreshUser();
    } catch (error) {
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
