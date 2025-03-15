import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  MessageSquare, 
  AtSign, 
  Heart, 
  UserCheck, 
  Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Notification, useNotifications } from '@/contexts/NotificationContext';

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { deleteNotification } = useNotifications();

  const handleClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteNotification(notification._id);
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'reply':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'mention':
        return <AtSign className="h-4 w-4 text-green-500" />;
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
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
      className={`
        block p-4 border-b hover:bg-muted/50 transition-colors relative
        ${!notification.read ? 'bg-primary/5' : ''}
      `}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {notification.sender && notification.sender.username ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={notification.sender.avatar} alt={notification.sender.username} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(notification.sender.username)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            {getNotificationIcon()}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="text-sm line-clamp-2">{notification.content}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatTime(notification.createdAt)}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </Link>
  );
} 