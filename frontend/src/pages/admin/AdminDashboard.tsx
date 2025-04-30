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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Asterisk,
  Cog,
  Folder,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  ArrowLeft
} from 'lucide-react';

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

    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
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

      <Tabs defaultValue="users" className="mb-8">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="categories">Category Management</TabsTrigger>
          <TabsTrigger value="content">Content Moderation</TabsTrigger>
          <TabsTrigger value="settings">Site Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View, edit, and manage all user accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                As an administrator, you can manage all user accounts on the platform.
                This includes:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Viewing all registered users</li>
                <li>Editing user profile information</li>
                <li>Managing user roles and permissions</li>
                <li>Disabling or banning problematic accounts</li>
                <li>Resetting user passwords</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/admin/users">
                  <User className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>
                Organize and structure your forum with categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                Categories help organize discussions in your forum.
                From here you can:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create new top-level categories and subcategories</li>
                <li>Edit category names and descriptions</li>
                <li>Reorganize the category hierarchy</li>
                <li>Delete unused categories</li>
                <li>Set category permissions</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/admin/categories">
                  <Folder className="mr-2 h-4 w-4" />
                  Manage Categories
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>
                Review and moderate user-generated content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                Maintain a healthy community by moderating content.
                This section allows you to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Review reported posts and comments</li>
                <li>Edit or remove inappropriate content</li>
                <li>Lock or unlock topics</li>
                <li>Pin important announcements</li>
                <li>View content moderation logs</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                This feature is coming soon.
              </p>
            </CardContent>
            <CardFooter>
              <Button disabled>
                <MessageSquare className="mr-2 h-4 w-4" />
                Coming Soon
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>
                Configure global forum settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                Customize and configure your forum's global settings.
                Options include:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Forum name and branding</li>
                <li>Registration settings and requirements</li>
                <li>Default user permissions</li>
                <li>System maintenance options</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                This feature is coming soon.
              </p>
            </CardContent>
            <CardFooter>
              <Button disabled>
                <Cog className="mr-2 h-4 w-4" />
                Coming Soon
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 