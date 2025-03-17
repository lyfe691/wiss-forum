import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler, authAsyncHandler } from '../types/express-route-handlers';

const router = Router();

// Register a new user
router.post('/register', asyncHandler(authController.register));

// Login user
router.post('/login', asyncHandler(authController.login));

// Get current user profile (protected route)
router.get('/me', authenticate, authAsyncHandler(authController.getCurrentUser));

// Refresh token (protected route)
router.post('/refresh-token', authenticate, authAsyncHandler(authController.refreshToken));

export default router; 