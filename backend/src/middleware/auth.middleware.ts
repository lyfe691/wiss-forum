import { Response, NextFunction, Request, RequestHandler } from 'express';
import { AuthRequest, verifyToken } from '../lib/auth';

// Middleware to authenticate JWT token
export const authenticate: RequestHandler = (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required. No token provided.' });
      return;
    }
    
    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = verifyToken(token);
    
    // Add user info to request object
    (req as AuthRequest).user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user is an admin
export const isAdmin: RequestHandler = (req, res, next) => {
  const authReq = req as AuthRequest;
  if (!authReq.user || authReq.user.role !== 'admin') {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    return;
  }
  next();
};

// Middleware to check if user is a teacher or admin
export const isTeacherOrAdmin: RequestHandler = (req, res, next) => {
  const authReq = req as AuthRequest;
  if (!authReq.user || (authReq.user.role !== 'teacher' && authReq.user.role !== 'admin')) {
    res.status(403).json({ message: 'Access denied. Teacher or admin privileges required.' });
    return;
  }
  next();
}; 