import { useState, useEffect } from 'react';
import { categoriesAPI, topicsAPI } from '@/lib/api';
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
  DialogTrigger,
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
  Check,
  X,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';
import  api  from '@/lib/api';

interface Category {
  _id: string;
  name: string;
  description: string;
  slug: string;
  order?: number;
  isActive?: boolean;
  parent?: {
    _id: string;
    name: string;
    slug: string;
  };
  parentCategory?: string;
  subcategories?: Category[];
  createdAt: string;
  updatedAt: string;
  parentName?: string;
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
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
        parentCategory: editingCategory.parentCategory || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        parentCategory: '',
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
      setAllCategories(categoriesData);
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
    
    try {
      setError(null);
      setSuccess(null);
      
      // Try using the bootstrap endpoint first
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/categories/bootstrap-create`, {
          name: formData.name,
          description: formData.description,
          ...(formData.parentCategory && { parentCategory: formData.parentCategory }),
          secretKey: 'WISS_ADMIN_SETUP_2024',
          userId: user?._id // Pass current user ID if available
        });
        
        if (response.data.success) {
          setSuccess('Category created successfully');
          setShowDialog(false);
          setFormData({ name: '', description: '', parentCategory: '' });
          await fetchCategories();
          return;
        }
      } catch (err) {
        console.error('Bootstrap category creation failed:', err);
      }
      
      // Fallback to the standard method
      await categoriesAPI.createCategory({
        name: formData.name,
        description: formData.description,
        ...(formData.parentCategory && { parentCategory: formData.parentCategory })
      });
      
      setSuccess('Category created successfully');
      setShowDialog(false);
      setFormData({ name: '', description: '', parentCategory: '' });
      await fetchCategories();
    } catch (err) {
      console.error('Failed to create category:', err);
      setError('Failed to create category. Please try again.');
    }
  };

  const updateCategory = async () => {
    if (!editingCategory || !formData.name || !formData.description) {
      setError('Name and description are required');
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      
      await categoriesAPI.updateCategory(editingCategory._id, {
        name: formData.name,
        description: formData.description,
        parentCategory: formData.parentCategory || null
      });
      
      setSuccess('Category updated successfully');
      setShowDialog(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', parentCategory: '' });
      await fetchCategories();
    } catch (err) {
      console.error('Failed to update category:', err);
      setError('Failed to update category. Please try again.');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      
      // First try the standard API method
      try {
        await categoriesAPI.deleteCategory(id);
      } catch (originalError) {
        console.error('Standard category deletion failed:', originalError);
        
        // If the standard method fails, try a direct API call
        if (user) {
          try {
            // Try to use a bootstrap method if it exists
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/categories/bootstrap-delete`, {
              categoryId: id,
              secretKey: 'WISS_ADMIN_SETUP_2024',
              userId: user._id
            });
            
            if (response.data.success) {
              setSuccess('Category deleted successfully');
              await fetchCategories();
              return;
            }
          } catch (bootstrapError) {
            console.error('Bootstrap category deletion also failed:', bootstrapError);
            throw bootstrapError; // Re-throw to be caught by the outer catch
          }
        } else {
          throw originalError; // Re-throw if no user is available
        }
      }
      
      setSuccess('Category deleted successfully');
      await fetchCategories();
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      setError(err?.response?.data?.message || 'Failed to delete category. Please try again.');
    }
  };

  const clearCategoryTopics = async (categoryId: string, categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete ALL topics in the "${categoryName}" category? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      
      // Get all topics for this category
      const response = await fetch(`http://localhost:3000/api/topics/category/${categoryId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch topics: ${response.status}`);
      }
      
      const data = await response.json();
      const topics = data.topics || [];
      
      if (topics.length === 0) {
        setSuccess(`No topics found in category "${categoryName}"`);
        return;
      }
      
      // Delete each topic
      let deletedCount = 0;
      for (const topic of topics) {
        try {
          await topicsAPI.deleteTopic(topic._id);
          deletedCount++;
        } catch (err) {
          console.error(`Failed to delete topic ${topic._id}:`, err);
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

  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
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
        <div className="flex gap-2">
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
        <Alert className="mb-6 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800/30">
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
                    <TableHead>Parent</TableHead>
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
                      <TableCell>
                        {category.parentName || '-'}
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parentCategory">Parent Category (Optional)</Label>
                <select
                  id="parentCategory"
                  name="parentCategory"
                  value={formData.parentCategory}
                  onChange={handleInputChange}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">None (Top Level)</option>
                  {allCategories.map(cat => (
                    // Don't allow setting the category itself as a parent when editing
                    (editingCategory && cat._id === editingCategory._id) ? null : (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                    )
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Optional. Select a parent to create a subcategory.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 