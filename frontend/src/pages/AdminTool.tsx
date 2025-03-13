import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Key } from 'lucide-react';
import { userAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

export function AdminTool() {
  const [userId, setUserId] = useState('');
  const [secretKey, setSecretKey] = useState('WISS_ADMIN_SETUP_2024');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await userAPI.getUserProfile();
        setCurrentUser(userData);
        setUserId(userData._id);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    fetchCurrentUser();
  }, []);

  const makeAdmin = async () => {
    if (!userId) {
      setError('Please enter a user ID');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // Try using the bootstrap endpoint first
      try {
        const response = await axios.post('http://localhost:3000/api/users/bootstrap-admin', {
          userId,
          secretKey
        });
        
        if (response.data.success) {
          setSuccess('User has been made an admin successfully! Please refresh the page or log out and back in to see changes.');
          
          // If the user updated their own role, refresh their auth context
          if (userId === user?._id) {
            await refreshUser();
          }
          
          return;
        }
      } catch (bootstrapError: any) {
        console.error('Bootstrap method failed:', bootstrapError);
        // If bootstrap method failed, try the normal method
      }
      
      // Fall back to the standard method
      await userAPI.updateUserRole(userId, 'admin');
      setSuccess('User has been made an admin successfully!');
      
      // If the user updated their own role, refresh their auth context
      if (userId === user?._id) {
        await refreshUser();
      }
    } catch (err: any) {
      console.error('Failed to update role:', err);
      setError(err?.response?.data?.message || 'Failed to update user role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Admin Role Manager</CardTitle>
          <CardDescription>Update user roles to admin</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert variant="default" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800/30">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          {currentUser && (
            <div className="text-sm space-y-1 mb-4">
              <p><strong>Your user ID:</strong> {currentUser._id}</p>
              <p><strong>Username:</strong> {currentUser.username}</p>
              <p><strong>Current role:</strong> {currentUser.role}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="user-id">User ID to make admin</Label>
            <Input 
              id="user-id" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
            />
            <p className="text-xs text-muted-foreground">
              This is typically your own user ID to make yourself an admin
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secret-key" className="flex items-center gap-1">
              <Key className="h-3.5 w-3.5" />
              Secret Key
            </Label>
            <Input 
              id="secret-key" 
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              type="password"
            />
            <p className="text-xs text-muted-foreground">
              Special key needed for the bootstrap process
            </p>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={makeAdmin} 
            disabled={isLoading || !userId || !secretKey}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Make Admin'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 