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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function AdminTool() {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'TEACHER'>('ADMIN');
  const [secretKey, setSecretKey] = useState('key');
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

  const updateRole = async () => {
    if (!userId) {
      setError('Please enter a user ID');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // Use the bootstrap endpoint for Spring
      const endpoint = role === 'ADMIN' ? 'bootstrap-admin' : 'bootstrap-teacher';
      
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/users/${endpoint}`, {
          userId,
          key: secretKey
        });
        
        if (response.data.success) {
          setSuccess(`User has been made a ${role.toLowerCase()} successfully! Please refresh the page or log out and back in to see changes.`);
          
          // If the user updated their own role, refresh their auth context
          if (userId === user?._id) {
            await refreshUser();
          }
          
          return;
        }
      } catch (bootstrapError: any) {
        console.error(`Bootstrap ${role.toLowerCase()} method failed:`, bootstrapError);
        const errorMessage = bootstrapError.response?.data?.message || `Failed to update user to ${role.toLowerCase()} role`;
        setError(errorMessage);
        return;
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
          <CardDescription>Update user roles</CardDescription>
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
            <Label htmlFor="user-id">User ID</Label>
            <Input 
              id="user-id" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
            />
            <p className="text-xs text-muted-foreground">
              This is typically your own user ID to update your role
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Role</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as 'ADMIN' | 'TEACHER')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ADMIN" id="admin" />
                <Label htmlFor="admin">Admin</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="TEACHER" id="teacher" />
                <Label htmlFor="teacher">Teacher</Label>
              </div>
            </RadioGroup>
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
            onClick={updateRole} 
            disabled={isLoading || !userId || !secretKey}
            className="w-full"
          >
            {isLoading ? 'Processing...' : `Make ${role === 'ADMIN' ? 'Admin' : 'Teacher'}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 