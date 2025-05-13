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
  AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { getAvatarUrl, getRoleBadgeColor, formatRoleName, getInitials } from '@/lib/utils';

interface UserProfile {
  _id: string;
  id?: string;
  username: string;
  email: string;
  displayName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'student' | 'teacher' | 'admin';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt?: string;
  lastActive?: string;
}

interface ProfileFormData {
  username: string;
  email: string;
  displayName: string;
  bio: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function Profile() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    username: '',
    email: '',
    displayName: '',
    bio: ''
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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
            bio: normalizedProfile.bio || ''
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
              bio: user.bio || ''
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
            bio: user.bio || ''
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
    } else if (!profileForm.email.match(/^[\w.-]+@wiss-edu\.ch$/)) {
      newErrors.email = 'Email must end with @wiss-edu.ch';
    }
    
    if (!profileForm.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (profileForm.displayName.length < 3 || profileForm.displayName.length > 50) {
      newErrors.displayName = 'Display name must be between 3 and 50 characters';
    }
    
    if (profileForm.bio && profileForm.bio.length > 500) {
      newErrors.bio = 'Bio must not exceed 500 characters';
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
        bio: profileForm.bio
      });
      
      const updatedUser = response.user || {};
      
      // Ensure consistent ID field
      const normalizedUser = {
        ...updatedUser,
        _id: updatedUser._id || updatedUser.id
      };
      
      setProfile(normalizedUser);
      
      // Update auth context
      await checkAuth();
      
      toast.success(response.message || "Profile updated successfully");
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate password form
  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    } else if (passwordForm.newPassword.includes(' ')) {
      newErrors.newPassword = 'New password must not contain spaces';
    }
    
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle password change
  const handlePasswordSave = async () => {
    if (!validatePasswordForm()) {
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const { message } = await userAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      toast.success(message || "Password changed successfully");
      
      // Reset form and close dialog
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordDialogOpen(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
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
                <Avatar className="h-24 w-24 mb-4 border-2 border-primary/20">
                  <AvatarImage src={getAvatarUrl(profile.username, profile.avatar)} alt={profile.displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                    {getInitials(profile.displayName || profile.username)}
                  </AvatarFallback>
                </Avatar>
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
                <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Your Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and a new password below.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                        />
                        {errors.currentPassword && (
                          <p className="text-sm font-medium text-destructive">{errors.currentPassword}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                        />
                        {errors.newPassword && (
                          <p className="text-sm font-medium text-destructive">{errors.newPassword}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                        />
                        {errors.confirmPassword && (
                          <p className="text-sm font-medium text-destructive">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handlePasswordSave} 
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                      <Label htmlFor="email">Email (@wiss-edu.ch)</Label>
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
    </div>
  );
} 