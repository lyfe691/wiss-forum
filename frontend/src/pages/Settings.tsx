import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  AlertCircle, 
  Check, 
  Lock, 
  Moon, 
  Bell, 
  User,
  Brush
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function Settings() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('account');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    username: user?.username || '',
    email: user?.email || '',
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    darkMode: localStorage.getItem('theme') === 'dark',
    emailNotifications: true,
    siteNotifications: true
  });

  // Form state handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormState(prev => ({ ...prev, [name]: checked }));
    
    // Handle theme switching
    if (name === 'darkMode') {
      if (checked) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  };

  // Update profile info
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Prepare update data
      const updateData = {
        username: formState.username !== user.username ? formState.username : undefined,
        email: formState.email !== user.email ? formState.email : undefined,
        displayName: formState.displayName !== user.displayName ? formState.displayName : undefined,
        bio: formState.bio !== user.bio ? formState.bio : undefined,
      };
      
      // Check if any field was actually changed
      if (Object.values(updateData).every(val => val === undefined)) {
        toast({
          title: "No changes detected",
          description: "Make some changes before updating your profile.",
          variant: "default"
        });
        setIsSubmitting(false);
        return;
      }
      
      const response = await userAPI.updateUserProfile(updateData);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
        variant: "default"
      });
      
      // Refresh user data
      await refreshUser();
      
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!user) return;
    
    setError(null);
    
    // Validate passwords
    if (!formState.currentPassword) {
      setError('Current password is required');
      return;
    }
    
    if (!formState.newPassword) {
      setError('New password is required');
      return;
    }
    
    if (formState.newPassword !== formState.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (formState.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await userAPI.changePassword({
        currentPassword: formState.currentPassword,
        newPassword: formState.newPassword
      });
      
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully. Please log in again.",
        variant: "default"
      });
      
      // Clear password fields
      setFormState(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Log out after password change
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
      
    } catch (error: any) {
      console.error('Failed to change password:', error);
      setError(error.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle notification settings
  const handleSaveNotifications = () => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated.",
      variant: "default"
    });
  };

  // Handle appearance settings
  const handleSaveAppearance = () => {
    toast({
      title: "Appearance settings saved",
      description: "Your appearance preferences have been updated.",
      variant: "default"
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
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
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
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
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formState.username}
                    onChange={handleInputChange}
                    placeholder="Username"
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
                    placeholder="Email address"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={formState.displayName}
                  onChange={handleInputChange}
                  placeholder="Display name (optional)"
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
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                  {!isSubmitting && <Check className="h-4 w-4" />}
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
                  placeholder="Enter your new password"
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
                  {!isSubmitting && <Check className="h-4 w-4" />}
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
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for a more comfortable viewing experience at night.
                  </p>
                </div>
                <Switch
                  checked={formState.darkMode}
                  onCheckedChange={(checked) => handleSwitchChange('darkMode', checked)}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveAppearance}
                  className="flex items-center gap-2"
                >
                  Save Preferences
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about replies and mentions via email.
                  </p>
                </div>
                <Switch
                  checked={formState.emailNotifications}
                  onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Site Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive in-app notifications for activities.
                  </p>
                </div>
                <Switch
                  checked={formState.siteNotifications}
                  onCheckedChange={(checked) => handleSwitchChange('siteNotifications', checked)}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveNotifications}
                  className="flex items-center gap-2"
                >
                  Save Preferences
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 