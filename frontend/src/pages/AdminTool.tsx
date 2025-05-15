import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Key, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { userAPI } from '@/lib/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Role, roleUtils } from '@/lib/types';
import { toast } from 'sonner';

export function AdminTool() {
  const [userId, setUserId] = useState('');
  const [secretKey, setSecretKey] = useState('WISS_ADMIN_SETUP_2024');
  const [role, setRole] = useState(Role.ADMIN.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await userAPI.getUserProfile();
        // Ensure consistent ID field
        const normalizedUser = {
          ...userData,
          _id: userData._id || userData.id
        };
        setCurrentUser(normalizedUser);
        setUserId(normalizedUser._id);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        // Fallback to user from context
        if (user) {
          setCurrentUser(user);
          setUserId(user._id);
        }
      }
    };

    fetchCurrentUser();
  }, [user]);

  // No role-based access blocking - intentionally accessible to all authenticated users during development

  const updateRole = async () => {
    if (!userId) {
      setError('Please enter a user ID');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // Determine which endpoint to use based on the selected role
      const endpoint = 
        role === Role.ADMIN.toString() ? 'bootstrap-admin' : 
        role === Role.TEACHER.toString() ? 'bootstrap-teacher' : 
        'bootstrap-student';
      
      // Format the request data to match the backend's expected format
      const requestData = {
        userId: userId,
        key: secretKey
      };
      
      console.log('Sending bootstrap request:', endpoint, requestData);
      
      // Use direct API connection without auth headers 
      // since bootstrap endpoints should be publicly accessible
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      try {
        const response = await axios.post(
          `${apiBaseUrl}/users/${endpoint}`, 
          requestData,
          { 
            headers: { 'Content-Type': 'application/json' },
            // Don't send credentials/auth token for bootstrap
            withCredentials: false
          }
        );
        
        console.log('Bootstrap response:', response.data);
        
        if (response.data && (response.data.success || response.status === 200)) {
          setSuccess(`User has been made a ${role.toLowerCase()} successfully! Please log back in for the changes to apply.`);
          
          // If the user updated their own role, refresh their auth context
          if (userId === user?._id) {
            await refreshUser();
            
            // Log out after a brief delay to show the success message
            setTimeout(() => {
              logout();
              navigate('/login');
            }, 2000);
            toast.success("Logged out", {
              description: "Please log back in for the changes to apply.",
            });
          }
          
        }
      } catch (err: any) {
        setError(`Bootstrap failed: ${err.response?.data?.message || err.message}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-xl mx-auto py-10">
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
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
            <label htmlFor="userId" className="text-sm font-medium">
              User ID
            </label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
            />
            <p className="text-xs text-muted-foreground">
              This is typically your own user ID to update your role
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <Select 
              value={role} 
              onValueChange={(value) => setRole(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.ADMIN.toString()}>Admin</SelectItem>
                <SelectItem value={Role.TEACHER.toString()}>Teacher</SelectItem>
                <SelectItem value={Role.STUDENT.toString()}>Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="secretKey" className="flex items-center gap-1 text-sm font-medium">
              <Key className="h-3.5 w-3.5" />
              Secret Key
            </label>
            <Input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
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
            {isLoading ? 'Processing...' : `Make ${role.toLowerCase()}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 