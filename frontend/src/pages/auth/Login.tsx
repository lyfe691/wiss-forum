import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

export function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, password } = formData;
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(username, password);
      // Redirect to the page they were trying to access, or home
      navigate(from, { replace: true });
    } catch (err: any) {
      // Extract error message from the API response
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-border">
        <Link to="/">
          <img src="/logo.png" alt="Wiss Forum Logo" className="h-8 w-auto" /> {/* Adjusted size */}
        </Link>
        <nav className="space-x-4 flex items-center"> {/* Added flex items-center */} 
        <Button 
            variant="link"
            onClick={() => navigate('/help')}
          > 
            Help
          </Button>
          <Button 
          variant="outline"
          onClick={() => navigate('/register')}
          > 
            Sign Up
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6"> {/* Container for form elements */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-muted-foreground">
              Enter your credentials to sign in to your account
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
             {error && (
              <div className="p-3 rounded-md bg-destructive/15 text-destructive flex items-center gap-2 text-sm mb-4">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label>
              <Input
                id="username"
                name="username"
                placeholder="Enter your username or email"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground border-t border-border">
      <Button variant="link" className="font-semibold" onClick={() => navigate('/register')}> 
        Don't have an account? Sign up
        </Button>
      </footer>
    </div>
  );
} 