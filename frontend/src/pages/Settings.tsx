import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/lib/api';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  AlertCircle, 
  Lock, 
  User,
  Brush,
  Github,
  Globe,
  Linkedin,
  Twitter,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Theme } from '@/lib/theme';

export function Settings() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [selectedTab, setSelectedTab] = useState('account');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    username: '',
    email: '',
    displayName: '',
    bio: '',
    githubUrl: '',
    websiteUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch profile data like Profile page does
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const profileData = await userAPI.getUserProfile();
        
        if (profileData) {
          const normalizedProfile = {
            ...profileData,
            _id: profileData._id || profileData.id
          };
          
          // Initialize form with profile data
          setFormState(prev => ({
            ...prev,
            username: normalizedProfile.username || '',
            email: normalizedProfile.email || '',
            displayName: normalizedProfile.displayName || '',
            bio: normalizedProfile.bio || '',
            githubUrl: normalizedProfile.githubUrl || '',
            websiteUrl: normalizedProfile.websiteUrl || '',
            linkedinUrl: normalizedProfile.linkedinUrl || '',
            twitterUrl: normalizedProfile.twitterUrl || '',
          }));
        } else if (user) {
          // Fallback to user context
          setFormState(prev => ({
            ...prev,
            username: user.username || '',
            email: user.email || '',
            displayName: user.displayName || '',
            bio: user.bio || '',
            githubUrl: user.githubUrl || '',
            websiteUrl: user.websiteUrl || '',
            linkedinUrl: user.linkedinUrl || '',
            twitterUrl: user.twitterUrl || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        
        // Fallback to user context
        if (user) {
          setFormState(prev => ({
            ...prev,
            username: user.username || '',
            email: user.email || '',
            displayName: user.displayName || '',
            bio: user.bio || '',
            githubUrl: user.githubUrl || '',
            websiteUrl: user.websiteUrl || '',
            linkedinUrl: user.linkedinUrl || '',
            twitterUrl: user.twitterUrl || ''
          }));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  // Form state handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  // Handle theme change
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  // Update profile info
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setError(null);
    setIsSubmitting(true);
    
    // Validate fields
    if (!formState.username) {
      setError('Username is required');
      setIsSubmitting(false);
      return;
    }
    
    if (formState.username.includes(' ')) {
      setError('Username must not contain spaces');
      setIsSubmitting(false);
      return;
    }
    
    if (formState.username.length < 3 || formState.username.length > 20) {
      setError('Username must be between 3 and 20 characters');
      setIsSubmitting(false);
      return;
    }
    
    if (!formState.email.match(/^[\w.-]+@wiss-edu\.ch$/)) {
      setError('Email must end with @wiss-edu.ch');
      setIsSubmitting(false);
      return;
    }
    
    if (!formState.displayName) {
      setError('Display name is required');
      setIsSubmitting(false);
      return;
    }
    
    if (formState.displayName.length < 3 || formState.displayName.length > 50) {
      setError('Display name must be between 3 and 50 characters');
      setIsSubmitting(false);
      return;
    }
    
    if (formState.bio && formState.bio.length > 500) {
      setError('Bio must not exceed 500 characters');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Prepare update data
      const updateData = {
        username: formState.username !== user.username ? formState.username : undefined,
        email: formState.email !== user.email ? formState.email : undefined,
        displayName: formState.displayName !== user.displayName ? formState.displayName : undefined,
        bio: formState.bio !== user.bio ? formState.bio : undefined,
        githubUrl: formState.githubUrl !== user.githubUrl ? formState.githubUrl || undefined : undefined,
        websiteUrl: formState.websiteUrl !== user.websiteUrl ? formState.websiteUrl || undefined : undefined,
        linkedinUrl: formState.linkedinUrl !== user.linkedinUrl ? formState.linkedinUrl || undefined : undefined,
        twitterUrl: formState.twitterUrl !== user.twitterUrl ? formState.twitterUrl || undefined : undefined,
      };
      
      // Check if any field was actually changed
      if (Object.values(updateData).every(val => val === undefined)) {
        toast.error("No changes detected");
        setIsSubmitting(false);
        return;
      }

      const response = await userAPI.updateUserProfile(updateData);
      
      // Update form state with saved data to maintain persistence
      if (response) {
        setFormState(prev => ({
          ...prev,
          username: response.username || prev.username,
          email: response.email || prev.email,
          displayName: response.displayName || prev.displayName,
          bio: response.bio || prev.bio,
          githubUrl: response.githubUrl || prev.githubUrl,
          websiteUrl: response.websiteUrl || prev.websiteUrl,
          linkedinUrl: response.linkedinUrl || prev.linkedinUrl,
          twitterUrl: response.twitterUrl || prev.twitterUrl
        }));
      }
      
      toast.success("Profile updated");
      
      // Update user state in auth context
      await refreshUser();
      
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password change
  const handleChangePassword = async () => {
    if (!user) return;
    
    setError(null);
    setIsSubmitting(true);
    
    // Validate passwords
    if (!formState.currentPassword) {
      setError('Current password is required');
      setIsSubmitting(false);
      return;
    }
    
    if (!formState.newPassword) {
      setError('New password is required');
      setIsSubmitting(false);
      return;
    }
    
    if (formState.newPassword !== formState.confirmPassword) {
      setError('New passwords do not match');
      setIsSubmitting(false);
      return;
    }
    
    if (formState.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }
    
    if (formState.newPassword.includes(' ')) {
      setError('New password must not contain spaces');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const data = {
        currentPassword: formState.currentPassword,
        newPassword: formState.newPassword
      };
      
      await userAPI.changePassword(data);
      
      toast.success("Password changed", {
        description: "Your password has been changed successfully"
      });
      
      // Clear password fields
      setFormState(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (error: any) {
      console.error('Failed to change password:', error);
      setError(error.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle appearance settings
  const handleSaveAppearance = () => {
    toast.success("Appearance settings saved");
  };

  // Loading state like Profile page
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Password</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Brush className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details. This information will be displayed publicly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username (3-20 characters)</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formState.username}
                    onChange={handleInputChange}
                    placeholder="Username (no spaces)"
                    maxLength={20}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleInputChange}
                    placeholder="@wiss-edu.ch email address"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name (3-50 characters)</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={formState.displayName}
                  onChange={handleInputChange}
                  placeholder="Your display name"
                  maxLength={50}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formState.bio}
                  onChange={handleInputChange}
                  placeholder="Tell others about yourself..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-sm text-muted-foreground">
                  {formState.bio?.length || 0}/500 characters
                </p>
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
                         value={formState.githubUrl}
                         onChange={handleInputChange}
                         placeholder="github.com/username"
                         className="pl-8 h-9 text-sm"
                       />
                     </div>
                   </div>
                   
                   <div className="space-y-1.5">
                     <Label htmlFor="websiteUrl" className="text-sm">Website</Label>
                     <div className="relative">
                       <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                       <Input
                         id="websiteUrl"
                         name="websiteUrl"
                         value={formState.websiteUrl}
                         onChange={handleInputChange}
                         placeholder="yourwebsite.com"
                         className="pl-8 h-9 text-sm"
                       />
                     </div>
                   </div>
                   
                   <div className="space-y-1.5">
                     <Label htmlFor="linkedinUrl" className="text-sm">LinkedIn</Label>
                     <div className="relative">
                       <Linkedin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                       <Input
                         id="linkedinUrl"
                         name="linkedinUrl"
                         value={formState.linkedinUrl}
                         onChange={handleInputChange}
                         placeholder="linkedin.com/in/username"
                         className="pl-8 h-9 text-sm"
                       />
                     </div>
                   </div>
                   
                   <div className="space-y-1.5">
                     <Label htmlFor="twitterUrl" className="text-sm">Twitter/X</Label>
                     <div className="relative">
                       <Twitter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                       <Input
                         id="twitterUrl"
                         name="twitterUrl"
                         value={formState.twitterUrl}
                         onChange={handleInputChange}
                         placeholder="twitter.com/username"
                         className="pl-8 h-9 text-sm"
                       />
                     </div>
                   </div>
                 </div>
               </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                  {!isSubmitting}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to secure your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formState.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your current password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formState.newPassword}
                  onChange={handleInputChange}
                  placeholder="At least 6 characters, no spaces"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formState.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your new password"
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleChangePassword} 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? 'Changing...' : 'Change Password'}
                  {!isSubmitting}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the forum looks for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base">Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme for the forum.
                </p>
                <Select
                  value={theme}
                  onValueChange={(value: Theme) => {
                    handleThemeChange(value);
                    handleSaveAppearance();
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 