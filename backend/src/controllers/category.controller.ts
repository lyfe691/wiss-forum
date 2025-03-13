import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../lib/database';
import { Category } from '../models';
import { AuthRequest } from '../lib/auth';

// Create a new category
export async function createCategory(req: AuthRequest, res: Response) {
  const { name, description, order, parentCategory } = req.body;
  
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
  
  // Add parent category reference if provided
  if (parentCategory && ObjectId.isValid(parentCategory)) {
    // Check if parent category exists
    const parent = await collections.categories?.findOne({ _id: new ObjectId(parentCategory) });
    if (!parent) {
      return res.status(404).json({ message: 'Parent category not found' });
    }
    
    newCategory.parentCategory = new ObjectId(parentCategory);
  }
  
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
  
  // Group categories by parent
  const categoryMap = new Map<string, any>();
  const rootCategories: any[] = [];
  
  // First pass: store all categories in a map
  categories?.forEach(category => {
    categoryMap.set(category._id.toString(), { ...category, subcategories: [] });
  });
  
  // Second pass: organize into hierarchy
  categories?.forEach(category => {
    if (category.parentCategory) {
      const parentId = category.parentCategory.toString();
      const parent = categoryMap.get(parentId);
      if (parent) {
        parent.subcategories.push(categoryMap.get(category._id.toString()));
      }
    } else {
      rootCategories.push(categoryMap.get(category._id.toString()));
    }
  });
  
  return res.json(rootCategories);
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
  
  // Get subcategories
  const subcategories = await collections.categories?.find({ 
    parentCategory: category._id 
  }).toArray();
  
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
    subcategories,
    topics: topicsWithCounts
  });
}

// Update a category
export async function updateCategory(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { name, description, order, parentCategory, isActive } = req.body;
  
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
  
  // Handle parent category updates
  if (parentCategory !== undefined) {
    if (parentCategory === null || parentCategory === '') {
      // Remove parent category
      updateFields.parentCategory = undefined;
    } else if (ObjectId.isValid(parentCategory)) {
      // Verify parent exists and is not the category itself
      if (parentCategory === id) {
        return res.status(400).json({ message: 'A category cannot be its own parent' });
      }
      
      // Check for circular reference
      let currentParent = parentCategory;
      let depthCheck = 0;
      const maxDepth = 10; // Prevent infinite loops
      
      while (currentParent && depthCheck < maxDepth) {
        const parent = await collections.categories?.findOne({ _id: new ObjectId(currentParent) });
        if (!parent) {
          return res.status(404).json({ message: 'Parent category not found' });
        }
        
        if (parent.parentCategory?.toString() === id) {
          return res.status(400).json({ message: 'Circular reference detected in category hierarchy' });
        }
        
        currentParent = parent.parentCategory?.toString();
        depthCheck++;
      }
      
      updateFields.parentCategory = new ObjectId(parentCategory);
    } else {
      return res.status(400).json({ message: 'Invalid parent category ID' });
    }
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
  
  // Check for subcategories
  const subcategories = await collections.categories?.countDocuments({ parentCategory: new ObjectId(id) });
  
  if (subcategories && subcategories > 0) {
    return res.status(400).json({ 
      message: 'Cannot delete category with subcategories. Remove or reassign subcategories first.'
    });
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

// Temporary function to bootstrap a category creation (REMOVE IN PRODUCTION)
export async function bootstrapCreateCategory(req: Request, res: Response) {
  const { name, description, order, parentCategory, secretKey } = req.body;
  
  // Very basic security check to prevent unauthorized access
  if (secretKey !== 'WISS_ADMIN_SETUP_2024') {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
  
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
    // Since we're bypassing auth, we don't have a user ID from the auth middleware
    // If userId is provided in the request, use it; otherwise, leave it undefined
    ...(req.body.userId && { createdBy: new ObjectId(req.body.userId) })
  };
  
  // Add parent category reference if provided
  if (parentCategory && ObjectId.isValid(parentCategory)) {
    // Check if parent category exists
    const parent = await collections.categories?.findOne({ _id: new ObjectId(parentCategory) });
    if (!parent) {
      return res.status(404).json({ message: 'Parent category not found' });
    }
    
    newCategory.parentCategory = new ObjectId(parentCategory);
  }
  
  // Insert category into database
  const result = await collections.categories?.insertOne(newCategory);
  
  if (!result?.insertedId) {
    return res.status(500).json({ message: 'Failed to create category' });
  }
  
  return res.status(201).json({
    message: 'Category created successfully',
    success: true,
    category: { ...newCategory, _id: result.insertedId }
  });
}

// Bootstrap method to delete a category without standard auth
export async function bootstrapDeleteCategory(req: Request, res: Response) {
  const { categoryId, secretKey, userId } = req.body;
  
  // Validate secret key
  if (!secretKey || secretKey !== 'WISS_ADMIN_SETUP_2024') {
    return res.status(403).json({ message: 'Invalid secret key' });
  }
  
  // Validate input
  if (!categoryId) {
    return res.status(400).json({ message: 'Category ID is required' });
  }
  
  // Validate category ID
  if (!ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: 'Invalid category ID format' });
  }
  
  // Validate user exists (if userId provided)
  if (userId) {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const user = await collections.users?.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  }
  
  // Check if the category has subcategories
  const subcategories = await collections.categories?.find({ 
    parentCategory: new ObjectId(categoryId) 
  }).toArray();
  
  if (subcategories && subcategories.length > 0) {
    return res.status(400).json({ 
      message: 'Cannot delete category with subcategories. Please delete or move subcategories first.' 
    });
  }
  
  // Check if the category has topics
  const topics = await collections.topics?.find({ 
    categoryId: new ObjectId(categoryId) 
  }).toArray();
  
  if (topics && topics.length > 0) {
    return res.status(400).json({ 
      message: 'Cannot delete category with topics. Please delete or move topics first.' 
    });
  }
  
  // Delete the category
  const result = await collections.categories?.deleteOne({ 
    _id: new ObjectId(categoryId) 
  });
  
  if (!result?.deletedCount) {
    return res.status(404).json({ message: 'Category not found or already deleted' });
  }
  
  return res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
} 