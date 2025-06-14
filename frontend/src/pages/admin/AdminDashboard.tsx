import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, categoriesAPI } from '@/lib/api';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { 
  Asterisk,
  Folder,
  ShieldAlert,
  ShieldCheck,
  Users,
  ArrowLeft
} from 'lucide-react';
import { Role, roleUtils } from '@/lib/types';

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState<number>(0);
  const [categoryCount, setCategoryCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch user statistics
        const usersResponse = await userAPI.getAllUsers();
        if (Array.isArray(usersResponse)) {
          setUserCount(usersResponse.length);
        }

        // Fetch category statistics
        const categoriesResponse = await categoriesAPI.getAllCategories();
        if (Array.isArray(categoriesResponse)) {
          setCategoryCount(categoriesResponse.length);
        }
      } catch (error) {
        console.error('Error fetching admin statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const userRole = roleUtils.normalizeRole(user?.role);
    if (userRole === Role.ADMIN) {
      fetchStats();
    }
  }, [user]);

  const userRole = user ? roleUtils.normalizeRole(user.role) : null;
  const isAdmin = userRole === Role.ADMIN;

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto py-10 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShieldAlert className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
            <p>This area is restricted to administrators only.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your forum's users, content, and settings
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-8">
        {/* Total Users Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? '...' : userCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered accounts in the system
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/users">Manage Users</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Total Categories Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
              Total Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? '...' : categoryCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Discussion categories in the forum
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/categories">Manage Categories</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Admin Tools Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
              Admin Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <Asterisk className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Advanced admin functionality
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin-tool">Bootstrap Tool</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

    </div>
  );
} 