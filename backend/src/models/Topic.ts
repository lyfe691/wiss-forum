import { ObjectId } from 'mongodb';

export interface Topic {
  _id?: ObjectId;
  title: string;
  content: string;
  slug: string;
  categoryId: ObjectId; // Reference to Category
  authorId: ObjectId; // Reference to User
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number; // Count of replies
  lastPostId?: ObjectId; // Reference to latest Post
  lastPostAt?: Date;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
} 