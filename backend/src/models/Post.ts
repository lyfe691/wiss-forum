import { ObjectId } from 'mongodb';

export interface Post {
  _id?: ObjectId;
  content: string;
  topicId: ObjectId; // Reference to Topic
  authorId: ObjectId; // Reference to User
  isEdited: boolean;
  lastEditedAt?: Date;
  replyTo?: ObjectId; // Reference to another Post (for replies to specific posts)
  likes: ObjectId[]; // Array of User IDs who liked the post
  createdAt: Date;
  updatedAt: Date;
} 