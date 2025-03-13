import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
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
  Edit2, 
  Clock, 
  Calendar, 
  Shield, 
  Lock, 
  Save, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
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
  const { toast } = useToast();
  
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
        const profileData = await userAPI.getUserProfile();
        setProfile(profileData);
        
        // Initialize form with profile data
        setProfileForm({
          username: profileData.username || '',
          email: profileData.email || '',
          displayName: profileData.displayName || '',
          bio: profileData.bio || ''
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your profile. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, navigate, toast]);

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
    } else if (profileForm.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!profileForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!profileForm.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
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
      const { message, user: updatedUser } = await userAPI.updateUserProfile({
        username: profileForm.username,
        email: profileForm.email,
        displayName: profileForm.displayName,
        bio: profileForm.bio
      });
      
      setProfile(updatedUser);
      
      // Update auth context
      await checkAuth();
      
      toast({
        title: "Success",
        description: message || "Profile updated successfully",
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
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
      
      toast({
        title: "Success",
        description: message || "Password changed successfully",
      });
      
      // Reset form and close dialog
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordDialogOpen(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
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
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Profile Header */}
          <div className="w-full md:w-1/3">
            <Card className="mb-6">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4 border-2 border-primary/20">
                  <AvatarImage src={profile.avatar || `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.username}`} alt={profile.displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                    {getInitials(profile.displayName)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{profile.displayName}</h2>
                <p className="text-muted-foreground mb-3">@{profile.username}</p>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
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
                      <Label htmlFor="username">Username</Label>
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
                        />
                      </div>
                      {errors.username && (
                        <p className="text-sm font-medium text-destructive">{errors.username}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
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
                      <Label htmlFor="displayName">Display Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="displayName"
                          name="displayName"
                          value={profileForm.displayName}
                          onChange={handleProfileChange}
                          className="pl-10"
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
                      />
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
      </motion.div>
    </div>
  );
} 