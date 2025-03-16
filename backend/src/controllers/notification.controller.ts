import { Request, Response } from 'express';
import NotificationService from '../services/notification.service';
import { collections } from '../lib/database';
import { ObjectId } from 'mongodb';
import { AuthRequest } from '../lib/auth';
import { User } from '../models';

class NotificationController {
  /**
   * Get notifications for the authenticated user
   */
  async getNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await NotificationService.getNotifications(userId.toString(), page, limit);
      
      res.json(result);
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({ message: 'Failed to get notifications' });
    }
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { notificationIds } = req.body;
      
      const result = await NotificationService.markAsRead(userId.toString(), notificationIds);
      
      res.json({ 
        message: 'Notifications marked as read',
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      res.status(500).json({ message: 'Failed to mark notifications as read' });
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const notificationId = req.params.id;
      
      const result = await NotificationService.deleteNotification(notificationId, userId.toString());
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      res.json({ message: 'Notification deleted' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ message: 'Failed to delete notification' });
    }
  }

  /**
   * Delete all notifications for the authenticated user
   */
  async deleteAllNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const result = await NotificationService.deleteAllNotifications(userId.toString());
      
      res.json({ 
        message: 'All notifications deleted',
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      res.status(500).json({ message: 'Failed to delete notifications' });
    }
  }
}

export default new NotificationController(); 