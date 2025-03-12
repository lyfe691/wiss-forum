import { useState, useEffect } from 'react';
import { userAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '../../components/ui/pagination';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface User {
  _id: string;
  username: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin';
  bio?: string;
  createdAt: string;
}

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  const usersPerPage = 12;

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let data: User[];
        if (currentUser?.role === 'admin') {
          // Admin can see full user details
          data = await userAPI.getAllUsers();
        } else {
          // For regular users, we'll use a public endpoint that returns limited user info
          data = await userAPI.getPublicUsersList();
        }
        setUsers(data);
        setTotalPages(Math.ceil(data.length / usersPerPage));
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setError('Unable to load users. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser?.role]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getCurrentPageUsers = () => {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return users.slice(startIndex, endIndex);
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  return (
    <div className="container max-w-6xl mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Community Members</h1>
        <p className="text-muted-foreground">Browse all registered users and members of our community</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="p-6 text-center">
          <CardTitle className="mb-2">No users found</CardTitle>
          <p className="text-muted-foreground">No community members are available to display</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {getCurrentPageUsers().map((user) => (
              <Card key={user._id} className="overflow-hidden hover:shadow-md transition-shadow">
                <Link to={`/users/${user.username}`} className="block h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 border">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} alt={user.displayName || user.username} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(user.displayName || user.username)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <CardTitle className="text-base font-medium hover:text-primary transition-colors">{user.displayName || user.username}</CardTitle>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        <Badge className={`mt-1.5 font-normal px-1.5 py-0.5 text-xs ${getRoleBadgeColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {user.bio ? (
                      <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No bio provided</p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-muted-foreground">
                        Member since {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </p>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-primary/5 hover:text-primary">
                        View Profile
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
} 