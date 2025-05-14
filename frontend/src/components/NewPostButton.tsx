import { Plus, FolderPlus, AlertTriangle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert as AlertComponent, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { categoriesAPI, authAPI } from '@/lib/api';
import axios from 'axios';
import { Role, roleUtils } from '@/lib/types';

// Define the interface for category objects
interface Category {
  _id: string;
  id?: string;  // Add id field to support Spring's response format
  name: string;
  description: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export function NewPostButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Track when the selected category changes
  useEffect(() => {
    console.log('NewPostButton: Selected category changed to:', selectedCategory);
  }, [selectedCategory]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [error, setError] = useState('');
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleOpenDialog = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      const categoriesData = await categoriesAPI.getAllCategories();
      setCategories(categoriesData);
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTopic = () => {
    if (!selectedCategory) return;
    console.log("Creating topic in category:", selectedCategory);
    setIsOpen(false);
    navigate(`/create-topic/${selectedCategory}`);
  };
  
  const handleCreateCategory = async () => {
    if (!categoryName.trim() || !categoryDescription.trim()) return;
    
    if (!isAuthenticated || !user) {
      setError('You must be logged in to create a category');
      return;
    }
    
    // Check if user has sufficient permissions using roleUtils
    const userRole = roleUtils.normalizeRole(user.role);
    if (!roleUtils.hasAtLeastSamePrivilegesAs(userRole, Role.TEACHER)) {
      setError('You do not have permission to create categories');
      return;
    }
    
    try {
      setIsCreatingCategory(true);
      setError('');
      
      // Generate a slug manually to handle any backend issues
      const generatedSlug = categoryName.trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with a single one
        .trim();                  // Trim any leading/trailing spaces or hyphens
      
      console.log('NewPostButton: Generated slug locally:', generatedSlug);
      
      // Try to refresh the token directly before proceeding
      let tokenRefreshed = false;
      try {
        console.log('NewPostButton: Starting token refresh...');
        const refreshResponse = await authAPI.refreshToken();
        if (refreshResponse && refreshResponse.token) {
          // Store the fresh token
          const newToken = refreshResponse.token.replace(/^Bearer\s+/i, '').trim();
          localStorage.setItem('token', newToken);
          console.log('NewPostButton: Token successfully refreshed:', newToken.substring(0, 10) + '...');
          
          // Update user data if available in the response
          if (refreshResponse.id || refreshResponse._id) {
            const userData = {
              _id: refreshResponse.id || refreshResponse._id,
              username: refreshResponse.username,
              email: refreshResponse.email,
              displayName: refreshResponse.displayName,
              role: (refreshResponse.role || '').toLowerCase(),
              avatar: refreshResponse.avatar
            };
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('NewPostButton: Updated user data for', userData.username, 'with role', userData.role);
          }
          tokenRefreshed = true;
        }
      } catch (refreshError: any) {
        console.warn('NewPostButton: Token refresh attempt failed:', 
          refreshError.response?.status,
          refreshError.response?.data || refreshError.message
        );
      }
      
      // If token refresh failed, try second approach with axios directly
      if (!tokenRefreshed) {
        try {
          console.log('NewPostButton: Trying alternative token refresh...');
          const response = await axios.post(
            'http://localhost:8080/api/auth/refresh-token',
            {},
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (response.data && response.data.token) {
            const newToken = response.data.token.replace(/^Bearer\s+/i, '').trim();
            localStorage.setItem('token', newToken);
            console.log('NewPostButton: Direct token refresh successful:', newToken.substring(0, 10) + '...');
            tokenRefreshed = true;
          }
        } catch (directRefreshError) {
          console.error('NewPostButton: Alternative token refresh also failed', directRefreshError);
        }
      }
      
      console.log('NewPostButton: Creating category with data:', { 
        name: categoryName.trim(), 
        description: categoryDescription.trim(),
        slug: generatedSlug // Pass the generated slug
      });
      
      // Create category using the standard API method
      const newCategory = await categoriesAPI.createCategory({
        name: categoryName.trim(),
        description: categoryDescription.trim()
      });
      
      // Log every property to see what we're working with
      console.log('NewPostButton: Received category from server:', newCategory);
      for (const [key, value] of Object.entries(newCategory)) {
        console.log(`  ${key}: ${value}`);
      }
      
      // Ensure the category has the required properties
      if (!newCategory) {
        throw new Error('No category data returned from server');
      }
      
      // Ensure both ID properties exist (id from Spring, _id for frontend)
      const categoryId = newCategory.id || newCategory._id;
      if (!categoryId) {
        throw new Error('Category ID is missing');
      }
      
      // Use the server returned slug or fall back to our generated one
      const categorySlug = newCategory.slug || generatedSlug;
      if (!categorySlug) {
        throw new Error('Category slug is missing');
      }
      
      console.log(`NewPostButton: Successfully created category '${newCategory.name}' with ID: ${categoryId}, slug: ${categorySlug}`);
      
      // Reset form and go back to category selection
      setCategoryName('');
      setCategoryDescription('');
      setShowCreateCategory(false);
      
      // Create a normalized category with required fields for the UI
      const normalizedCategory: Category = {
        _id: categoryId,
        id: categoryId,
        name: newCategory.name,
        description: newCategory.description,
        slug: categorySlug,
        createdAt: newCategory.createdAt || new Date().toISOString(),
        updatedAt: newCategory.updatedAt || new Date().toISOString(),
        isActive: newCategory.isActive !== false // Default to true if not specified
      };
      
      // First add to categories list immediately
      setCategories(prevCategories => {
        const exists = prevCategories.some(cat => 
          cat._id === categoryId || cat.id === categoryId || cat.slug === categorySlug
        );
        
        if (!exists) {
          console.log('NewPostButton: Adding new category to list:', normalizedCategory);
          return [...prevCategories, normalizedCategory];
        }
        return prevCategories;
      });
      
      // Set selection with a small delay to ensure state has updated
      setTimeout(() => {
        console.log('NewPostButton: Setting selection to:', categorySlug);
        setSelectedCategory(categorySlug);
      }, 50);
      
      // Then refresh the list from server to be sure
      try {
        console.log('NewPostButton: Refreshing categories from server');
        const updatedCategories = await categoriesAPI.getAllCategories();
        
        // Update the categories list
        setCategories(updatedCategories);
        
        // Ensure our category is selected even after refresh
        setTimeout(() => {
          console.log('NewPostButton: Resetting selection after server refresh');
          setSelectedCategory(categorySlug);
        }, 100); // Increased to 100ms for more reliability
      } catch (fetchError) {
        console.error('NewPostButton: Failed to refresh categories, continuing with added category', fetchError);
        // It's ok, we already added the category locally
      }
    } catch (error: any) {
      console.error('NewPostButton: Failed to create category:', 
        error.response?.status,
        error.response?.data || error.message
      );
      
      // Better error message for duplicate slug
      if (error.response?.data?.message?.includes('slug') && error.response?.data?.message?.includes('exists')) {
        setError('A category with this name already exists. Please choose a different name.');
        return;
      }
      
      // Special handling for auth errors
      if (error.response?.status === 401 || error.message?.includes('session') || error.message?.includes('log in')) {
        setError('Your session has expired. Please refresh the page or log out and log in again to refresh your credentials.');
        return;
      }
      
      // Extract the most useful error message
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to create category. Please try again.';
      setError(errorMessage);
    } finally {
      setIsCreatingCategory(false);
    }
  };
  
  // Update isAdmin to include teacher role for category creation more consistently
  const userRole = roleUtils.normalizeRole(user?.role);
  const canManageCategories = roleUtils.hasAtLeastSamePrivilegesAs(userRole, Role.TEACHER);
  
  return (
    <>
      <Button
        onClick={handleOpenDialog}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 p-0 z-40"
      >
        <Plus className="h-6 w-6" />
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {showCreateCategory ? (
            <>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>
                  Add a new category for discussion topics
                </DialogDescription>
              </DialogHeader>
              
              {error && (
                <AlertComponent variant="destructive" className="my-2">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </AlertComponent>
              )}
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter className="flex justify-between sm:justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateCategory(false)}
                  disabled={isCreatingCategory}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleCreateCategory}
                  disabled={!categoryName.trim() || !categoryDescription.trim() || isCreatingCategory}
                >
                  {isCreatingCategory ? 'Creating...' : 'Create Category'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Create a New Topic</DialogTitle>
                <DialogDescription>
                  Choose a category to start a new discussion
                </DialogDescription>
              </DialogHeader>
              
              {error && (
                <AlertComponent variant="destructive" className="my-2">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </AlertComponent>
              )}
              
              <div className="grid gap-4 py-4">
                {categories.length === 0 && !isLoading ? (
                  <div className="text-center py-4">
                    <FolderPlus className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-2">No Categories Available</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {canManageCategories 
                        ? "There are no categories yet. Create one to get started."
                        : "There are no categories available yet."}
                    </p>
                    {canManageCategories ? (
                      <Button onClick={() => setShowCreateCategory(true)}>
                        Create First Category
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Please contact an administrator to create categories.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Select 
                        onValueChange={setSelectedCategory} 
                        defaultValue={selectedCategory}
                        value={selectedCategory}
                      >
                        <SelectTrigger className="w-full flex-grow">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => {
                            // Debug log for troubleshooting
                            if (!category.slug) {
                              console.warn('Category missing slug:', category);
                            }
                            return (
                              <SelectItem 
                                key={category._id || category.id} 
                                value={category.slug}
                              >
                                {category.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      
                      <div className="relative flex items-center group">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-64 rounded-md shadow-md bg-popover border p-3 text-xs hidden group-hover:block z-50">
                          <p>Can't find a suitable category? Please contact an admin or teacher to request a new category.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className={categories.length > 0 ? "" : "flex justify-between sm:justify-between"}>
                {categories.length > 0 ? (
                  <Button onClick={handleCreateTopic} disabled={!selectedCategory}>
                    Continue
                  </Button>
                ) : (
                  canManageCategories && (
                    <Button 
                      variant="outline" 
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                  )
                )}
                
                {categories.length > 0 && canManageCategories && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateCategory(true)}
                    className="mr-auto"
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Category
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 