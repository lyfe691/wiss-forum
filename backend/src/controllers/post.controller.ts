import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../lib/database';
import { Post } from '../models';
import { AuthRequest } from '../lib/auth';
import NotificationService from '../services/notification.service';

// Create a new post (reply)
export async function createPost(req: AuthRequest, res: Response) {
  const { content, topicId, replyTo } = req.body;
  const authorId = new ObjectId(req.user?.userId);
  
  // Validate input
  if (!content || !topicId) {
    return res.status(400).json({ message: 'Content and topic ID are required' });
  }
  
  // Validate topic ID
  if (!ObjectId.isValid(topicId)) {
    return res.status(400).json({ message: 'Invalid topic ID' });
  }
  
  // Check if topic exists and is not locked
  const topic = await collections.topics?.findOne({ _id: new ObjectId(topicId) });
  
  if (!topic) {
    return res.status(404).json({ message: 'Topic not found' });
  }
  
  if (topic.isLocked) {
    return res.status(403).json({ message: 'This topic is locked and cannot be replied to' });
  }
  
  // Validate replyTo if provided
  if (replyTo && !ObjectId.isValid(replyTo)) {
    return res.status(400).json({ message: 'Invalid replyTo post ID' });
  }
  
  let replyToPost;
  if (replyTo) {
    replyToPost = await collections.posts?.findOne({ _id: new ObjectId(replyTo) });
    if (!replyToPost) {
      return res.status(404).json({ message: 'Reply to post not found' });
    }
  }
  
  // Create new post
  const newPost: Post = {
    content,
    topicId: new ObjectId(topicId),
    authorId,
    isEdited: false,
    likes: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Add replyTo if provided
  if (replyTo) {
    newPost.replyTo = new ObjectId(replyTo);
  }
  
  // Insert post into database
  const result = await collections.posts?.insertOne(newPost);
  
  if (!result?.insertedId) {
    return res.status(500).json({ message: 'Failed to create post' });
  }
  
  // Update topic with last post information
  await collections.topics?.updateOne(
    { _id: new ObjectId(topicId) },
    { 
      $set: { 
        lastPostId: result.insertedId,
        lastPostAt: new Date() 
      },
      $inc: { replyCount: 1 }
    }
  );
  
  // Get author information
  const author = await collections.users?.findOne(
    { _id: authorId },
    { projection: { password: 0 } }
  );
  
  // Create notifications
  try {
    const authorName = author?.displayName || author?.username || 'Someone';
    
    // If this is a reply to another post, notify that post's author
    if (replyTo && replyToPost) {
      // Get the post we're replying to
      const originalPostAuthorId = replyToPost.authorId;
      
      await NotificationService.notifyReply(replyTo, result.insertedId.toString());
    }
    
    // Also notify the topic creator if it's not the author of this post
    if (topic.authorId.toString() !== authorId.toString()) {
      await NotificationService.notifyTopicReply(
        topic._id.toString(),
        result.insertedId.toString(),
        authorId.toString()
      );
    }
    
    // Check for @mentions in the content and notify those users
    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex);
    
    if (mentions && mentions.length > 0) {
      // Extract usernames from mentions
      const usernames = mentions.map((mention: string) => mention.substring(1));
      
      // Notify each mentioned user
      for (const username of usernames) {
        await NotificationService.notifyMention(username, result.insertedId.toString());
      }
    }
  } catch (error) {
    // Don't fail the post creation if notification creation fails
    console.error('Failed to create notifications:', error);
  }
  
  // If it's a reply to another post, get that post's information
  let replyToPostData = null;
  if (replyTo) {
    replyToPostData = await collections.posts?.findOne({ _id: new ObjectId(replyTo) });
    if (replyToPostData) {
      const replyToAuthor = await collections.users?.findOne(
        { _id: replyToPostData.authorId },
        { projection: { password: 0 } }
      );
      replyToPostData = { ...replyToPostData, author: replyToAuthor };
    }
  }
  
  return res.status(201).json({
    message: 'Post created successfully',
    post: { 
      ...newPost, 
      _id: result.insertedId,
      author,
      replyToPost: replyToPostData
    }
  });
}

