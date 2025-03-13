import { Plus, FolderPlus, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
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
import { categoriesAPI } from '@/lib/api';
import axios from 'axios';

export function NewPostButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
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
    setIsOpen(false);
    navigate(`/categories/${selectedCategory}/create-topic`);
  };
  
  const handleCreateCategory = async () => {
    if (!categoryName.trim() || !categoryDescription.trim()) return;
    
    try {
      setIsCreatingCategory(true);
      setError('');
      
      // Try using the bootstrap endpoint first
      try {
        const response = await axios.post('http://localhost:3000/api/categories/bootstrap-create', {
          name: categoryName.trim(),
          description: categoryDescription.trim(),
          secretKey: 'WISS_ADMIN_SETUP_2024',
          userId: user?._id // Pass current user ID if available
        });
        
        if (response.data.success) {
          // Reset form and go back to category selection
          setCategoryName('');
          setCategoryDescription('');
          setShowCreateCategory(false);
          
          // Refresh categories and select the new one
          const updatedCategories = await categoriesAPI.getAllCategories();
          setCategories(updatedCategories);
          setSelectedCategory(response.data.category.slug);
          return;
        }
      } catch (bootstrapError: any) {
        console.error('Bootstrap category creation failed:', bootstrapError);
        // If bootstrap method failed, try the normal method
      }
      
      // Fall back to the standard method
      const newCategory = await categoriesAPI.createCategory({
        name: categoryName.trim(),
        description: categoryDescription.trim()
      });
      
      // Reset form and go back to category selection
      setCategoryName('');
      setCategoryDescription('');
      setShowCreateCategory(false);
      
      // Refresh categories and select the new one
      const updatedCategories = await categoriesAPI.getAllCategories();
      setCategories(updatedCategories);
      setSelectedCategory(newCategory.slug);
    } catch (error) {
      console.error('Failed to create category:', error);
      setError('Failed to create category. Please try again.');
    } finally {
      setIsCreatingCategory(false);
    }
  };
  
  const isAdmin = user?.role === 'admin';
  
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
                      {isAdmin 
                        ? "There are no categories yet. Create one to get started."
                        : "There are no categories available yet."}
                    </p>
                    {isAdmin ? (
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
                    <Select 
                      onValueChange={setSelectedCategory} 
                      defaultValue={selectedCategory}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <DialogFooter className={categories.length > 0 ? "" : "flex justify-between sm:justify-between"}>
                {categories.length > 0 ? (
                  <Button onClick={handleCreateTopic} disabled={!selectedCategory}>
                    Continue
                  </Button>
                ) : (
                  isAdmin && (
                    <Button 
                      variant="outline" 
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                  )
                )}
                
                {categories.length > 0 && isAdmin && (
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