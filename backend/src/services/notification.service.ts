import { Notification, NotificationType } from '../models/Notification';
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
    type: NotificationType;
    content: string;
    link?: string;
    read: boolean;
  }): Promise<Notification | null> {
    try {
      // Create notification object
      const notification: Partial<Notification> = {
        userId: typeof data.recipient === 'string' ? new ObjectId(data.recipient) : data.recipient,
        type: data.type,
        title: this.getTitleFromType(data.type),
        message: data.content,
        read: data.read,
        createdAt: new Date()
      };
      
      if (data.sender) {
        notification.actorId = typeof data.sender === 'string' ? new ObjectId(data.sender) : data.sender;
      }
      
      if (data.link) {
        notification.targetUrl = data.link;
      }
      
      // Insert into database
      const result = await collections.notifications?.insertOne(notification as Notification);
      
      if (!result) {
        throw new Error('Failed to create notification');
      }
      
      return {
        ...notification,
        _id: result.insertedId
      } as Notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Helper method to get a title based on notification type
  private getTitleFromType(type: NotificationType): string {
    switch (type) {
      case 'reply': return 'New Reply';
      case 'mention': return 'You were mentioned';
      case 'like': return 'New Like';
      case 'topic_reply': return 'New Topic Reply';
      case 'role_change': return 'Role Update';
      case 'system': return 'System Notification';
      default: return 'Notification';
    }
  }

  /**
   * Notify a user when someone replies to their post
   */
  async notifyReply(postId: string, replyId: string): Promise<Notification | null> {
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
  async notifyMention(username: string, postId: string): Promise<Notification | null> {
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
  async notifyLike(postId: string, likerId: string): Promise<Notification | null> {
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
  async notifyTopicReply(topicId: string, postId: string, repliedBy: string): Promise<Notification | null> {
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
  async notifyRoleChange(userId: string | ObjectId, adminId: string | ObjectId, newRole: string): Promise<Notification | null> {
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
      const totalNotifications = await collections.notifications?.countDocuments({ userId: objectId });
      
      // Get unread count
      const unreadCount = await collections.notifications?.countDocuments({ 
        userId: objectId,
        read: false
      });
      
      // Get notifications with pagination
      const notifications = await collections.notifications?.find({ userId: objectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
      
      // Add sender information
      const processedNotifications = await Promise.all((notifications || []).map(async (notification) => {
        // Use type assertion to access actorId property
        if (notification.actorId) {
          const actor = await collections.users?.findOne(
            { _id: notification.actorId },
            { projection: { username: 1, avatar: 1 } }
          );
          
          if (actor) {
            return {
              ...notification,
              actor: {
                _id: actor._id,
                username: actor.username,
                avatar: actor.avatar
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
      const query: any = { userId: new ObjectId(userId) };
      
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
        userId: new ObjectId(userId)
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
        userId: new ObjectId(userId) 
      });
      
      return { deletedCount: result?.deletedCount || 0 };
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }
}

export default new NotificationService(); 