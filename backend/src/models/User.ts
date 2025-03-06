import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string; // This will be hashed
  role: 'student' | 'teacher' | 'admin';
  displayName: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  lastActive?: Date;
}

export const userProjection = {
  password: 0 // Exclude password from query results
}; 