import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import NotificationController from '../controllers/notification.controller';

const router = express.Router();

// Get all notifications for the authenticated user
router.get('/', authenticate, (req: Request, res: Response) => {
  NotificationController.getNotifications(req, res);
});

// Mark notifications as read
router.post('/mark-read', authenticate, (req: Request, res: Response) => {
  NotificationController.markAsRead(req, res);
});

// Delete a notification
router.delete('/:id', authenticate, (req: Request, res: Response) => {
  NotificationController.deleteNotification(req, res);
});

// Delete all notifications for the authenticated user
router.delete('/', authenticate, (req: Request, res: Response) => {
  NotificationController.deleteAllNotifications(req, res);
});

export default router; 