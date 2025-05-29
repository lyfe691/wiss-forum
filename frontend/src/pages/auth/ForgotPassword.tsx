import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authAPI } from '@/lib/api';

// define schema with zod
const forgotPasswordSchema = z.object({
  email: z.string()
    .email("Invalid email address")
    .regex(/^[\w.-]+@wiss-edu\.ch$/, "Email must end with @wiss-edu.ch")
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // initialize form with react-hook-form and zod validation
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setError('');
    setSuccess(false);
    setIsSubmitting(true);
    
    try {
      await authAPI.forgotPassword(values.email);
      setSuccess(true);
      form.reset();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to process request. Please try again.';
      
      // check if its a 404 (email not found) or other error
      if (err.response?.status === 404) {
        setError('No account is associated with this email address.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and receive a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 border-green-200 text-green-800" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-800">
              Password reset link has been sent to your email.
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Enter your @wiss-edu.ch email address" 
                      disabled={isSubmitting || success}
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
              disabled={isSubmitting || success}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          variant="link" 
          className="font-normal"
          onClick={() => navigate('/login')}
        >
          Remember your password? Sign in
        </Button>
      </CardFooter>
    </Card>
  );
} 