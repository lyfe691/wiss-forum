import { useState, useEffect } from 'react';
import { userAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Users, 
  MoreHorizontal, 
  UserCog, 
  Shield, 
  User, 
  SearchIcon,
  ArrowLeft,
  ShieldCheck,
  Trash
} from 'lucide-react';
import axios from 'axios';
import { getRoleBadgeColor, formatRoleName, getAvatarUrl, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import { Role } from '@/lib/types';

interface UserData {
  _id: string;
  id?: string;
  username: string;
  displayName?: string;
  email: string;
  role: Role | string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Users are now automatically normalized by the API layer

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
  
      if (user?.role === 'admin') {
        try {
          const adminUsers = await userAPI.getAllUsers();
          setUsers(adminUsers);
        } catch (err) {
          console.error('Failed to get extended user data:', err);
          // Fallback to public user list
          const publicUsers = await userAPI.getPublicUsersList();
          setUsers(publicUsers);
        }
      } else {
        // For non-admins, use the public endpoint
        const publicUsers = await userAPI.getPublicUsersList();
        setUsers(publicUsers);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Unable to load user data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: Role) => {
    try {
      setError(null);
      
      // Make sure we have a valid userId
      if (!userId || userId === 'undefined' || userId === '') {
        console.error('Invalid user ID provided:', userId);
        toast.error("Invalid user ID - unable to update role");
        return;
      }
      
      console.log(`Updating role for user ID: ${userId} to ${newRole}`);
      console.log('Full userId received:', { userId, type: typeof userId, length: userId.length });
      
      // Try using the bootstrap endpoint first based on the role
      if (newRole === Role.ADMIN || newRole === Role.TEACHER) {
        const endpoint = newRole === Role.ADMIN ? 'bootstrap-admin' : 'bootstrap-teacher';
        
        try {
          const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/users/${endpoint}`, {
            userId,
            key: 'WISS_ADMIN_SETUP_2024'  // Match the backend key exactly
          });
          
          if (response.data) {
            toast.success(`User role updated to ${formatRoleName(newRole)}`);
            await fetchUsers();
            
            // If the current user's role was changed, refresh the auth context
            if (user && user._id === userId) {
              await refreshUser();
            }
            
            return;
          }
        } catch (err) {
          console.error(`Bootstrap ${newRole} method failed:`, err);
        }
      }
      
      // Fallback to the standard method
      console.log(`Using standard method to update role for user ${userId} to ${newRole}`);
      try {
        // Convert role to uppercase to match Java enum format
        const roleForBackend = newRole.toUpperCase();
        console.log(`Sending role in format: ${roleForBackend}`);
        await userAPI.updateUserRole(userId, roleForBackend);
        toast.success(`User role updated to ${formatRoleName(newRole)}`);
        await fetchUsers();
        
        // If the current user's role was changed, refresh the auth context
        if (user && user._id === userId) {
          await refreshUser();
        }
      } catch (error: any) {
        if (error.response?.status === 403) {
          toast.error("You cannot change the role of another admin");
        } else {
          console.error('Standard role update failed:', error);
          toast.error("Failed to update user role");
        }
        throw error; // Re-throw to be caught by the outer catch
      }
    } catch (err) {
      console.error('Failed to update user role:', err);
      setError('Failed to update user role. Please try again.');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    // Ensure we have a valid ID for the user to delete
    const userId = userToDelete._id || userToDelete.id;
    
    if (!userId) {
      toast.error("Invalid user ID");
      setDeleteDialogOpen(false);
      return;
    }
    
    try {
      await userAPI.deleteUser(userId);
      toast.success(`User ${userToDelete.username} has been deleted`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      
      // Refresh the user list
      await fetchUsers();
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error("You cannot delete another admin account");
      } else {
        console.error('Failed to delete user:', error);
        toast.error("Failed to delete user");
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      (user.displayName || '').toLowerCase().includes(searchLower) ||
      (user.email || '').toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto py-10 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShieldCheck className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Search</CardTitle>
          <CardDescription>
            Find users by username, display name, email, or role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            {filteredUsers.length} users found
            {searchQuery && ` for "${searchQuery}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <p>No users found</p>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search query
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userData) => (
                    <TableRow key={userData._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={getAvatarUrl(userData._id, userData.avatar)} alt={userData.displayName || userData.username} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(userData.displayName || userData.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{userData.displayName || userData.username}</div>
                            <div className="text-sm text-muted-foreground">@{userData.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{userData.email}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeColor(userData.role)}`}>
                          {formatRoleName(userData.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>{userData.createdAt ? formatDate(userData.createdAt) : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <User className="mr-2 h-4 w-4" />
                              <Link to={`/users/${userData.username}`}>View Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => updateUserRole(userData._id || userData.id || '', Role.STUDENT)}
                              disabled={userData.role === Role.STUDENT || (userData.role === Role.ADMIN && user?._id !== userData._id)}
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              Set as Student
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateUserRole(userData._id || userData.id || '', Role.TEACHER)}
                              disabled={userData.role === Role.TEACHER || (userData.role === Role.ADMIN && user?._id !== userData._id)}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Set as Teacher
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateUserRole(userData._id || userData.id || '', Role.ADMIN)}
                              disabled={userData.role === Role.ADMIN}
                            >
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Set as Admin
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setUserToDelete(userData);
                                setDeleteDialogOpen(true);
                              }}
                              disabled={(userData._id || userData.id) === user?._id || (userData.role === Role.ADMIN && user?._id !== userData._id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
    </div>
  );
} 