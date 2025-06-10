import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, Calendar, Mail, ExternalLink, Github, Globe, Linkedin, Twitter} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { getAvatarUrl, getRoleBadgeColor, formatRoleName, getInitials } from '@/lib/utils';
import { UserGamificationWidget } from '@/components/UserGamificationWidget';

interface UserProfile {
  _id: string;
  username: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  role: string;
  bio?: string;
  githubUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  createdAt: string;
}

export function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  
  // Check if viewing own profile
  const isOwnProfile = currentUser && profile && 
    (currentUser._id === profile._id || currentUser.username === profile.username);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) {
        console.error('No username provided in URL parameters');
        setError('User not found');
        setIsLoading(false);
        return;
      }
      
      console.log(`Fetching profile for username: ${username}`);
      setIsLoading(true);
      setError(null);
      
      try {
        // Use getPublicUserProfile instead which has better error handling
        const data = await userAPI.getPublicUserProfile(username);
        console.log('Profile data received:', data);
        
        if (!data || !data.username) {
          console.error('Invalid user data received');
          setError('User profile not found');
          setIsLoading(false);
          return;
        }
        
        // Ensure we have normalized data
        const normalizedProfile = {
          ...data,
          _id: data._id || data.id || '',
          role: (data.role || 'student').toLowerCase()
        };
        
        setProfile(normalizedProfile);
      } catch (error: any) {
        console.error('Failed to fetch user profile:', error);
        const errorMessage = error.response?.data?.message || 
                             error.message || 
                             'Failed to load user profile';
        console.error('Error details:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
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
            <BreadcrumbLink asChild>
              <Link 
                to="/users" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Users
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="font-medium text-foreground">
              {profile?.displayName || profile?.username || 'User Profile'}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
                <AvatarImage src={getAvatarUrl(profile.username, profile.avatar)} alt={profile.displayName || profile.username} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {getInitials(profile.displayName || profile.username)}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center sm:text-left">
                <CardTitle className="text-2xl">
                  {profile.displayName || profile.username}
                </CardTitle>
                <CardDescription className="text-base">@{profile.username}</CardDescription>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  <Badge className={`${getRoleBadgeColor(profile.role)}`}>
                    {formatRoleName(profile.role)}
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
            
            {/* Social Links */}
            {(profile.githubUrl || profile.websiteUrl || profile.linkedinUrl || profile.twitterUrl) && (
              <div className="mb-6">
                <h3 className="font-medium mb-3">Links</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 hover:bg-muted text-sm transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {profile.websiteUrl && (
                    <a
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 hover:bg-muted text-sm transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 hover:bg-muted text-sm transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {profile.twitterUrl && (
                    <a
                      href={profile.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 hover:bg-muted text-sm transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter/X
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {/* Collapsible Community Stats */}
            <div className="mb-6">
              <UserGamificationWidget 
                showTitle={true}
                compact={false}
                collapsible={true}
                defaultCollapsed={true}
                username={profile.username}
              />
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