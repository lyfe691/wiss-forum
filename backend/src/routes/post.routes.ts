import { Router } from 'express';
import * as postController from '../controllers/post.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler, authAsyncHandler } from '../types/express-route-handlers';

const router = Router();

// Public routes
router.get('/topic/:topicId', asyncHandler(postController.getPostsByTopic));

// Protected routes (require authentication)
router.post('/', authenticate, authAsyncHandler(postController.createPost));
router.put('/:id', authenticate, authAsyncHandler(postController.updatePost));
router.delete('/:id', authenticate, authAsyncHandler(postController.deletePost));
router.post('/:id/like', authenticate, authAsyncHandler(postController.toggleLikePost));

export default router; 