import { ObjectId } from 'mongodb';

export interface Category {
  _id?: ObjectId;
  name: string;
  description: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: ObjectId; // Reference to User
} 