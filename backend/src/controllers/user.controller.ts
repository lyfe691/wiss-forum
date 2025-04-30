import { Response } from 'express';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { collections } from '../lib/database';
import { AuthRequest } from '../lib/auth';
import { User } from '../models';
import { Request } from 'express';

// Get all users (admin only)
export async function getAllUsers(req: AuthRequest, res: Response) {
  const users = await collections.users?.find({}, { projection: { password: 0 } }).toArray();
  return res.json(users);
}

/**
 * Update a user's role
 */
export async function updateUserRole(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = new ObjectId(req.user?.userId);
    
    // Validate input
    if (!role || !['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Valid role is required' });
    }
    
    // Ensure the ID is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Update the user's role
    const result = await collections.users?.updateOne(
      { _id: new ObjectId(id) },
      { $set: { role } }
    );
    
    console.log('Update result:', result);
    
    if (!result?.matchedCount) {
      console.error('User not found:', id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json({ 
      success: true,
      message: 'User role updated successfully',
      role: role 
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ message: 'Failed to update user role' });
  }
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

// Get public user list (accessible to all)
export async function getPublicUsersList(req: Request, res: Response) {
  try {
    // Simple approach to avoid potential MongoDB projection issues
    const allUsers = await collections.users?.find().toArray();
    
    if (!allUsers) {
      return res.json([]);
    }
    
    // Filter sensitive information manually
    const publicUsers = allUsers.map(user => ({
      _id: user._id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      role: user.role,
      bio: user.bio,
      createdAt: user.createdAt
    }));
    
    return res.json(publicUsers);
  } catch (error) {
    console.error('Error fetching public users list:', error);
    return res.status(500).json({ message: 'Server error while fetching users' });
  }
}

// Get public profile of a specific user by ID or username
export async function getPublicUserProfile(req: Request, res: Response) {
  try {
    const { idOrUsername } = req.params;
    let query = {};
    
    // Check if the parameter is an ObjectId or a username
    if (ObjectId.isValid(idOrUsername)) {
      query = { _id: new ObjectId(idOrUsername) };
    } else {
      query = { username: idOrUsername };
    }
    
    const user = await collections.users?.findOne(query);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return only public information
    const publicProfile = {
      _id: user._id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      role: user.role,
      bio: user.bio,
      createdAt: user.createdAt
    };
    
    return res.json(publicProfile);
  } catch (error) {
    console.error('Error fetching public user profile:', error);
    return res.status(500).json({ message: 'Server error while fetching user profile' });
  }
} 