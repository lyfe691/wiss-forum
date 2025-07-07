import { useState, useEffect } from 'react';
import { categoriesAPI, topicsAPI, authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FolderKanban,
  Plus,
  MoreHorizontal, 
  Pencil, 
  Trash, 
  FolderTree,
  SearchIcon,
  ArrowLeft,
  ShieldCheck,
  MessageSquare, 
  CheckCircle2
} from 'lucide-react';

import { Role, roleUtils } from '@/lib/types';

interface Category {
  _id: string;
  id?: string;
  name: string;
  description: string;
  slug: string;
  order?: number;
  isActive?: boolean;
  subcategories?: Category[];
  createdAt: string;
  updatedAt: string;
  parentName?: string;
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description,
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [editingCategory]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const categoriesData = await categoriesAPI.getAllCategories();
      
      // Flatten the categories structure for the table view
      const flattened = flattenCategories(categoriesData);
      setCategories(flattened);
      
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Unable to load categories. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const flattenCategories = (categories: Category[], parentName: string = ''): Category[] => {
    let result: Category[] = [];
    
    categories.forEach(category => {
      const categoryWithParentName = {
        ...category,
        parentName
      };
      
      result.push(categoryWithParentName);
      
      if (category.subcategories && category.subcategories.length > 0) {
        const flattened = flattenCategories(category.subcategories, category.name);
        result = [...result, ...flattened];
      }
    });
    
    return result;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createCategory = async () => {
    if (!formData.name || !formData.description) {
      setError('Name and description are required');
      return;
    }
    
    // Check if user is authenticated
    if (!user) {
      setError('Authentication required to create a category');
      return;
    }
    
    // Check permissions using roleUtils
    const userRole = roleUtils.normalizeRole(user.role);
    if (!roleUtils.hasAtLeastSamePrivilegesAs(userRole, Role.TEACHER)) {
      setError('You do not have permission to create categories');
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      
      // Generate a slug manually to handle any backend issues
      const generatedSlug = formData.name.trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with a single one
        .trim();                  // Trim any leading/trailing spaces or hyphens
      
      console.log('CategoryManagement: Generated slug locally:', generatedSlug);
      
      // First try to refresh auth token directly
      let tokenRefreshed = false;
      try {
        console.log('CategoryManagement: Starting token refresh...');
        const refreshResponse = await authAPI.refreshToken();
        if (refreshResponse && refreshResponse.token) {
          // Store the fresh token
          const newToken = refreshResponse.token.replace(/^Bearer\s+/i, '').trim();
          localStorage.setItem('token', newToken);
          console.log('CategoryManagement: Token successfully refreshed:', newToken.substring(0, 10) + '...');
          
          // Update user data if available in the response
          console.log('CategoryManagement: Token refresh successful');
          tokenRefreshed = true;
        }
      } catch (refreshError: any) {
        console.warn('CategoryManagement: Token refresh attempt failed:', 
          refreshError.response?.status,
          refreshError.response?.data || refreshError.message
        );
      }
      
      // If token refresh failed, try alternative approach using the centralized API
      if (!tokenRefreshed) {
        try {
          console.log('CategoryManagement: Trying alternative token refresh...');
          const response = await authAPI.refreshToken();
          
          if (response && response.token) {
            const newToken = response.token.replace(/^Bearer\s+/i, '').trim();
            localStorage.setItem('token', newToken);
            console.log('CategoryManagement: Alternative token refresh successful:', newToken.substring(0, 10) + '...');
            tokenRefreshed = true;
          }
        } catch (directRefreshError) {
          console.error('CategoryManagement: Alternative token refresh also failed', directRefreshError);
        }
      }
      
      console.log('CategoryManagement: Creating category with data including slug:', {
        ...formData,
        slug: generatedSlug
      });
      
      // Use the standard method for creating categories
      const result = await categoriesAPI.createCategory({
        name: formData.name,
        description: formData.description,
      });
      
      // Log complete result for debugging
      console.log('CategoryManagement: Raw category result:', result);
      
      // Verify the result has the expected properties
      if (!result) {
        console.error('CategoryManagement: No category data returned');
        throw new Error('Server returned no category data');
      }
      
      // Check for ID (Spring uses 'id', we need both 'id' and '_id')
      const categoryId = result.id || result._id;
      if (!categoryId) {
        console.error('CategoryManagement: Invalid category data returned - no ID field:', result);
        throw new Error('Server returned category without ID');
      }
      
      // Ensure we have a valid slug
      const categorySlug = result.slug || generatedSlug;
      
      console.log('CategoryManagement: Category created successfully with ID:', categoryId, 'and slug:', categorySlug);
      
      setSuccess('Category created successfully');
      setShowDialog(false);
      setFormData({ name: '', description: '' });
      await fetchCategories();
    } catch (err: any) {
      console.error('CategoryManagement: Failed to create category:', 
        err.response?.status,
        err.response?.data || err.message
      );
      
      // Better error message for duplicate slug
      if (err.response?.data?.message?.includes('slug') && err.response?.data?.message?.includes('exists')) {
        setError('A category with this name already exists. Please choose a different name.');
        return;
      }
      
      // Special handling for auth errors
      if (err.response?.status === 401 || err.message?.includes('session') || err.message?.includes('expired')) {
        // Don't logout, just show a helpful message
        setError('Your session has expired. Please refresh the page and try again, or log out and back in.');
        return;
      }
      
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to create category. Please try again.';
      setError(errorMessage);
    }
  };

  const updateCategory = async () => {
    if (!editingCategory || !formData.name || !formData.description) {
      setError('Name and description are required');
      return;
    }
    
    // Check if user is authenticated
    if (!user) {
      setError('Authentication required to update a category');
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      
      await categoriesAPI.updateCategory(editingCategory._id, {
        name: formData.name,
        description: formData.description,
      });
      
      setSuccess('Category updated successfully');
      setShowDialog(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      await fetchCategories();
    } catch (err: any) {
      console.error('Failed to update category:', err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to update category. Please try again.';
      setError(errorMessage);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      
      // Use standard API method
      await categoriesAPI.deleteCategory(id);
      
      setSuccess('Category deleted successfully');
      await fetchCategories();
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      
      // Provide a clear error message based on the response
      let errorMessage = 'Failed to delete category.';
      
      if (err?.response?.status === 400 && err?.response?.data?.message) {
        if (err.response.data.message.includes('topics')) {
          errorMessage = 'This category contains topics and cannot be deleted. Please use the "Clear All Topics" option first or move the topics to another category.';
        } else {
          errorMessage = err.response.data.message;
        }
      } else if (err?.response?.status === 403) {
        errorMessage = "You don't have permission to delete this category.";
      } else if (err?.response?.status === 500) {
        errorMessage = "This category likely contains topics and cannot be deleted. Please use the \"Clear All Topics\" option first.";
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const clearCategoryTopics = async (categoryId: string, categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete ALL topics in the "${categoryName}" category? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      
      // Get all topics for this category using the proper API
      const topics = await topicsAPI.getTopicsByCategory(categoryId);
      
      if (!topics || topics.length === 0) {
        setSuccess(`No topics found in category "${categoryName}"`);
        return;
      }
      
      // Log the topics for debugging
      console.log('Topics to delete:', topics);
      
      // Delete each topic - make sure to handle both id and _id fields
      let deletedCount = 0;
      for (const topic of topics) {
        try {
          // Use a normalized ID (either id or _id)
          const topicId = topic._id || topic.id;
          
          if (!topicId) {
            console.error('Topic has no ID:', topic);
            continue;
          }
          
          console.log(`Deleting topic with ID: ${topicId}`);
          await topicsAPI.deleteTopic(topicId);
          deletedCount++;
        } catch (err) {
          console.error(`Failed to delete topic ${topic._id || topic.id}:`, err);
        }
      }
      
      setSuccess(`Successfully deleted ${deletedCount} topics from category "${categoryName}"`);
      
      // Refresh categories (for updated topic counts)
      await fetchCategories();
      
    } catch (err: any) {
      console.error('Failed to clear category topics:', err);
      setError(err?.message || 'Failed to clear topics. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory();
    } else {
      createCategory();
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setShowDialog(true);
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    setShowDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredCategories = categories.filter(category => {
    const searchLower = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(searchLower) ||
      category.description.toLowerCase().includes(searchLower) ||
      (category.parentName && category.parentName.toLowerCase().includes(searchLower))
    );
  });

  const userRole = user ? roleUtils.normalizeRole(user.role) : null;
  const hasManageAccess = userRole === Role.ADMIN || userRole === Role.TEACHER;

  if (!user || !hasManageAccess) {
    return (
      <div className="container mx-auto py-10 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShieldCheck className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
            <p>This area is restricted to administrators and teachers only.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-muted-foreground">
            Organize and structure forum categories
          </p>
        </div>
        <div className="flex gap-2 sm:flex-row flex-col sm:shrink-0">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Category Search</CardTitle>
          <CardDescription>
            Find categories by name or description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Category List</CardTitle>
          <CardDescription>
            {filteredCategories.length} categories found
            {searchQuery && ` for "${searchQuery}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <p>No categories found</p>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search query
                </p>
              )}
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Category
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">{category.slug}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {category.description}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(category.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FolderTree className="mr-2 h-4 w-4" />
                              <Link to={`/categories/${category.slug}`}>View Category</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(category)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => clearCategoryTopics(category._id, category.name)}
                              className="text-amber-600 focus:text-amber-500"
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Clear All Topics
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteCategory(category._id)} className="text-red-600 focus:text-red-500">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Update the details of an existing category'
                : 'Add a new category to organize forum topics'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Mathematics"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Briefly describe what this category is about"
                  rows={3}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {editingCategory ? 'Saving...' : 'Creating...'}
                  </div>
                ) : (
                  editingCategory ? 'Save Changes' : 'Create Category'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 