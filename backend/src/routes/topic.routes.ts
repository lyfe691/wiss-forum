import { Router } from 'express';
import * as topicController from '../controllers/topic.controller';
import { authenticate, isTeacherOrAdmin } from '../middleware/auth.middleware';
import { asyncHandler, authAsyncHandler } from '../types/express-route-handlers';

const router = Router();

// Public routes
router.get('/latest', asyncHandler(topicController.getLatestTopics));
router.get('/category/:categoryId', asyncHandler(topicController.getTopicsByCategory));
router.get('/:idOrSlug', asyncHandler(topicController.getTopicByIdOrSlug));

// Bootstrap routes - temporary, remove in production
router.post('/bootstrap-create', asyncHandler(topicController.bootstrapCreateTopic));
router.post('/bootstrap-delete', asyncHandler(topicController.bootstrapDeleteTopic));

// Protected routes (require authentication & proper role)
router.post('/', authenticate, authAsyncHandler(topicController.createTopic));
router.put('/:id', authenticate, isTeacherOrAdmin, authAsyncHandler(topicController.updateTopic));
router.delete('/:id', authenticate, isTeacherOrAdmin, authAsyncHandler(topicController.deleteTopic));

export default router; 