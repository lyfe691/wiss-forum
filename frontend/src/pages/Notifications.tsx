import { useEffect, useState } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function Notifications() {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    totalNotifications,
    currentPage,
    totalPages,
    loading,
    fetchNotifications,
    markAsRead,
    deleteAllNotifications,
    notificationSettings,
    updateNotificationSettings
  } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Fetch first page of notifications when component mounts
    fetchNotifications(1);
  }, []);

  const handlePageChange = (page: number) => {
    fetchNotifications(page);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    fetchNotifications(1);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      deleteAllNotifications();
    }
  };

  const handleToggleSetting = (setting: string, value: boolean) => {
    updateNotificationSettings({ [setting]: value });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => markAsRead()}
              >
                Mark all as read
              </Button>
            )}
            {totalNotifications > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearAll}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={handleTabChange}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">
                All
                {totalNotifications > 0 && (
                  <span className="ml-2 text-xs bg-muted rounded-full px-2 py-0.5">
                    {totalNotifications}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <NotificationItem 
                        key={notification._id} 
                        notification={notification} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
                    <h3 className="text-lg font-medium mb-1">No notifications</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      When you receive notifications, they will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : notifications.filter(n => !n.read).length > 0 ? (
                  <div className="divide-y">
                    {notifications
                      .filter(notification => !notification.read)
                      .map((notification) => (
                        <NotificationItem 
                          key={notification._id} 
                          notification={notification} 
                        />
                      ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
                    <h3 className="text-lg font-medium mb-1">No unread notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      You're all caught up!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Email Notifications</h4>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => handleToggleSetting('emailNotifications', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Site Notifications</h4>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications on the site
                  </p>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notificationSettings.siteNotifications}
                      onChange={(e) => handleToggleSetting('siteNotifications', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Replies to Your Posts</h4>
                  <p className="text-xs text-muted-foreground">
                    When someone replies to your post
                  </p>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notificationSettings.notifyOnReplies}
                      onChange={(e) => handleToggleSetting('notifyOnReplies', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Mentions</h4>
                  <p className="text-xs text-muted-foreground">
                    When someone mentions you in a post
                  </p>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notificationSettings.notifyOnMentions}
                      onChange={(e) => handleToggleSetting('notifyOnMentions', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Likes</h4>
                  <p className="text-xs text-muted-foreground">
                    When someone likes your post
                  </p>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notificationSettings.notifyOnLikes}
                      onChange={(e) => handleToggleSetting('notifyOnLikes', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Topic Replies</h4>
                  <p className="text-xs text-muted-foreground">
                    When someone replies to a topic you created
                  </p>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notificationSettings.notifyOnTopicReplies}
                      onChange={(e) => handleToggleSetting('notifyOnTopicReplies', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Role Changes</h4>
                  <p className="text-xs text-muted-foreground">
                    When your role is changed
                  </p>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notificationSettings.notifyOnRoleChanges}
                      onChange={(e) => handleToggleSetting('notifyOnRoleChanges', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 