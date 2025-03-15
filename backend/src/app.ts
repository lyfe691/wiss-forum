import express from 'express';
import cors from 'cors';

// Import routes
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import topicRoutes from './routes/topic.routes';
import postRoutes from './routes/post.routes';
import authRoutes from './routes/auth.routes';
import notificationRoutes from './routes/notification.routes';

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app; 