import { ObjectId } from 'mongodb';

// Define the different types of notifications
export type NotificationType = 
  | 'reply'         // Someone replied to your post
  | 'mention'       // Someone mentioned you in a post
  | 'like'          // Someone liked your post
  | 'topic_reply'   // Someone replied to a topic you created
  | 'system'        // System notification (e.g., announcement)
  | 'role_change';  // Your role has been changed

export interface Notification {
  _id?: ObjectId;
  userId: ObjectId;     // User receiving the notification (also called recipient)
  actorId?: ObjectId;   // User who triggered the notification (also called sender, null for system notifications)
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  targetUrl?: string;   // URL to navigate to when clicked
  topicId?: ObjectId;   // Related topic if applicable
  postId?: ObjectId;    // Related post if applicable
  createdAt: Date;
  updatedAt?: Date;
}

// Settings for user notification preferences
export interface NotificationSettings {
  _id?: ObjectId;
  userId: ObjectId;
  emailNotifications: boolean;
  siteNotifications: boolean;
  notifyOnReplies: boolean;
  notifyOnMentions: boolean;
  notifyOnLikes: boolean;
  notifyOnTopicReplies: boolean;
  notifyOnRoleChanges: boolean;
  updatedAt: Date;
} 