import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// define schema with zod
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // get the redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  // initialize form with react-hook-form and zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError('');
    setIsSubmitting(true);
    
    try {
      await login(values.username, values.password);
      // redirect to the page they were trying to access, or home
      navigate(from, { replace: true });
    } catch (err: any) {
      // use a generic error message for all authentication failures
      // this avoids revealing whether a username exists or not (security best practice)
      let errorMessage = 'Invalid username or password';
      
      // Only show specific errors for non-authentication issues
      if (err.response?.data?.message) {
        const apiError = err.response.data.message.toLowerCase();
        
        if (apiError.includes('session expired') || apiError.includes('token')) {
          errorMessage = 'Your session has expired. Please try again.';
        } else if (apiError.includes('server') || apiError.includes('unavailable')) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username or Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your username or email" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Button 
                      variant="link" 
                      className="text-sm p-0 h-auto font-normal"
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter your password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          variant="link" 
          className="font-normal"
          onClick={() => navigate('/register')}
        >
          Don't have an account? Sign up
        </Button>
      </CardFooter>
    </Card>
  );
} 