// Get posts by topic
export async function getPostsByTopic(req: Request, res: Response) {
  const { topicId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  // Validate topic ID
  if (!ObjectId.isValid(topicId)) {
    return res.status(400).json({ message: 'Invalid topic ID' });
  }
  
  // Verify topic exists
  const topic = await collections.topics?.findOne({ _id: new ObjectId(topicId) });
  if (!topic) {
    return res.status(404).json({ message: 'Topic not found' });
  }
  
  // Get posts with pagination
  const posts = await collections.posts?.find({ topicId: new ObjectId(topicId) })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  
  // Get total count of posts in this topic
  const totalPosts = await collections.posts?.countDocuments({ topicId: new ObjectId(topicId) });
  
  // Get author information for each post
  const postsWithAuthors = await Promise.all(
    posts?.map(async (post) => {
      const author = await collections.users?.findOne(
        { _id: post.authorId },
        { projection: { password: 0 } }
      );
      
      // Get reply information if this is a reply
      let replyToPost = null;
      if (post.replyTo) {
        replyToPost = await collections.posts?.findOne({ _id: post.replyTo });
        if (replyToPost) {
          const replyToAuthor = await collections.users?.findOne(
            { _id: replyToPost.authorId },
            { projection: { password: 0 } }
          );
          replyToPost = { ...replyToPost, author: replyToAuthor };
        }
      }
      
      return { ...post, author, replyToPost };
    }) || []
  );
  
  return res.json({
    posts: postsWithAuthors,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil((totalPosts || 0) / limit),
      totalPosts: totalPosts,
      hasMore: skip + limit < (totalPosts || 0)
    }
  });
}

// Update a post
export async function updatePost(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { content } = req.body;
  const userId = new ObjectId(req.user?.userId);
  
  // Validate input
  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }
  
  // Validate ID
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }
  
  // Find the post
  const post = await collections.posts?.findOne({ _id: new ObjectId(id) });
  
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  // Check if user is the author or admin/teacher
  const isAuthor = post.authorId.toString() === userId.toString();
  const isAdminOrTeacher = req.user?.role === 'admin' || req.user?.role === 'teacher';
  
  if (!isAuthor && !isAdminOrTeacher) {
    return res.status(403).json({ message: 'You do not have permission to update this post' });
  }
  
  // Get the topic to check if it's locked
  const topic = await collections.topics?.findOne({ _id: post.topicId });
  
  if (topic?.isLocked && !isAdminOrTeacher) {
    return res.status(403).json({ message: 'This topic is locked and posts cannot be edited' });
  }
  
  // Update the post
  const result = await collections.posts?.updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: { 
        content,
        isEdited: true,
        lastEditedAt: new Date(),
        updatedAt: new Date() 
      } 
    }
  );
  
  if (!result?.matchedCount) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  // Get the updated post
  const updatedPost = await collections.posts?.findOne({ _id: new ObjectId(id) });
  
  // Get author information
  const author = await collections.users?.findOne(
    { _id: updatedPost?.authorId },
    { projection: { password: 0 } }
  );
  
  // Get reply information if this is a reply
  let replyToPost = null;
  if (updatedPost?.replyTo) {
    replyToPost = await collections.posts?.findOne({ _id: updatedPost.replyTo });
    if (replyToPost) {
      const replyToAuthor = await collections.users?.findOne(
        { _id: replyToPost.authorId },
        { projection: { password: 0 } }
      );
      replyToPost = { ...replyToPost, author: replyToAuthor };
    }
  }
  
  return res.json({
    message: 'Post updated successfully',
    post: { ...updatedPost, author, replyToPost }
  });
}

