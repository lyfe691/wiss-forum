import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Trash2, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaginationControls } from '@/components/PaginationControls';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';


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
    deleteAllNotifications
  } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

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

  const handleClearAll = async () => {
    setIsDeleting(true);
    try {
      await deleteAllNotifications();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarking(true);
    try {
      await markAsRead();
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with your latest activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="default"
              onClick={handleMarkAllAsRead}
              disabled={isMarking}
              className="flex items-center gap-2"
            >
              {isMarking ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCheck className="h-5 w-5" />
              )}
              <span>Mark all as read</span>
            </Button>
          )}
          {totalNotifications > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="default"
                  className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Clear all</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete all your notifications and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearAll}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete All'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={handleTabChange} className="w-full">
        <div className="border-b">
          <TabsList className="bg-transparent h-12">
            <TabsTrigger 
              value="all"
              className={cn(
                "data-[state=active]:bg-transparent data-[state=active]:shadow-none relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground transition-none data-[state=active]:border-primary data-[state=active]:text-foreground",
                activeTab === "all" && "border-primary text-foreground"
              )}
            >
              All
              {totalNotifications > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {totalNotifications}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="unread"
              className={cn(
                "data-[state=active]:bg-transparent data-[state=active]:shadow-none relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground transition-none data-[state=active]:border-primary data-[state=active]:text-foreground",
                activeTab === "unread" && "border-primary text-foreground"
              )}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-6">
          <div className="border rounded-lg shadow-sm overflow-hidden">
            <Card>
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading notifications...</p>
                  </div>
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
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
                  <h3 className="text-xl font-medium mb-2">No notifications</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    When you receive notifications about replies, mentions, and other activities, they will appear here.
                  </p>
                </div>
              )}
            </Card>
          </div>
          
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          <div className="border rounded-lg shadow-sm overflow-hidden">
            <Card>
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading notifications...</p>
                  </div>
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
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <CheckCheck className="h-16 w-16 text-primary mb-4 opacity-30" />
                  <h3 className="text-xl font-medium mb-2">All caught up!</h3>
                  <p className="text-sm text-muted-foreground">
                    You have no unread notifications at the moment.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 