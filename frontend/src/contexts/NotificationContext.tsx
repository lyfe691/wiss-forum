import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationsAPI } from '../lib/api';
import { useAuth } from './AuthContext';

export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    username: string;
    avatar?: string;
  };
  type: 'reply' | 'mention' | 'like' | 'topic_reply' | 'role_change' | 'system';
  content: string;
  link?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  totalNotifications: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  fetchNotifications: (page?: number) => Promise<void>;
  markAsRead: (notificationIds?: string[]) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  // Set up polling for new notifications (every 30 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      fetchNotifications(1);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchNotifications = async (page = 1) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const data = await notificationsAPI.getNotifications(page);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setTotalNotifications(data.totalNotifications || 0);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds?: string[]) => {
    if (!isAuthenticated) return;
    
    try {
      await notificationsAPI.markAsRead(notificationIds);
      
      // If no specific IDs provided, mark all as read
      if (!notificationIds || notificationIds.length === 0) {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      } else {
        // Mark specific notifications as read
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notificationIds.includes(notification._id) 
              ? { ...notification, read: true } 
              : notification
          )
        );
        
        // Update unread count
        const markedCount = notificationIds.length;
        setUnreadCount(prev => Math.max(0, prev - markedCount));
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!isAuthenticated) return;
    
    try {
      await notificationsAPI.deleteNotification(id);
      
      // Remove from state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification._id !== id)
      );
      
      // Update counts
      setTotalNotifications(prev => prev - 1);
      
      // If it was unread, update unread count
      const wasUnread = notifications.find(n => n._id === id)?.read === false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteAllNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      await notificationsAPI.deleteAllNotifications();
      
      // Clear state
      setNotifications([]);
      setUnreadCount(0);
      setTotalNotifications(0);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    totalNotifications,
    currentPage,
    totalPages,
    loading,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    deleteAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 