// Delete a post
export async function deletePost(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = new ObjectId(req.user?.userId);
  
  // Validate ID
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }
  
  // Find the post
  const post = await collections.posts?.findOne({ _id: new ObjectId(id) });
  
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  // Check if user is the author or admin/teacher
  const isAuthor = post.authorId.toString() === userId.toString();
  const isAdminOrTeacher = req.user?.role === 'admin' || req.user?.role === 'teacher';
  
  if (!isAuthor && !isAdminOrTeacher) {
    return res.status(403).json({ message: 'You do not have permission to delete this post' });
  }
  
  // Get the topic to check if it's locked
  const topic = await collections.topics?.findOne({ _id: post.topicId });
  
  if (topic?.isLocked && !isAdminOrTeacher) {
    return res.status(403).json({ message: 'This topic is locked and posts cannot be deleted' });
  }
  
  // Check if this post is referenced by other posts as a reply
  const referencingPosts = await collections.posts?.countDocuments({ replyTo: new ObjectId(id) });
  
  if (referencingPosts && referencingPosts > 0) {
    // Don't delete, just update the content
    await collections.posts?.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          content: '[This post has been deleted]',
          isEdited: true,
          lastEditedAt: new Date(),
          updatedAt: new Date() 
        } 
      }
    );
    
    return res.json({ message: 'Post content removed but kept as reference for replies' });
  }
  
  // Delete the post
  const result = await collections.posts?.deleteOne({ _id: new ObjectId(id) });
  
  if (!result?.deletedCount) {
    return res.status(500).json({ message: 'Failed to delete post' });
  }
  
  // Decrement the topic's replyCount
  await collections.topics?.updateOne(
    { _id: post.topicId },
    { $inc: { replyCount: -1 } }
  );
  
  // Update the topic's lastPostId if necessary
  if (topic?.lastPostId?.toString() === id) {
    // Find the new latest post
    const latestPost = await collections.posts?.find({ topicId: topic._id })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
    
    if (latestPost && latestPost.length > 0) {
      await collections.topics?.updateOne(
        { _id: topic._id },
        { 
          $set: { 
            lastPostId: latestPost[0]._id,
            lastPostAt: latestPost[0].createdAt 
          } 
        }
      );
    } else {
      // No posts left, set lastPostId to the topic itself
      await collections.topics?.updateOne(
        { _id: topic._id },
        { 
          $set: { 
            lastPostId: topic._id,
            lastPostAt: topic.createdAt
          } 
        }
      );
    }
  }
  
  return res.json({ message: 'Post deleted successfully' });
}

// Like/unlike a post
export async function toggleLikePost(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = new ObjectId(req.user?.userId);
  
  // Validate ID
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }
  
  // Find the post
  const post = await collections.posts?.findOne({ _id: new ObjectId(id) });
  
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  // Check if the user has already liked the post
  const hasLiked = post.likes.some(likeId => likeId.toString() === userId.toString());
  
  let operation;
  let message;
  
  if (hasLiked) {
    // Unlike the post
    operation = { $pull: { likes: userId } };
    message = 'Post unliked successfully';
  } else {
    // Like the post
    operation = { $addToSet: { likes: userId } };
    message = 'Post liked successfully';
  }
  
  // Update the post
  await collections.posts?.updateOne(
    { _id: new ObjectId(id) },
    operation
  );
  
  // Get the updated post
  const updatedPost = await collections.posts?.findOne({ _id: new ObjectId(id) });
  
  // Get author information
  const author = await collections.users?.findOne(
    { _id: updatedPost?.authorId },
    { projection: { password: 0 } }
  );
  
  // Send notification if this is a like (not an unlike)
  if (post.authorId.toString() !== userId.toString()) {
    // Get the liker's info for notification
    const liker = await collections.users?.findOne({ _id: userId });
    const likerName = liker?.displayName || liker?.username || 'Someone';
    
    await NotificationService.notifyLike(post._id.toString(), userId.toString());
  }
  
  return res.json({
    message,
    post: { ...updatedPost, author },
    liked: !hasLiked
  });
} 