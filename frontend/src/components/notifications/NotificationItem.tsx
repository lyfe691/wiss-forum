import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  MessageSquare, 
  AtSign, 
  Heart, 
  UserCheck, 
  Trash2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Notification, useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { deleteNotification, markAsRead } = useNotifications();

  const handleClick = () => {
    if (!notification.read) {
      markAsRead([notification._id]);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteNotification(notification._id);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markAsRead([notification._id]);
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'reply':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'mention':
        return <AtSign className="h-4 w-4 text-green-500" />;
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'topic_reply':
        return <MessageSquare className="h-4 w-4 text-orange-500" />;
      case 'role_change':
        return <UserCheck className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    
    try {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    } catch (error) {
      console.error('Error getting initials:', error);
      return '?';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };

  return (
    <Link 
      to={notification.link || '#'} 
      className={cn(
        "group relative flex items-start p-4 transition-all duration-200",
        "hover:bg-muted/60 focus:bg-muted/60 focus:outline-none",
        !notification.read && "bg-primary/5 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary/50"
      )}
      onClick={handleClick}
    >
      <div className="flex w-full gap-3">
        {notification.sender && notification.sender.username ? (
          <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
            <AvatarImage src={notification.sender.avatar} alt={notification.sender.username} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(notification.sender.username)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shadow-sm border border-border">
            {getNotificationIcon()}
          </div>
        )}
        
        <div className="flex-1 min-w-0 space-y-1">
          <p className={cn(
            "text-sm line-clamp-2",
            !notification.read && "font-medium"
          )}>
            {notification.content}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            {formatTime(notification.createdAt)}
            {notification.type !== 'system' && (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-muted/80">
                {getNotificationIcon()}
                <span className="ml-1 capitalize">{notification.type.replace('_', ' ')}</span>
              </span>
            )}
          </p>
        </div>
        
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {!notification.read && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 rounded-full"
                    onClick={handleMarkAsRead}
                  >
                    <Check className="h-4 w-4 text-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark as read</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 rounded-full text-destructive hover:bg-destructive/10"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete notification</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Link>
  );
} 