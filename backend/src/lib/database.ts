import { MongoClient, Db, Collection } from 'mongodb';
import { User, Category, Topic, Post } from '../models';

// MongoDB connection
let client: MongoClient;
let db: Db;

export const collections: {
  users?: Collection<User>;
  categories?: Collection<Category>;
  topics?: Collection<Topic>;
  posts?: Collection<Post>;
} = {};

// Connect to MongoDB
export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wiss_forum';

  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB');

    // Initialize collections
    collections.users = db.collection<User>('users');
    collections.categories = db.collection<Category>('categories');
    collections.topics = db.collection<Topic>('topics');
    collections.posts = db.collection<Post>('posts');

    // Create indexes
    await collections.users?.createIndex({ email: 1 }, { unique: true });
    await collections.users?.createIndex({ username: 1 }, { unique: true });
    await collections.categories?.createIndex({ slug: 1 }, { unique: true });
    await collections.topics?.createIndex({ slug: 1 });
    await collections.topics?.createIndex({ categoryId: 1 });
    await collections.posts?.createIndex({ topicId: 1 });
  }

  return { client, db, collections };
}

// Close MongoDB connection
export async function closeDatabase() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
} 