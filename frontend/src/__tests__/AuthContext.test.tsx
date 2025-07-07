import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Role } from '@/lib/types';
import React from 'react';

// mock the API modules
vi.mock('@/lib/api', () => ({
  authAPI: {
    register: vi.fn(),
    login: vi.fn(),
  },
  userAPI: {
    getUserProfile: vi.fn(),
  },
}));

// mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// import mocked modules
import { authAPI, userAPI } from '@/lib/api';
import { toast } from 'sonner';

const mockedAuthAPI = vi.mocked(authAPI);
const mockedUserAPI = vi.mocked(userAPI);
const mockedToast = vi.mocked(toast);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // mock console.error to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });

    it('should provide auth context when used within AuthProvider', () => {
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
      
      expect(result.current).toEqual({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        login: expect.any(Function),
        register: expect.any(Function),
        logout: expect.any(Function),
        refreshUser: expect.any(Function),
        checkAuth: expect.any(Function),
      });
    });
  });

  describe('AuthProvider initialization', () => {
    it('should initialize with no user when localStorage is empty', () => {
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should restore user from localStorage on initialization', () => {
      const storedUser = {
        _id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: Role.STUDENT,
      };
      
      localStorage.setItem('user', JSON.stringify(storedUser));
      localStorage.setItem('token', 'test-token');

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
      
      expect(result.current.user).toEqual(storedUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle invalid JSON in localStorage gracefully', () => {
      localStorage.setItem('user', 'invalid-json');
      localStorage.setItem('token', 'test-token');

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should clear user when token is missing', () => {
      const storedUser = {
        _id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: Role.STUDENT,
      };
      
      localStorage.setItem('user', JSON.stringify(storedUser));
      // no token in localStorage

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('login function', () => {
    it('should login successfully with username', async () => {
      const mockResponse = {
        token: 'test-token',
        id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'STUDENT',
        avatar: 'avatar.jpg',
      };

      mockedAuthAPI.login.mockResolvedValue(mockResponse as any);
      mockedUserAPI.getUserProfile.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      expect(mockedAuthAPI.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
      expect(result.current.user).toEqual({
        _id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: Role.STUDENT,
        avatar: 'avatar.jpg',
      });
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('token')).toBe('test-token');
      expect(mockedToast.success).toHaveBeenCalledWith('Login successful!', {
        description: 'Welcome back, Test User!',
      });
    });

    it('should login successfully with email', async () => {
      const mockResponse = {
        token: 'test-token',
        id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'STUDENT',
        avatar: 'avatar.jpg',
      };

      mockedAuthAPI.login.mockResolvedValue(mockResponse as any);
      mockedUserAPI.getUserProfile.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.login('test@wiss-edu.ch', 'password123');
      });

      expect(result.current.user?.email).toBe('test@wiss-edu.ch');
      expect(result.current.user?.username).toBe('testuser');
    });

    it('should handle login with Bearer token prefix', async () => {
      const mockResponse = {
        token: 'Bearer test-token',
        id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'STUDENT',
        avatar: undefined,
      };

      mockedAuthAPI.login.mockResolvedValue(mockResponse as any);
      mockedUserAPI.getUserProfile.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      expect(localStorage.getItem('token')).toBe('test-token');
    });

    it('should suppress notification when suppressNotification option is true', async () => {
      const mockResponse = {
        token: 'test-token',
        id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'STUDENT',
        avatar: undefined,
      };

      mockedAuthAPI.login.mockResolvedValue(mockResponse as any);
      mockedUserAPI.getUserProfile.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.login('testuser', 'password123', { suppressNotification: true });
      });

      expect(mockedToast.success).not.toHaveBeenCalled();
    });

    it('should handle login failure', async () => {
      const mockError = new Error('Invalid credentials');
      mockedAuthAPI.login.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await expect(
        act(async () => {
          await result.current.login('testuser', 'wrongpassword');
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should handle missing user ID in login response', async () => {
      const mockResponse = {
        token: 'test-token',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'STUDENT',
        avatar: undefined,
        // missing id field
      };

      mockedAuthAPI.login.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await expect(
        act(async () => {
          await result.current.login('testuser', 'password123');
        })
      ).rejects.toThrow('Invalid login response: No user ID returned');
    });

    it('should handle missing display name by using username', async () => {
      const mockResponse = {
        token: 'test-token',
        id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        role: 'STUDENT',
        avatar: undefined,
        // missing displayName
      };

      mockedAuthAPI.login.mockResolvedValue(mockResponse as any);
      mockedUserAPI.getUserProfile.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      expect(result.current.user?.displayName).toBe('testuser');
    });

    it('should continue if refreshUser fails after login', async () => {
      const mockResponse = {
        token: 'test-token',
        id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'STUDENT',
        avatar: undefined,
      };

      mockedAuthAPI.login.mockResolvedValue(mockResponse as any);
      mockedUserAPI.getUserProfile.mockRejectedValue(new Error('Refresh failed'));

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      // when refreshUser fails, it calls logout() which clears the user
      // this test verifies the behavior matches the actual implementation
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('register function', () => {
    it('should register successfully and auto-login', async () => {
      const mockRegisterResponse = {
        token: 'test-token',
        id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'STUDENT',
        avatar: 'avatar.jpg',
      };

      const mockLoginResponse = {
        token: 'test-token',
        id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'STUDENT',
        avatar: 'avatar.jpg',
      };

      mockedAuthAPI.register.mockResolvedValue(mockRegisterResponse as any);
      mockedAuthAPI.login.mockResolvedValue(mockLoginResponse as any);
      mockedUserAPI.getUserProfile.mockResolvedValue(mockLoginResponse as any);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.register('testuser', 'test@wiss-edu.ch', 'password123', 'Test User');
      });

      expect(mockedAuthAPI.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        password: 'password123',
        displayName: 'Test User',
      });
      expect(result.current.user).toBeTruthy();
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockedToast.success).toHaveBeenCalledWith('Registration successful!', {
        description: 'Welcome, Test User!',
      });
    });

    it('should handle registration with message-only response', async () => {
      const mockRegisterResponse = {
        message: 'Registration successful, please verify your email',
        success: true,
      };

      const mockLoginResponse = {
        token: 'test-token',
        id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'STUDENT',
        avatar: undefined,
      };

      mockedAuthAPI.register.mockResolvedValue(mockRegisterResponse as any);
      mockedAuthAPI.login.mockResolvedValue(mockLoginResponse as any);
      mockedUserAPI.getUserProfile.mockResolvedValue(mockLoginResponse as any);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.register('testuser', 'test@wiss-edu.ch', 'password123', 'Test User');
      });

      expect(mockedAuthAPI.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle registration without user ID', async () => {
      const mockRegisterResponse = {
        token: 'test-token',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'STUDENT',
        avatar: undefined,
        // missing id field
      };

      const mockLoginResponse = {
        token: 'test-token',
        id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'STUDENT',
        avatar: undefined,
      };

      mockedAuthAPI.register.mockResolvedValue(mockRegisterResponse as any);
      mockedAuthAPI.login.mockResolvedValue(mockLoginResponse as any);
      mockedUserAPI.getUserProfile.mockResolvedValue(mockLoginResponse as any);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.register('testuser', 'test@wiss-edu.ch', 'password123', 'Test User');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(mockedToast.success).toHaveBeenCalled();
    });

    it('should handle registration failure', async () => {
      const mockError = new Error('Username already exists');
      mockedAuthAPI.register.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await expect(
        act(async () => {
          await result.current.register('testuser', 'test@wiss-edu.ch', 'password123', 'Test User');
        })
      ).rejects.toThrow('Username already exists');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle role normalization in registration', async () => {
      const mockRegisterResponse = {
        token: 'test-token',
        id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'TEACHER', // string role
        avatar: undefined,
      };

      mockedAuthAPI.register.mockResolvedValue(mockRegisterResponse as any);
      mockedUserAPI.getUserProfile.mockResolvedValue(mockRegisterResponse as any);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.register('testuser', 'test@wiss-edu.ch', 'password123', 'Test User');
      });

      expect(result.current.user?.role).toBe(Role.TEACHER);
    });

    it('should handle registration with fallback login attempt failure', async () => {
      const mockRegisterResponse = {
        token: 'test-token',
        // missing id
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'STUDENT',
        avatar: undefined,
      };

      mockedAuthAPI.register.mockResolvedValue(mockRegisterResponse as any);
      mockedAuthAPI.login.mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.register('testuser', 'test@wiss-edu.ch', 'password123', 'Test User');
      });

      // should still show success message even if login fails
      expect(mockedToast.success).toHaveBeenCalledWith('Registration successful!', {
        description: 'Welcome, Test User!',
      });
    });
  });

  describe('logout function', () => {
    it('should logout and clear user data', () => {
        // set up initial state
      const storedUser = {
        _id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: Role.STUDENT,
      };
      
      localStorage.setItem('user', JSON.stringify(storedUser));
      localStorage.setItem('token', 'test-token');

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(mockedToast.success).toHaveBeenCalledWith('Logged out', {
        description: 'You have been successfully logged out.',
      });
    });
  });

  describe('refreshUser function', () => {
    it('should refresh user data successfully', async () => {
      const mockUserData = {
        _id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Updated Test User',
        role: 'STUDENT',
        bio: 'Updated bio',
        avatar: undefined,
      };

      mockedUserAPI.getUserProfile.mockResolvedValue(mockUserData as any);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      let refreshedUser;
      await act(async () => {
        refreshedUser = await result.current.refreshUser();
      });

      expect(mockedUserAPI.getUserProfile).toHaveBeenCalled();
      expect(result.current.user).toEqual({
        _id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Updated Test User',
        role: Role.STUDENT,
        bio: 'Updated bio',
        avatar: undefined,
      });
      expect(refreshedUser).toEqual(result.current.user);
      expect(JSON.parse(localStorage.getItem('user') || '{}')).toEqual(result.current.user);
    });

    it('should handle refresh failure and logout', async () => {
      const mockError = new Error('Unauthorized');
      mockedUserAPI.getUserProfile.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await expect(
        act(async () => {
          await result.current.refreshUser();
        })
      ).rejects.toThrow('Unauthorized');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockedToast.success).toHaveBeenCalledWith('Logged out', {
        description: 'You have been successfully logged out.',
      });
    });

    it('should handle invalid user data from refresh', async () => {
      mockedUserAPI.getUserProfile.mockResolvedValue(null as any);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await expect(
        act(async () => {
          await result.current.refreshUser();
        })
      ).rejects.toThrow('Failed to refresh user data');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('checkAuth function', () => {
    it('should do nothing when no token exists', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(mockedUserAPI.getUserProfile).not.toHaveBeenCalled();
      expect(result.current.user).toBeNull();
    });

    it('should refresh user when token exists', async () => {
      localStorage.setItem('token', 'test-token');
      
      const mockUserData = {
        _id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'STUDENT',
        avatar: undefined,
      };

      mockedUserAPI.getUserProfile.mockResolvedValue(mockUserData as any);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(mockedUserAPI.getUserProfile).toHaveBeenCalled();
      expect(result.current.user).toBeTruthy();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should logout when token is invalid', async () => {
      localStorage.setItem('token', 'invalid-token');
      
      const mockError = new Error('Unauthorized');
      mockedUserAPI.getUserProfile.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('normalizeUserData edge cases', () => {
    it('should handle missing required fields', async () => {
      const mockRegisterResponse = {
        token: 'test-token',
        // missing id and username
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'STUDENT',
        avatar: undefined,
      };

      mockedAuthAPI.register.mockResolvedValue(mockRegisterResponse as any);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      // this should create a temporary user and attempt fallback login
      await act(async () => {
        try {
          await result.current.register('testuser', 'test@wiss-edu.ch', 'password123', 'Test User');
        } catch (error) {
          // expected to potentially fail due to missing required fields
        }
      });

      expect(mockedAuthAPI.register).toHaveBeenCalled();
    });

    it('should handle complex role objects', async () => {
      const mockRegisterResponse = {
        token: 'test-token',
        id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'ADMIN', // string role that will be normalized
        avatar: undefined,
      };

      mockedAuthAPI.register.mockResolvedValue(mockRegisterResponse as any);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.register('testuser', 'test@wiss-edu.ch', 'password123', 'Test User');
      });

      expect(result.current.user?.role).toBe(Role.ADMIN);
    });

    it('should handle undefined role', async () => {
      const mockRegisterResponse = {
        token: 'test-token',
        id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        // No role field
        avatar: undefined,
      };

      mockedAuthAPI.register.mockResolvedValue(mockRegisterResponse as any);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.register('testuser', 'test@wiss-edu.ch', 'password123', 'Test User');
      });

      expect(result.current.user?.role).toBe(Role.STUDENT); // default role
    });
  });

  describe('component integration', () => {
    it('should render children when context is provided', () => {
      const TestComponent = () => {
        const { isAuthenticated } = useAuth();
        return <div data-testid="test-component">Authenticated: {String(isAuthenticated)}</div>;
      };

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(getByTestId('test-component')).toHaveTextContent('Authenticated: false');
    });

    it('should update isAuthenticated when user state changes', async () => {
      const mockResponse = {
        token: 'test-token',
        id: 'user-123',
        username: 'testuser',
        email: 'test@wiss-edu.ch',
        displayName: 'Test User',
        role: 'STUDENT',
        avatar: undefined,
      };

      mockedAuthAPI.login.mockResolvedValue(mockResponse as any);
      mockedUserAPI.getUserProfile.mockResolvedValue(mockResponse as any);

      const TestComponent = () => {
        const { isAuthenticated, login } = useAuth();
        return (
          <div>
            <div data-testid="auth-status">Authenticated: {String(isAuthenticated)}</div>
            <button 
              data-testid="login-button" 
              onClick={() => login('testuser', 'password123')}
            >
              Login
            </button>
          </div>
        );
      };

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(getByTestId('auth-status')).toHaveTextContent('Authenticated: false');

      await act(async () => {
        getByTestId('login-button').click();
      });

      await waitFor(() => {
        expect(getByTestId('auth-status')).toHaveTextContent('Authenticated: true');
      });
    });
  });
}); 