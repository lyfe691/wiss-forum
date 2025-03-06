import { Router } from 'express';
import * as topicController from '../controllers/topic.controller';
import { authenticate, isTeacherOrAdmin } from '../middleware/auth.middleware';
import { asyncHandler, authAsyncHandler } from '../types/express-route-handlers';

const router = Router();

// Public routes
router.get('/category/:categoryId', asyncHandler(topicController.getTopicsByCategory));
router.get('/:idOrSlug', asyncHandler(topicController.getTopicByIdOrSlug));

// Protected routes (require authentication & proper role)
router.post('/', authenticate, isTeacherOrAdmin, authAsyncHandler(topicController.createTopic));
router.put('/:id', authenticate, isTeacherOrAdmin, authAsyncHandler(topicController.updateTopic));
router.delete('/:id', authenticate, isTeacherOrAdmin, authAsyncHandler(topicController.deleteTopic));

export default router; 