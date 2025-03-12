import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, ChevronLeft, Calendar, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';

interface UserProfile {
  _id: string;
  username: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin';
  bio?: string;
  createdAt: string;
}

export function UserProfile() {
  const { idOrUsername } = useParams<{ idOrUsername: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  
  // Check if viewing own profile
  const isOwnProfile = currentUser && profile && 
    (currentUser._id === profile._id || currentUser.username === profile.username);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!idOrUsername) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await userAPI.getPublicUserProfile(idOrUsername);
        setProfile(data);
      } catch (error: any) {
        console.error('Failed to fetch user profile:', error);
        setError(error.response?.data?.message || 'Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [idOrUsername]);

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
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/users" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Users
        </Link>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mt-4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ) : profile ? (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-24 w-24 border">
                {profile.avatar ? (
                  <AvatarImage src={profile.avatar} alt={profile.displayName || profile.username} />
                ) : (
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {getInitials(profile.displayName || profile.username)}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="text-center sm:text-left">
                <CardTitle className="text-2xl">
                  {profile.displayName || profile.username}
                </CardTitle>
                <CardDescription className="text-base">@{profile.username}</CardDescription>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  <Badge className={`${getRoleBadgeColor(profile.role)}`}>
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </Badge>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    Member since {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                  </div>
                </div>
                
                {isOwnProfile && currentUser?.email && (
                  <div className="flex items-center mt-3 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    {currentUser.email}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="mb-6">
              <h3 className="font-medium mb-2">Bio</h3>
              <p className="text-muted-foreground">
                {profile.bio || 'No bio provided.'}
              </p>
            </div>
            
            {isOwnProfile && (
              <div className="mt-6 flex justify-end">
                <Link to="/profile">
                  <Button variant="outline">Edit Profile</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <CardTitle className="mb-2">User Not Found</CardTitle>
          <p className="text-muted-foreground">The user profile you're looking for doesn't exist.</p>
          <Link to="/users" className="mt-4 inline-block">
            <Button variant="secondary">Back to Users</Button>
          </Link>
        </Card>
      )}
    </div>
  );
} 