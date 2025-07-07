import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '@/pages/auth/Login';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the AuthContext
const mockLogin = vi.fn();
const mockNavigate = vi.fn();
const mockLocation = {
  state: { from: { pathname: '/dashboard' } }
};

vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: any) => children,
  useAuth: () => ({
    login: mockLogin,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Login Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render login form with all elements', () => {
      renderLogin();
      
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Enter your credentials to sign in to your account')).toBeInTheDocument();
      expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /don't have an account/i })).toBeInTheDocument();
    });

    it('should render form inputs with correct attributes', () => {
      renderLogin();
      
      const usernameInput = screen.getByLabelText(/username or email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(usernameInput).toHaveAttribute('placeholder', 'Enter your username or email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password');
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty fields', async () => {
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should show validation error for empty username only', async () => {
      renderLogin();
      
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
        expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
      });
    });

    it('should show validation error for empty password only', async () => {
      renderLogin();
      
      const usernameInput = screen.getByLabelText(/username or email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(usernameInput, 'testuser');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
        expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
      });
    });

    it('should not show validation errors when both fields are filled', async () => {
      renderLogin();
      
      const usernameInput = screen.getByLabelText(/username or email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
        expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Authentication Flow', () => {
    it('should call login function with correct credentials', async () => {
      mockLogin.mockResolvedValue(undefined);
      renderLogin();
      
      const usernameInput = screen.getByLabelText(/username or email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
      });
    });

    it('should navigate to redirect path after successful login', async () => {
      mockLogin.mockResolvedValue(undefined);
      renderLogin();
      
      const usernameInput = screen.getByLabelText(/username or email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should show loading state during login', async () => {
      // Mock login to take some time
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      renderLogin();
      
      const usernameInput = screen.getByLabelText(/username or email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      await waitFor(() => {
        expect(screen.getByText('Sign in')).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display generic error for authentication failure', async () => {
      mockLogin.mockRejectedValue(new Error('Authentication failed'));
      renderLogin();
      
      const usernameInput = screen.getByLabelText(/username or email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
      });
    });

    it('should display session expired error for token issues', async () => {
      const error = {
        response: {
          data: {
            message: 'Session expired. Please log in again.'
          }
        }
      };
      mockLogin.mockRejectedValue(error);
      renderLogin();
      
      const usernameInput = screen.getByLabelText(/username or email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Your session has expired. Please try again.')).toBeInTheDocument();
      });
    });

    it('should display server error for server issues', async () => {
      const error = {
        response: {
          data: {
            message: 'Internal server error'
          }
        }
      };
      mockLogin.mockRejectedValue(error);
      renderLogin();
      
      const usernameInput = screen.getByLabelText(/username or email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Server error. Please try again later.')).toBeInTheDocument();
      });
    });

    it('should clear error when retrying login', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Authentication failed'));
      renderLogin();
      
      const usernameInput = screen.getByLabelText(/username or email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // First attempt - should fail
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
      });
      
      // Second attempt - should clear error
      mockLogin.mockResolvedValue(undefined);
      await user.clear(passwordInput);
      await user.type(passwordInput, 'correctpassword');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Invalid username or password')).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to forgot password page', async () => {
      renderLogin();
      
      const forgotPasswordButton = screen.getByRole('button', { name: /forgot password/i });
      await user.click(forgotPasswordButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
    });

    it('should navigate to register page', async () => {
      renderLogin();
      
      const registerButton = screen.getByRole('button', { name: /don't have an account/i });
      await user.click(registerButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in username field', async () => {
      renderLogin();
      
      const usernameInput = screen.getByLabelText(/username or email/i);
      
      await user.type(usernameInput, 'testuser@wiss-edu.ch');
      
      expect(usernameInput).toHaveValue('testuser@wiss-edu.ch');
    });

    it('should allow typing in password field', async () => {
      renderLogin();
      
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(passwordInput, 'secretpassword123');
      
      expect(passwordInput).toHaveValue('secretpassword123');
    });

    it('should submit form on Enter key press', async () => {
      mockLogin.mockResolvedValue(undefined);
      renderLogin();
      
      const usernameInput = screen.getByLabelText(/username or email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
      });
    });

    it('should clear form validation errors when user starts typing', async () => {
      renderLogin();
      
      const usernameInput = screen.getByLabelText(/username or email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Trigger validation error
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
      });
      
      // Start typing - should clear error
      await user.type(usernameInput, 'test');
      
      await waitFor(() => {
        expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderLogin();
      
      expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      renderLogin();
      
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /don't have an account/i })).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
      renderLogin();
      
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });
}); 