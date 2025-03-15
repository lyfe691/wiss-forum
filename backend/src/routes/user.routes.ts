import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { asyncHandler, authAsyncHandler } from '../types/express-route-handlers';

const router = Router();

// Public routes
router.get('/public', asyncHandler(userController.getPublicUsersList));
router.get('/profile/:idOrUsername', asyncHandler(userController.getPublicUserProfile));

// Temporary bootstrap admin route (REMOVE IN PRODUCTION)
router.post('/bootstrap-admin', asyncHandler(userController.bootstrapAdmin));
router.post('/bootstrap-teacher', asyncHandler(userController.bootstrapTeacher));

// Admin routes
router.get('/', authenticate, isAdmin, authAsyncHandler(userController.getAllUsers));
router.put('/:id/role', authenticate, isAdmin, authAsyncHandler(userController.updateUserRole));

// Protected routes
router.get('/profile', authenticate, authAsyncHandler(userController.getUserProfile));
router.put('/profile', authenticate, authAsyncHandler(userController.updateUserProfile));
router.put('/password', authenticate, authAsyncHandler(userController.changePassword));

export default router; 