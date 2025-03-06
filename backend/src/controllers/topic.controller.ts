import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../lib/database';
import { Topic, Post } from '../models';
import { AuthRequest } from '../lib/auth';

// Create a new topic
export async function createTopic(req: AuthRequest, res: Response) {
  const { title, content, categoryId, tags } = req.body;
  const authorId = new ObjectId(req.user?.userId);
  
  // Validate input
  if (!title || !content || !categoryId) {
    return res.status(400).json({ message: 'Title, content, and category are required' });
  }
  
  // Validate category exists
  if (!ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: 'Invalid category ID' });
  }
  
  const category = await collections.categories?.findOne({ _id: new ObjectId(categoryId) });
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  
  // Create a slug from the title
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
  
  // Create the topic
  const newTopic: Topic = {
    title,
    content: content,
    slug,
    categoryId: new ObjectId(categoryId),
    authorId,
    tags: tags || [],
    viewCount: 0,
    isLocked: false,
    isPinned: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Insert the topic into the database
  const topicResult = await collections.topics?.insertOne(newTopic);
  
  if (!topicResult?.insertedId) {
    return res.status(500).json({ message: 'Failed to create topic' });
  }
  
  // Create the first post in the topic
  const firstPost: Post = {
    content,
    topicId: topicResult.insertedId,
    authorId,
    isEdited: false,
    likes: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const postResult = await collections.posts?.insertOne(firstPost);
  
  if (!postResult?.insertedId) {
    // Rollback topic creation if post creation fails
    await collections.topics?.deleteOne({ _id: topicResult.insertedId });
    return res.status(500).json({ message: 'Failed to create initial post' });
  }
  
  // Update the topic with the first post ID
  await collections.topics?.updateOne(
    { _id: topicResult.insertedId },
    { $set: { lastPostId: postResult.insertedId, lastPostAt: new Date() } }
  );
  
  // Get the author information
  const author = await collections.users?.findOne(
    { _id: authorId },
    { projection: { password: 0 } }
  );
  
  return res.status(201).json({
    message: 'Topic created successfully',
    topic: { ...newTopic, _id: topicResult.insertedId, author },
    post: { ...firstPost, _id: postResult.insertedId, author }
  });
}

// Get topics by category
export async function getTopicsByCategory(req: Request, res: Response) {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Validate category ID
    if (!ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    // Verify category exists
    const category = await collections.categories?.findOne({ _id: new ObjectId(categoryId) });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Get topics with pagination
    const topics = await collections.topics?.find({ categoryId: new ObjectId(categoryId) })
      .sort({ isPinned: -1, lastPostAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Get total count of topics in this category
    const totalTopics = await collections.topics?.countDocuments({ categoryId: new ObjectId(categoryId) });
    
    // Get author information for each topic
    const topicsWithAuthors = await Promise.all(
      topics?.map(async (topic) => {
        const author = await collections.users?.findOne(
          { _id: topic.authorId },
          { projection: { password: 0 } }
        );
        
        // Get last post if it exists
        let lastPost = null;
        if (topic.lastPostId) {
          lastPost = await collections.posts?.findOne({ _id: topic.lastPostId });
          
          if (lastPost) {
            const lastPostAuthor = await collections.users?.findOne(
              { _id: lastPost.authorId },
              { projection: { password: 0 } }
            );
            lastPost = { ...lastPost, author: lastPostAuthor };
          }
        }
        
        return { ...topic, author, lastPost };
      }) || []
    );
    
    res.json({
      topics: topicsWithAuthors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((totalTopics || 0) / limit),
        totalTopics: totalTopics,
        hasMore: skip + limit < (totalTopics || 0)
      }
    });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get a single topic by ID or slug
export async function getTopicByIdOrSlug(req: Request, res: Response) {
  try {
    const { idOrSlug } = req.params;
    
    let query = {};
    
    // Check if the parameter is an ObjectId or a slug
    if (ObjectId.isValid(idOrSlug)) {
      query = { _id: new ObjectId(idOrSlug) };
    } else {
      query = { slug: idOrSlug };
    }
    
    // Increment view count
    await collections.topics?.updateOne(query, { $inc: { viewCount: 1 } });
    
    // Get the topic
    const topic = await collections.topics?.findOne(query);
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    // Get author information
    const author = await collections.users?.findOne(
      { _id: topic.authorId },
      { projection: { password: 0 } }
    );
    
    // Get category information
    const category = await collections.categories?.findOne({ _id: topic.categoryId });
    
    // Get posts count
    const postsCount = await collections.posts?.countDocuments({ topicId: topic._id });
    
    res.json({
      topic: {
        ...topic,
        author,
        category,
        postsCount: (postsCount || 0) + 1 // Include the topic itself as the first post
      }
    });
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Update a topic
export async function updateTopic(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, content, isPinned, isLocked, tags } = req.body;
    const userId = new ObjectId(req.user?.userId);
    
    // Validate ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid topic ID' });
    }
    
    // Find the topic
    const topic = await collections.topics?.findOne({ _id: new ObjectId(id) });
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    // Check if user is the author or admin/teacher
    const isAuthor = topic.authorId.toString() === userId.toString();
    const isAdminOrTeacher = req.user?.role === 'admin' || req.user?.role === 'teacher';
    
    if (!isAuthor && !isAdminOrTeacher) {
      return res.status(403).json({ message: 'You do not have permission to update this topic' });
    }
    
    // Create update object
    const updateData: Partial<Topic> = {
      updatedAt: new Date()
    };
    
    // Add fields to update if provided
    if (isAuthor) {
      // Regular users can only update title, content, and tags
      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (tags) updateData.tags = tags;
    }
    
    if (isAdminOrTeacher) {
      // Admins/teachers can update all fields
      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (tags) updateData.tags = tags;
      if (typeof isPinned === 'boolean') updateData.isPinned = isPinned;
      if (typeof isLocked === 'boolean') updateData.isLocked = isLocked;
    }
    
    // Update slug if title was changed
    if (title) {
      updateData.slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    }
    
    // Update the topic
    const result = await collections.topics?.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (!result?.matchedCount) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    // Get the updated topic
    const updatedTopic = await collections.topics?.findOne({ _id: new ObjectId(id) });
    
    // Get author information
    const author = await collections.users?.findOne(
      { _id: updatedTopic?.authorId },
      { projection: { password: 0 } }
    );
    
    res.json({
      message: 'Topic updated successfully',
      topic: { ...updatedTopic, author }
    });
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Delete a topic
export async function deleteTopic(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = new ObjectId(req.user?.userId);
    
    // Validate ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid topic ID' });
    }
    
    // Find the topic
    const topic = await collections.topics?.findOne({ _id: new ObjectId(id) });
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    // Check if user is the author or admin/teacher
    const isAuthor = topic.authorId.toString() === userId.toString();
    const isAdminOrTeacher = req.user?.role === 'admin' || req.user?.role === 'teacher';
    
    if (!isAuthor && !isAdminOrTeacher) {
      return res.status(403).json({ message: 'You do not have permission to delete this topic' });
    }
    
    // Delete all posts related to this topic
    await collections.posts?.deleteMany({ topicId: new ObjectId(id) });
    
    // Delete the topic
    const result = await collections.topics?.deleteOne({ _id: new ObjectId(id) });
    
    if (!result?.deletedCount) {
      return res.status(500).json({ message: 'Failed to delete topic' });
    }
    
    res.json({ message: 'Topic and all its posts deleted successfully' });
  } catch (error) {
    console.error('Delete topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
} 