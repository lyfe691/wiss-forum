import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../lib/database';
import { User } from '../models';
import { hashPassword, comparePassword, generateToken, generateAvatarUrl } from '../lib/auth';

// Register a new user
export async function register(req: Request, res: Response) {
  try {
    const { username, email, password, displayName, role = 'student' } = req.body;

    // Validate input
    if (!username || !email || !password || !displayName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if username or email already exists
    const existingUser = await collections.users?.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.username === username 
          ? 'Username already exists' 
          : 'Email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user object
    const newUser: User = {
      username,
      email,
      password: hashedPassword,
      displayName,
      role: role as 'student' | 'teacher' | 'admin',
      avatar: generateAvatarUrl(username),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date()
    };

    // Insert user into database
    const result = await collections.users?.insertOne(newUser);

    if (!result?.insertedId) {
      return res.status(500).json({ message: 'Failed to create user' });
    }

    // Create a user object without the password for the response
    const { password: _, ...userWithoutPassword } = newUser;
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: { ...userWithoutPassword, _id: result.insertedId },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Login user
export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user by username (could be email or username)
    const user = await collections.users?.findOne({
      $or: [
        { username },
        { email: username } // Allow login with email as well
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last active timestamp
    await collections.users?.updateOne(
      { _id: user._id },
      { $set: { lastActive: new Date() } }
    );

    // Generate token
    const token = generateToken(user);

    // Return user information without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get current user info
export async function getCurrentUser(req: Request, res: Response) {
  try {
    const userId = new ObjectId((req as any).user.userId);
    
    const user = await collections.users?.findOne(
      { _id: userId },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
} 