import { useState, useEffect } from 'react';
import { Bell, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext';
import { Link } from 'react-router-dom';
import { NotificationItem } from './NotificationItem';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead,
    fetchNotifications
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  // Refresh notifications when opening the popover
  useEffect(() => {
    if (open) {
      fetchNotifications(1);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
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
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-10 h-10 rounded-full relative p-0 hover:bg-muted/80 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-sm"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 shadow-lg rounded-xl border overflow-hidden" align="end">
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <h3 className="font-semibold text-base">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm h-9 gap-1.5 px-3"
              onClick={handleMarkAllAsRead}
              disabled={isMarking}
            >
              {isMarking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-5 w-5" />
              )}
              <span>Mark all as read</span>
            </Button>
          )}
        </div>
        
        <ScrollArea className="max-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              </div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.slice(0, 5).map((notification) => (
                <NotificationItem 
                  key={notification._id} 
                  notification={notification} 
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mb-3 opacity-30" />
              <p className="text-sm font-medium mb-1">No notifications</p>
              <p className="text-xs text-muted-foreground">You're all caught up!</p>
            </div>
          )}
        </ScrollArea>
        
        <div className="p-3 border-t bg-muted/30">
          <Link 
            to="/notifications" 
            className="block w-full text-center py-2 px-4 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
} 