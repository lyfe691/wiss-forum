import { ObjectId } from 'mongodb';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: ObjectId;
        username: string;
        email: string;
        role: 'student' | 'teacher' | 'admin';
      };
    }
  }
} 