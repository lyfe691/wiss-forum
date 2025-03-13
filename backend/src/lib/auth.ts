import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { User } from '../models';
import { Request } from 'express';

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'wiss-forum-secret-key';
const TOKEN_EXPIRY = '24h'; // Token expires in 24 hours

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password with hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user: User): string {
  const payload = {
    userId: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Custom role-based middleware types
export interface AuthRequest extends Request {
  user?: {
    userId: ObjectId;
    username: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
  };
}

// Generate random avatar URL using DiceBear
export function generateAvatarUrl(username: string): string {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(username)}`;
} 