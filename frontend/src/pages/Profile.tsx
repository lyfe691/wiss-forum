import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Clock, 
  Calendar, 
  Shield, 
  Lock, 
  Save, 
  Loader2, 
  AlertCircle,
  Github,
  Globe,
  Linkedin,
  Twitter,
  Camera,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { getAvatarUrl, getRoleBadgeColor, formatRoleName, getInitials } from '@/lib/utils';
import { UserGamificationWidget } from '@/components/UserGamificationWidget';

interface UserProfile {
  _id: string;
  id?: string;
  username: string;
  email: string;
  displayName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'student' | 'teacher' | 'admin';
  avatar?: string;
  bio?: string;
  githubUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  createdAt: string;
  updatedAt?: string;
  lastActive?: string;
}

interface ProfileFormData {
  username: string;
  email: string;
  displayName: string;
  bio: string;
  githubUrl: string;
  websiteUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
}

export function Profile() {
  const { user, checkAuth, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUploadOpen, setAvatarUploadOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    username: '',
    email: '',
    displayName: '',
    bio: '',
    githubUrl: '',
    websiteUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Use updated getUserProfile method
        const profileData = await userAPI.getUserProfile();
        
        if (profileData) {
          // Ensure consistent ID field
          const normalizedProfile = {
            ...profileData,
            _id: profileData._id || profileData.id
          };
          
          setProfile(normalizedProfile);
          
          // Initialize form with profile data
          setProfileForm({
            username: normalizedProfile.username || '',
            email: normalizedProfile.email || '',
            displayName: normalizedProfile.displayName || '',
            bio: normalizedProfile.bio || '',
            githubUrl: normalizedProfile.githubUrl || '',
            websiteUrl: normalizedProfile.websiteUrl || '',
            linkedinUrl: normalizedProfile.linkedinUrl || '',
            twitterUrl: normalizedProfile.twitterUrl || '',
          });
        } else {
          // Fallback to user context if API returns no data
          if (user) {
            setProfile({
              _id: user._id,
              username: user.username,
              email: user.email,
              displayName: user.displayName,
              role: user.role,
              avatar: user.avatar,
              bio: user.bio || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            
            setProfileForm({
              username: user.username || '',
              email: user.email || '',
              displayName: user.displayName || '',
              bio: user.bio || '',
              githubUrl: '',
              websiteUrl: '',
              linkedinUrl: '',
              twitterUrl: '',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        
        // Fallback to user context
        if (user) {
          setProfile({
            _id: user._id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          
          setProfileForm({
            username: user.username || '',
            email: user.email || '',
            displayName: user.displayName || '',
            bio: user.bio || '',
            githubUrl: '',
            websiteUrl: '',
            linkedinUrl: '',
            twitterUrl: '',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, navigate]);

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate profile form
  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!profileForm.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (profileForm.username.includes(' ')) {
      newErrors.username = 'Username must not contain spaces';
    } else if (profileForm.username.length < 3 || profileForm.username.length > 20) {
      newErrors.username = 'Username must be between 3 and 20 characters';
    }
    
    if (!profileForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!profileForm.email.match(/^[\w.-]+@wiss-edu\.ch$/) && !profileForm.email.match(/^[\w.-]+@wiss\.ch$/)) {
      newErrors.email = 'Email must end with @wiss-edu.ch or @wiss.ch';
    }
    
    if (!profileForm.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (profileForm.displayName.length < 3 || profileForm.displayName.length > 50) {
      newErrors.displayName = 'Display name must be between 3 and 50 characters';
    }
    
    if (profileForm.bio && profileForm.bio.length > 500) {
      newErrors.bio = 'Bio must not exceed 500 characters';
    }
    
    // Validate social links - only if they're provided
    const validateUrl = (url: string, fieldName: string, platform?: string) => {
      if (url && url.trim()) {
        try {
          new URL(url);
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            newErrors[fieldName] = `${platform || 'URL'} must start with http:// or https://`;
          }
        } catch {
          newErrors[fieldName] = `Invalid ${platform || 'URL'} format`;
        }
      }
    };
    
    validateUrl(profileForm.githubUrl, 'githubUrl', 'GitHub URL');
    validateUrl(profileForm.websiteUrl, 'websiteUrl', 'Website URL');
    validateUrl(profileForm.linkedinUrl, 'linkedinUrl', 'LinkedIn URL');
    validateUrl(profileForm.twitterUrl, 'twitterUrl', 'Twitter/X URL');
    
    // Platform-specific validation
    if (profileForm.githubUrl && profileForm.githubUrl.trim() && !profileForm.githubUrl.includes('github.com')) {
      newErrors.githubUrl = 'GitHub URL must contain github.com';
    }
    if (profileForm.linkedinUrl && profileForm.linkedinUrl.trim() && !profileForm.linkedinUrl.includes('linkedin.com')) {
      newErrors.linkedinUrl = 'LinkedIn URL must contain linkedin.com';
    }
    if (profileForm.twitterUrl && profileForm.twitterUrl.trim() && 
        !profileForm.twitterUrl.includes('twitter.com') && !profileForm.twitterUrl.includes('x.com')) {
      newErrors.twitterUrl = 'Twitter/X URL must contain twitter.com or x.com';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile save
  const handleProfileSave = async () => {
    if (!validateProfileForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await userAPI.updateUserProfile({
        username: profileForm.username,
        email: profileForm.email,
        displayName: profileForm.displayName,
        bio: profileForm.bio,
        githubUrl: profileForm.githubUrl || undefined,
        websiteUrl: profileForm.websiteUrl || undefined,
        linkedinUrl: profileForm.linkedinUrl || undefined,
        twitterUrl: profileForm.twitterUrl || undefined,
      });
      
      const updatedUser = response.user || {};
      
      // Ensure consistent ID field
      const normalizedUser = {
        ...updatedUser,
        _id: updatedUser._id || updatedUser.id
      };
      
      setProfile(normalizedUser);
      
      // Update the form with the saved data
      setProfileForm({
        username: normalizedUser.username || '',
        email: normalizedUser.email || '',
        displayName: normalizedUser.displayName || '',
        bio: normalizedUser.bio || '',
        githubUrl: normalizedUser.githubUrl || '',
        websiteUrl: normalizedUser.websiteUrl || '',
        linkedinUrl: normalizedUser.linkedinUrl || '',
        twitterUrl: normalizedUser.twitterUrl || ''
      });
      
      // Update auth context
      await refreshUser();
      
      toast.success(response.message || "Profile updated successfully");
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Unknown';
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file size (250KB = 256000 bytes)
    if (file.size > 256000) {
      toast.error('File size must be less than 250KB');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    
    setIsUploadingAvatar(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await userAPI.uploadAvatar(formData);
      
      // Refresh profile data
      const updatedProfile = await userAPI.getUserProfile();
      if (updatedProfile) {
        setProfile(prev => prev ? { ...prev, avatar: updatedProfile.avatar } : null);
        
        // Update the user in AuthContext so navbar and other components see the change
        await refreshUser();
      }
      
      toast.success('Profile picture updated successfully!');
      setAvatarUploadOpen(false);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Profile Header Skeleton */}
          <div className="w-full md:w-1/3">
            <Card className="mb-6">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Skeleton className="h-24 w-24 rounded-full mb-4" />
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-6 w-24" />
                
                <Separator className="my-4" />
                
                <div className="w-full space-y-3 text-left">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
            
            {/* Security Section Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content Skeleton */}
          <div className="w-full md:w-2/3">
            <Skeleton className="h-10 w-48 mb-4" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Skeleton className="h-10 w-32" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground mb-6">
          We couldn't load your profile information.
        </p>
        <Button onClick={() => navigate('/')}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div>
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Profile Header */}
          <div className="w-full md:w-1/3">
            <Card className="mb-6">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="relative group cursor-pointer mb-4" onClick={() => setAvatarUploadOpen(true)}>
                  <Avatar className="h-24 w-24 border-2 border-primary/20 transition-all duration-200 group-hover:opacity-80">
                    <AvatarImage src={getAvatarUrl(profile._id, profile.avatar)} alt={profile.displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                      {getInitials(profile.displayName || profile.username || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Camera overlay indicator */}
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 border-2 border-background shadow-lg transition-all duration-200 group-hover:scale-110">
                    <Camera className="h-3 w-3" />
                  </div>
                  
                  {/* Hover overlay - now perfectly aligned with avatar */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                      Change Photo
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold">{profile.displayName}</h2>
                <p className="text-muted-foreground mb-3">@{profile.username}</p>
                <Badge className={getRoleBadgeColor(profile.role)}>
                  {formatRoleName(profile.role)}
                </Badge>
                
                <Separator className="my-4" />
                
                <div className="w-full space-y-2 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {formatDate(profile.createdAt)}</span>
                  </div>
                  {profile.lastActive && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Last active {formatDate(profile.lastActive)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Security Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/settings', { state: { tab: 'password' } })}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Stats</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Activity</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username (3-20 characters)</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          @
                        </span>
                        <Input
                          id="username"
                          name="username"
                          value={profileForm.username}
                          onChange={handleProfileChange}
                          className="pl-8"
                          maxLength={20}
                        />
                      </div>
                      {errors.username && (
                        <p className="text-sm font-medium text-destructive">{errors.username}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (@wiss-edu.ch or @wiss.ch)</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                          className="pl-10"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm font-medium text-destructive">{errors.email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name (3-50 characters)</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="displayName"
                          name="displayName"
                          value={profileForm.displayName}
                          onChange={handleProfileChange}
                          className="pl-10"
                          maxLength={50}
                        />
                      </div>
                      {errors.displayName && (
                        <p className="text-sm font-medium text-destructive">{errors.displayName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={profileForm.bio}
                        onChange={handleProfileChange}
                        placeholder="Tell us about yourself..."
                        className="min-h-32"
                        maxLength={500}
                      />
                      <p className="text-sm text-muted-foreground">
                        {profileForm.bio.length}/500 characters
                      </p>
                      {errors.bio && (
                        <p className="text-sm font-medium text-destructive">{errors.bio}</p>
                      )}
                    </div>
                    
                    {/* Social Links Section */}
                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium">Social Links</h3>
                        <span className="text-xs text-muted-foreground">(Optional)</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="githubUrl" className="text-sm">GitHub</Label>
                          <div className="relative">
                            <Github className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              id="githubUrl"
                              name="githubUrl"
                              value={profileForm.githubUrl}
                              onChange={handleProfileChange}
                              placeholder="github.com/username"
                              className="pl-8 h-9 text-sm"
                            />
                          </div>
                          {errors.githubUrl && (
                            <p className="text-xs font-medium text-destructive">{errors.githubUrl}</p>
                          )}
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="websiteUrl" className="text-sm">Website</Label>
                          <div className="relative">
                            <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              id="websiteUrl"
                              name="websiteUrl"
                              value={profileForm.websiteUrl}
                              onChange={handleProfileChange}
                              placeholder="yourwebsite.com"
                              className="pl-8 h-9 text-sm"
                            />
                          </div>
                          {errors.websiteUrl && (
                            <p className="text-xs font-medium text-destructive">{errors.websiteUrl}</p>
                          )}
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="linkedinUrl" className="text-sm">LinkedIn</Label>
                          <div className="relative">
                            <Linkedin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              id="linkedinUrl"
                              name="linkedinUrl"
                              value={profileForm.linkedinUrl}
                              onChange={handleProfileChange}
                              placeholder="linkedin.com/in/username"
                              className="pl-8 h-9 text-sm"
                            />
                          </div>
                          {errors.linkedinUrl && (
                            <p className="text-xs font-medium text-destructive">{errors.linkedinUrl}</p>
                          )}
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="twitterUrl" className="text-sm">Twitter/X</Label>
                          <div className="relative">
                            <Twitter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              id="twitterUrl"
                              name="twitterUrl"
                              value={profileForm.twitterUrl}
                              onChange={handleProfileChange}
                              placeholder="twitter.com/username"
                              className="pl-8 h-9 text-sm"
                            />
                          </div>
                          {errors.twitterUrl && (
                            <p className="text-xs font-medium text-destructive">{errors.twitterUrl}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      onClick={handleProfileSave} 
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Stats Tab */}
              <TabsContent value="stats">
                <UserGamificationWidget />
              </TabsContent>
              
              {/* Activity Tab */}
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your recent posts and topics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Activity Coming Soon</h3>
                      <p className="text-muted-foreground max-w-md">
                        We're working on tracking and displaying your forum activity here. Check back soon!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      <Dialog open={avatarUploadOpen} onOpenChange={setAvatarUploadOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-xl">Update Profile Picture</DialogTitle>
            <DialogDescription className="text-left">
              Upload a new profile picture to personalize your account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Current Avatar Preview */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-lg">
                  <AvatarImage src={getAvatarUrl(profile._id, profile.avatar)} alt={profile.displayName} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {getInitials(profile.displayName || profile.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 border-2 border-background">
                  <Camera className="h-3 w-3" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Current profile picture</p>
            </div>
            
            {/* Upload Section */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleAvatarUpload(file);
                  }
                }}
                className="cursor-pointer"
                disabled={isUploadingAvatar}
              />
              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">
                  Supported: JPG, PNG, GIF • Maximum size: 250KB
                </p>
              </div>
            </div>
            
            {/* Rules Warning */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Community Guidelines
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    Ensure your profile picture follows community guidelines. Inappropriate content may even result in a school suspension. Don't risk it -- it's not worth it.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setAvatarUploadOpen(false)} 
              disabled={isUploadingAvatar}
              className="flex-1"
            >
              Cancel
            </Button>
            {isUploadingAvatar && (
              <Button disabled className="flex-1">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 