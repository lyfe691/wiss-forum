import { Notification, INotification } from '../models/notification.model';
import { User, Topic, Post } from '../models';
import { ObjectId } from 'mongodb';
import { collections } from '../lib/database';

class NotificationService {
  /**
   * Create a notification for a user
   */
  async createNotification(data: {
    recipient: string | ObjectId;
    sender?: string | ObjectId;
    type: 'reply' | 'mention' | 'like' | 'topic_reply' | 'role_change' | 'system';
    content: string;
    link?: string;
    read: boolean;
  }): Promise<INotification | null> {
    try {
      // Create notification instance
      const notification = new Notification(data);
      
      // Convert to plain object for MongoDB
      const notificationDoc = {
        recipient: notification.recipient,
        type: notification.type,
        content: notification.content,
        read: notification.read,
        createdAt: notification.createdAt
      } as any;
      
      if (notification.sender) {
        notificationDoc.sender = notification.sender;
      }
      
      if (notification.link) {
        notificationDoc.link = notification.link;
      }
      
      // Insert into database
      const result = await collections.notifications?.insertOne(notificationDoc);
      
      if (!result) {
        throw new Error('Failed to create notification');
      }
      
      return {
        ...notification,
        _id: result.insertedId
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Notify a user when someone replies to their post
   */
  async notifyReply(postId: string, replyId: string): Promise<INotification | null> {
    try {
      // Get the reply post
      const reply = await collections.posts?.findOne({ _id: new ObjectId(replyId) });
      if (!reply) return null;

      // Get the original post
      const post = await collections.posts?.findOne({ _id: new ObjectId(postId) });
      if (!post) return null;

      // Don't notify if the author is replying to their own post
      if (reply.authorId.toString() === post.authorId.toString()) {
          return null;
      }

      // Get the topic for the link
      const topic = await collections.topics?.findOne({ _id: post.topicId });
      if (!topic) return null;

      // Get the author username
      const replyAuthor = await collections.users?.findOne({ _id: reply.authorId });
      if (!replyAuthor) return null;

      // Create notification
      return this.createNotification({
        recipient: post.authorId,
        sender: reply.authorId,
        type: 'reply',
        content: `${replyAuthor.username} replied to your post in "${topic.title}"`,
        link: `/topics/${topic.slug}#post-${replyId}`,
        read: false
      });
    } catch (error) {
      console.error('Error creating reply notification:', error);
      return null;
    }
  }

  /**
   * Notify a user when someone mentions them in a post
   */
  async notifyMention(username: string, postId: string): Promise<INotification | null> {
    try {
      // Get the mentioned user
      const mentionedUser = await collections.users?.findOne({ username });
      if (!mentionedUser) return null;
      
      // Get the post
      const post = await collections.posts?.findOne({ _id: new ObjectId(postId) });
      if (!post) return null;
      
      // Don't notify if the author is mentioning themselves
      if (post.authorId.toString() === mentionedUser._id?.toString()) return null;
      
      // Get the topic
      const topic = await collections.topics?.findOne({ _id: post.topicId });
      if (!topic) return null;
      
      // Get the mentioner
      const mentioner = await collections.users?.findOne({ _id: post.authorId });
      if (!mentioner) return null;
      
      // Create notification
      return this.createNotification({
        recipient: mentionedUser._id,
        sender: post.authorId,
        type: 'mention',
        content: `${mentioner.username} mentioned you in "${topic.title}"`,
        link: `/topics/${topic.slug}#post-${postId}`,
        read: false
      });
    } catch (error) {
      console.error('Error creating mention notification:', error);
      return null;
    }
  }

  /**
   * Notify a user when someone likes their post
   */
  async notifyLike(postId: string, likerId: string): Promise<INotification | null> {
    try {
      // Get the post
      const post = await collections.posts?.findOne({ _id: new ObjectId(postId) });
      if (!post) return null;

      // Don't notify if the user is liking their own post
      if (post.authorId.toString() === likerId) {
        return null;
      }

      // Get the topic for the link
      const topic = await collections.topics?.findOne({ _id: post.topicId });
      if (!topic) return null;

      // Get the liker
      const liker = await collections.users?.findOne({ _id: new ObjectId(likerId) });
      if (!liker) return null;

      // Create notification
      return this.createNotification({
        recipient: post.authorId,
        sender: new ObjectId(likerId),
        type: 'like',
        content: `${liker.username} liked your post in "${topic.title}"`,
        link: `/topics/${topic.slug}#post-${postId}`,
        read: false
      });
    } catch (error) {
      console.error('Error creating like notification:', error);
      return null;
    }
  }

  /**
   * Notify a topic author when someone replies to their topic
   */
  async notifyTopicReply(topicId: string, postId: string, repliedBy: string): Promise<INotification | null> {
    try {
      // Get the topic
      const topic = await collections.topics?.findOne({ _id: new ObjectId(topicId) });
      if (!topic) return null;

      // Don't notify if the user is replying to their own topic
      if (repliedBy === topic.authorId.toString()) {
        return null;
      }

      // Get the user who replied
      const replier = await collections.users?.findOne({ _id: new ObjectId(repliedBy) });
      if (!replier) return null;

      // Create notification
      return this.createNotification({
        recipient: topic.authorId,
        sender: new ObjectId(repliedBy),
        type: 'topic_reply',
        content: `${replier.username} replied to your topic "${topic.title}"`,
        link: `/topics/${topic.slug}#post-${postId}`,
        read: false
      });
    } catch (error) {
      console.error('Error creating topic reply notification:', error);
      return null;
    }
  }

  /**
   * Notify a user about a role change
   */
  async notifyRoleChange(userId: string | ObjectId, adminId: string | ObjectId, newRole: string): Promise<INotification | null> {
    try {
      // Convert IDs to ObjectId if they are strings
      const userObjId = typeof userId === 'string' ? new ObjectId(userId) : userId;
      const adminObjId = typeof adminId === 'string' ? new ObjectId(adminId) : adminId;
      
      // Get user and admin info for the notification
      const user = await collections.users?.findOne({ _id: userObjId });
      const admin = await collections.users?.findOne({ _id: adminObjId });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      let adminName = "System";
      if (admin) {
        adminName = admin.displayName || admin.username;
      }
      
      // Create notification
      return this.createNotification({
        recipient: userObjId,
        sender: adminObjId,
        type: 'role_change',
        content: `Your role has been updated to ${newRole} by ${adminName}.`,
        link: '/profile',
        read: false
      });
    } catch (error) {
      console.error('Error notifying user about role change:', error);
      // Don't throw the error to prevent breaking user role updates
      return null;
    }
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(userId: string, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      // Convert string ID to ObjectId
      const objectId = new ObjectId(userId);
      
      // Get total count for pagination
      const totalNotifications = await collections.notifications?.countDocuments({ recipient: objectId });
      
      // Get unread count
      const unreadCount = await collections.notifications?.countDocuments({ 
        recipient: objectId,
        read: false
      });
      
      // Get notifications with pagination
      const notifications = await collections.notifications?.find({ recipient: objectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
      
      // Add sender information
      const processedNotifications = await Promise.all((notifications || []).map(async (notification) => {
        // Use type assertion to access sender property
        const typedNotification = notification as any;
        
        if (typedNotification && typedNotification.sender) {
          const sender = await collections.users?.findOne(
            { _id: typedNotification.sender },
            { projection: { username: 1, avatar: 1 } }
          );
          
          if (sender) {
            return {
              ...notification,
              sender: {
                _id: sender._id,
                username: sender.username,
                avatar: sender.avatar
              }
            };
          }
        }
        
        return notification;
      }));
      
      return {
        notifications: processedNotifications,
        totalNotifications: totalNotifications || 0,
        unreadCount: unreadCount || 0,
        currentPage: page,
        totalPages: Math.ceil((totalNotifications || 0) / limit)
      };
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(userId: string, notificationIds?: string[]) {
    try {
      const query: any = { recipient: new ObjectId(userId) };
      
      // If specific IDs are provided, only mark those as read
      if (notificationIds && notificationIds.length > 0) {
        const objectIds = notificationIds.map(id => new ObjectId(id));
        query._id = { $in: objectIds };
      }
      
      const result = await collections.notifications?.updateMany(query, { $set: { read: true } });
      return { modifiedCount: result?.modifiedCount || 0 };
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    try {
      const result = await collections.notifications?.deleteOne({ 
        _id: new ObjectId(notificationId),
        recipient: new ObjectId(userId)
      });
      
      return { deletedCount: result?.deletedCount || 0 };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string) {
    try {
      const result = await collections.notifications?.deleteMany({ 
        recipient: new ObjectId(userId) 
      });
      
      return { deletedCount: result?.deletedCount || 0 };
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }
}

export default new NotificationService(); 