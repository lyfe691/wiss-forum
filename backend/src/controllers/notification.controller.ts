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

  /**
   * Get notification settings for the authenticated user
   */
  async getNotificationSettings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Get user's notification settings from user document
      const userDoc = await collections.users?.findOne({ _id: userId });
      if (!userDoc) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Type assertion to access settings property
      const user = userDoc as User;
      
      // Return notification settings with fallback values
      res.json({
        emailNotifications: user.settings?.emailNotifications ?? true,
        siteNotifications: user.settings?.siteNotifications ?? true,
        notifyOnReplies: user.settings?.notifyOnReplies ?? true,
        notifyOnMentions: user.settings?.notifyOnMentions ?? true,
        notifyOnLikes: user.settings?.notifyOnLikes ?? true,
        notifyOnTopicReplies: user.settings?.notifyOnTopicReplies ?? true,
        notifyOnRoleChanges: user.settings?.notifyOnRoleChanges ?? true
      });
    } catch (error) {
      console.error('Error getting notification settings:', error);
      res.status(500).json({ message: 'Failed to get notification settings' });
    }
  }

  /**
   * Update notification settings for the authenticated user
   */
  async updateNotificationSettings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const {
        emailNotifications,
        siteNotifications,
        notifyOnReplies,
        notifyOnMentions,
        notifyOnLikes,
        notifyOnTopicReplies,
        notifyOnRoleChanges
      } = req.body;
      
      // Update user's notification settings
      const result = await collections.users?.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            'settings.emailNotifications': emailNotifications,
            'settings.siteNotifications': siteNotifications,
            'settings.notifyOnReplies': notifyOnReplies,
            'settings.notifyOnMentions': notifyOnMentions,
            'settings.notifyOnLikes': notifyOnLikes,
            'settings.notifyOnTopicReplies': notifyOnTopicReplies,
            'settings.notifyOnRoleChanges': notifyOnRoleChanges
          }
        },
        { returnDocument: 'after' }
      );
      
      // Handle different MongoDB driver versions and ensure type safety
      const resultDoc = result ? ('value' in result ? result.value : result) : null;
      if (!resultDoc) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Type assertion to access settings property
      const updatedUser = resultDoc as User;
      
      // Return updated notification settings with fallback values
      res.json({
        emailNotifications: updatedUser.settings?.emailNotifications ?? true,
        siteNotifications: updatedUser.settings?.siteNotifications ?? true,
        notifyOnReplies: updatedUser.settings?.notifyOnReplies ?? true,
        notifyOnMentions: updatedUser.settings?.notifyOnMentions ?? true,
        notifyOnLikes: updatedUser.settings?.notifyOnLikes ?? true,
        notifyOnTopicReplies: updatedUser.settings?.notifyOnTopicReplies ?? true,
        notifyOnRoleChanges: updatedUser.settings?.notifyOnRoleChanges ?? true
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      res.status(500).json({ message: 'Failed to update notification settings' });
    }
  }
}

export default new NotificationController(); 