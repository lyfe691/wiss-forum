import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../lib/database';
import { Category } from '../models';
import { AuthRequest } from '../lib/auth';

// Create a new category
export async function createCategory(req: AuthRequest, res: Response) {
  const { name, description, order } = req.body;
  
  // Validate input
  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }
  
  // Create slug from name (URL-friendly version)
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Check if category with the same slug already exists
  const existingCategory = await collections.categories?.findOne({ slug });
  if (existingCategory) {
    return res.status(400).json({ message: 'A category with this name already exists' });
  }
  
  // Create category object
  const newCategory: Category = {
    name,
    description,
    slug,
    order: order || 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: new ObjectId(req.user?.userId)
  };
  
  // Insert category into database
  const result = await collections.categories?.insertOne(newCategory);
  
  if (!result?.insertedId) {
    return res.status(500).json({ message: 'Failed to create category' });
  }
  
  return res.status(201).json({
    message: 'Category created successfully',
    category: { ...newCategory, _id: result.insertedId }
  });
}

// Get all categories
export async function getAllCategories(req: Request, res: Response) {
  const categories = await collections.categories?.find({}).toArray();
  return res.json(categories);
}

// Get category by ID or slug
export async function getCategoryByIdOrSlug(req: Request, res: Response) {
  const { idOrSlug } = req.params;
  
  let category;
  
  // Try to find by ID first
  if (ObjectId.isValid(idOrSlug)) {
    category = await collections.categories?.findOne({ _id: new ObjectId(idOrSlug) });
  }
  
  // If not found by ID, try to find by slug
  if (!category) {
    category = await collections.categories?.findOne({ slug: idOrSlug });
  }
  
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  
  // Get topics
  const topics = await collections.topics?.find({ 
    categoryId: category._id 
  }).toArray();
  
  // Count posts for each topic
  const topicsWithCounts = await Promise.all(
    topics?.map(async (topic) => {
      const postCount = await collections.posts?.countDocuments({ 
        topicId: topic._id 
      });
      
      // Get latest post if available
      let lastPost = null;
      if (topic.lastPostId) {
        const post = await collections.posts?.findOne({ _id: topic.lastPostId });
        if (post) {
          const author = await collections.users?.findOne(
            { _id: post.authorId },
            { projection: { password: 0 } }
          );
          lastPost = { ...post, author };
        }
      }
      
      return { ...topic, postCount, lastPost };
    }) || []
  );
  
  return res.json({
    ...category,
    topics: topicsWithCounts
  });
}

// Update a category
export async function updateCategory(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { name, description, order, isActive } = req.body;
  
  // Validate ID
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid category ID' });
  }
  
  // Find the category
  const category = await collections.categories?.findOne({ _id: new ObjectId(id) });
  
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  
  // Build update object
  const updateFields: Partial<Category> = { updatedAt: new Date() };
  
  if (name !== undefined) {
    updateFields.name = name;
    
    // Update slug if name changes
    if (name !== category.name) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Check if slug conflicts with existing category
      const existingCategory = await collections.categories?.findOne({ 
        slug, 
        _id: { $ne: new ObjectId(id) } 
      });
      
      if (existingCategory) {
        return res.status(400).json({ message: 'A category with this name already exists' });
      }
      
      updateFields.slug = slug;
    }
  }
  
  if (description !== undefined) {
    updateFields.description = description;
  }
  
  if (order !== undefined) {
    updateFields.order = order;
  }
  
  if (isActive !== undefined) {
    updateFields.isActive = isActive;
  }
  
  // Update category
  const result = await collections.categories?.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );
  
  if (!result?.matchedCount) {
    return res.status(404).json({ message: 'Category not found' });
  }
  
  // Get updated category
  const updatedCategory = await collections.categories?.findOne({ _id: new ObjectId(id) });
  
  return res.json({
    message: 'Category updated successfully',
    category: updatedCategory
  });
}

// Delete a category
export async function deleteCategory(req: AuthRequest, res: Response) {
  const { id } = req.params;
  
  // Validate ID
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid category ID' });
  }
  
  // Check if category exists
  const category = await collections.categories?.findOne({ _id: new ObjectId(id) });
  
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  
  // Check for topics
  const topics = await collections.topics?.countDocuments({ categoryId: new ObjectId(id) });
  
  if (topics && topics > 0) {
    return res.status(400).json({ 
      message: 'Cannot delete category with topics. Move or delete topics first.'
    });
  }
  
  // Delete category
  const result = await collections.categories?.deleteOne({ _id: new ObjectId(id) });
  
  if (!result?.deletedCount) {
    return res.status(500).json({ message: 'Failed to delete category' });
  }
  
  return res.json({ message: 'Category deleted successfully' });
} 