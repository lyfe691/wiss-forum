import { Response } from 'express';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { collections } from '../lib/database';
import { AuthRequest } from '../lib/auth';
import { User } from '../models';

// Get all users (admin only)
export async function getAllUsers(req: AuthRequest, res: Response) {
  const users = await collections.users?.find({}, { projection: { password: 0 } }).toArray();
  return res.json(users);
}

// Update user role (admin only)
export async function updateUserRole(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { role } = req.body;
  
  // Validate role
  if (!role || !['user', 'teacher', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Role must be user, teacher, or admin' });
  }
  
  // Validate ID
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }
  
  // Update user role
  const result = await collections.users?.updateOne(
    { _id: new ObjectId(id) },
    { $set: { role } }
  );
  
  if (!result?.matchedCount) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  return res.json({ message: 'User role updated successfully' });
}

// Get user profile
export async function getUserProfile(req: AuthRequest, res: Response) {
  const userId = new ObjectId(req.user?.userId);
  
  const user = await collections.users?.findOne(
    { _id: userId },
    { projection: { password: 0 } }
  );
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  return res.json(user);
}

// Update user profile
export async function updateUserProfile(req: AuthRequest, res: Response) {
  const userId = new ObjectId(req.user?.userId);
  const { username, email, displayName, bio } = req.body;
  
  // Validate input
  if (!username && !email && !displayName && bio === undefined) {
    return res.status(400).json({ message: 'At least one field to update is required' });
  }
  
  // Build update object
  const updateFields: Partial<User> = {};
  
  if (username) {
    // Check if username is already taken
    const existingUser = await collections.users?.findOne({ 
      username,
      _id: { $ne: userId }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }
    
    updateFields.username = username;
  }
  
  if (email) {
    // Check if email is already taken
    const existingUser = await collections.users?.findOne({ 
      email,
      _id: { $ne: userId }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }
    
    updateFields.email = email;
  }
  
  if (displayName !== undefined) {
    updateFields.displayName = displayName;
  }
  
  if (bio !== undefined) {
    updateFields.bio = bio;
  }
  
  // Update user
  const result = await collections.users?.updateOne(
    { _id: userId },
    { $set: updateFields }
  );
  
  if (!result?.matchedCount) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Get updated user
  const updatedUser = await collections.users?.findOne(
    { _id: userId },
    { projection: { password: 0 } }
  );
  
  return res.json({
    message: 'Profile updated successfully',
    user: updatedUser
  });
}

// Change password
export async function changePassword(req: AuthRequest, res: Response) {
  const userId = new ObjectId(req.user?.userId);
  const { currentPassword, newPassword } = req.body;
  
  // Validate input
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }
  
  // Get user with password
  const user = await collections.users?.findOne({ _id: userId });
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Verify current password
  const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
  
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  
  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  // Update password
  const result = await collections.users?.updateOne(
    { _id: userId },
    { $set: { password: hashedPassword } }
  );
  
  if (!result?.matchedCount) {
    return res.status(500).json({ message: 'Failed to update password' });
  }
  
  return res.json({ message: 'Password updated successfully' });
} 