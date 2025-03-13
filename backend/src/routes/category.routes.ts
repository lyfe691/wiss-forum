import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticate, isTeacherOrAdmin } from '../middleware/auth.middleware';
import { asyncHandler, authAsyncHandler } from '../types/express-route-handlers';

const router = Router();

// Public routes
router.get('/', asyncHandler(categoryController.getAllCategories));
router.get('/:idOrSlug', asyncHandler(categoryController.getCategoryByIdOrSlug));

// Temporary bootstrap category routes (REMOVE IN PRODUCTION)
router.post('/bootstrap-create', asyncHandler(categoryController.bootstrapCreateCategory));
router.post('/bootstrap-delete', asyncHandler(categoryController.bootstrapDeleteCategory));

// Protected routes (require authentication & proper role)
router.post('/', authenticate, isTeacherOrAdmin, authAsyncHandler(categoryController.createCategory));
router.put('/:id', authenticate, isTeacherOrAdmin, authAsyncHandler(categoryController.updateCategory));
router.delete('/:id', authenticate, isTeacherOrAdmin, authAsyncHandler(categoryController.deleteCategory));

export default router; 