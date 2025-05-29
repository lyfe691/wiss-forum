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
import { PaginationControls } from '@/components/PaginationControls';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { getRoleBadgeColor, formatRoleName, getAvatarUrl, getInitials } from '@/lib/utils';
import { Role, roleUtils } from '@/lib/types';

interface User {
  _id: string;
  username: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  role: Role | string;
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
        const currentUserRole = roleUtils.normalizeRole(currentUser?.role);
        if (currentUserRole === Role.ADMIN) {
          // admin can see full user details
          data = await userAPI.getAllUsers();
        } else {
          // for regular users, ill use a public endpoint that returns limited user info
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

  return (
    <div className="container max-w-6xl mx-auto py-6 px-4">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link 
                to="/" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="font-medium text-foreground">
              Users
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="overflow-hidden h-full border border-border/60">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <div className="flex justify-between items-center mt-4 pt-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="p-8 text-center bg-muted/30">
          <CardTitle className="mb-3">No users found</CardTitle>
          <p className="text-muted-foreground mb-4">No community members are available to display</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {getCurrentPageUsers().map((user) => (
              <Card 
                key={user._id || user.username} 
                className="overflow-hidden h-full border border-border/60 transition-all duration-200 hover:shadow-md hover:border-border group"
              >
                <Link to={`/users/${user.username}`} className="block h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14 border ring-2 ring-background group-hover:ring-primary/10 transition-all duration-200">
                        <AvatarImage 
                          src={getAvatarUrl(user.username, user.avatar)} 
                          alt={user.displayName || user.username} 
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {getInitials(user.displayName || user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base font-medium group-hover:text-primary transition-colors">
                          {user.displayName || user.username}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        <Badge className={`mt-2 font-normal px-2 py-0.5 text-xs ${getRoleBadgeColor(user.role)}`}>
                          {formatRoleName(user.role)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-3">
                    {user.bio ? (
                      <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No bio provided</p>
                    )}
                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-border/40">
                      <p className="text-xs text-muted-foreground">
                        Member since {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <PaginationControls
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