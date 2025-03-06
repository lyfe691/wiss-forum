import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../lib/database';
import { Category } from '../models';
import { AuthRequest } from '../lib/auth';

// Create a new category
export async function createCategory(req: AuthRequest, res: Response) {
  try {
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
    
    // Add parent category if provided
    if (parentCategory) {
      // Verify parent category exists
      const parent = await collections.categories?.findOne({ _id: new ObjectId(parentCategory) });
      if (!parent) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
      newCategory.parentCategory = new ObjectId(parentCategory);
    }
    
    // Insert category into database
    const result = await collections.categories?.insertOne(newCategory);
    
    if (!result?.insertedId) {
      return res.status(500).json({ message: 'Failed to create category' });
    }
    
    res.status(201).json({
      message: 'Category created successfully',
      category: { ...newCategory, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get all categories
export async function getAllCategories(req: Request, res: Response) {
  try {
    const categories = await collections.categories?.find({}).toArray();
    
    // Organize categories into a hierarchy
    const rootCategories = categories?.filter(cat => !cat.parentCategory);
    const childCategories = categories?.filter(cat => cat.parentCategory);
    
    // Create a structured hierarchical response
    const structuredCategories = rootCategories?.map(root => {
      const children = childCategories?.filter(
        child => child.parentCategory?.toString() === root._id?.toString()
      );
      return { ...root, children: children || [] };
    });
    
    res.json({ categories: structuredCategories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get a single category by ID or slug
export async function getCategoryByIdOrSlug(req: Request, res: Response) {
  try {
    const { idOrSlug } = req.params;
    
    let query = {};
    
    // Check if the parameter is an ObjectId or a slug
    if (ObjectId.isValid(idOrSlug)) {
      query = { _id: new ObjectId(idOrSlug) };
    } else {
      query = { slug: idOrSlug };
    }
    
    const category = await collections.categories?.findOne(query);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Get child categories if any
    const childCategories = await collections.categories?.find({ parentCategory: category._id }).toArray();
    
    // Get topics count
    const topicsCount = await collections.topics?.countDocuments({ categoryId: category._id });
    
    res.json({ 
      category: { 
        ...category, 
        children: childCategories || [], 
        topicsCount: topicsCount || 0
      } 
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Update a category
export async function updateCategory(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, order, isActive, parentCategory } = req.body;
    
    // Validate ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    // Find the category
    const category = await collections.categories?.findOne({ _id: new ObjectId(id) });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Create update object
    const updateData: Partial<Category> = {
      updatedAt: new Date()
    };
    
    // Add fields to update if provided
    if (name) {
      updateData.name = name;
      // Update slug if name changes
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    
    if (description) updateData.description = description;
    if (typeof order === 'number') updateData.order = order;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    
    // Handle parent category update
    if (parentCategory === null) {
      // Remove parent category
      updateData.parentCategory = undefined;
    } else if (parentCategory && parentCategory !== category.parentCategory?.toString()) {
      // Change parent category
      // Verify parent category exists and is not the same as this category
      if (parentCategory === id) {
        return res.status(400).json({ message: 'A category cannot be its own parent' });
      }
      
      const parent = await collections.categories?.findOne({ _id: new ObjectId(parentCategory) });
      if (!parent) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
      
      updateData.parentCategory = new ObjectId(parentCategory);
    }
    
    // Update the category
    const result = await collections.categories?.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (!result?.matchedCount) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Get the updated category
    const updatedCategory = await collections.categories?.findOne({ _id: new ObjectId(id) });
    
    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Delete a category
export async function deleteCategory(req: AuthRequest, res: Response) {
  try {
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
    
    // Check if there are subcategories
    const childCategories = await collections.categories?.countDocuments({ parentCategory: new ObjectId(id) });
    
    if (childCategories && childCategories > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with subcategories. Delete or reassign subcategories first.' 
      });
    }
    
    // Check if there are topics in this category
    const topicsCount = await collections.topics?.countDocuments({ categoryId: new ObjectId(id) });
    
    if (topicsCount && topicsCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with topics. Delete or move topics first.' 
      });
    }
    
    // Delete the category
    const result = await collections.categories?.deleteOne({ _id: new ObjectId(id) });
    
    if (!result?.deletedCount) {
      return res.status(500).json({ message: 'Failed to delete category' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
} 