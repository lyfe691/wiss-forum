import { ObjectId } from 'mongodb';

export interface UserSettings {
  emailNotifications: boolean;
  siteNotifications: boolean;
  notifyOnReplies: boolean;
  notifyOnMentions: boolean;
  notifyOnLikes: boolean;
  notifyOnTopicReplies: boolean;
  notifyOnRoleChanges: boolean;
}

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string; // This will be hashed
  role: 'student' | 'teacher' | 'admin';
  displayName: string;
  avatar?: string;
  bio?: string;
  settings?: UserSettings;
  createdAt: Date;
  updatedAt: Date;
  lastActive?: Date;
}

export const userProjection = {
  password: 0 // Exclude password from query results
}; 