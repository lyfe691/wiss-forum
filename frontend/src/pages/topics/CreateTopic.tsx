import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { categoriesAPI, topicsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbList } from '@/components/ui/breadcrumb';
import { Send, FileText, Loader2, ChevronLeft, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { toast } from 'sonner';
interface Category {
  _id: string;
  name: string;
  description: string;
  slug: string;
  parent?: {
    _id: string;
    name: string;
    slug: string;
  };
}

export function CreateTopic() {
  const { categorySlug: slug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage] = useState('');
  const { isAuthenticated, user } = useAuth();
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Check if we have a category from the navigation state
  const categoryFromState = location.state?.selectedCategory as Category | undefined;

  // Add a console log for debugging
  useEffect(() => {
    console.log('CreateTopic component rendered');
    console.log('Current pathname:', location.pathname);
    console.log('Category slug from URL param:', slug);
    console.log('Category from navigation state:', categoryFromState);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
  }, [slug, categoryFromState, isAuthenticated, user, location.pathname]);

  useEffect(() => {
    const fetchAllCategories = async () => {
      setIsLoading(true);
      try {
        // Fetch all categories for the dropdown
        const categoriesData = await categoriesAPI.getAllCategories();
        console.log('All categories:', categoriesData);
        // Flatten the categories if needed
        const flattenedCategories = flattenCategories(categoriesData);
        setAllCategories(flattenedCategories);
        
        // If we have a category from navigation state, use it
        if (categoryFromState) {
          console.log('Using category from navigation state:', categoryFromState);
          setCategory(categoryFromState);
          setSelectedCategoryId(categoryFromState._id);
        }
        // Otherwise, if a slug is provided, try to find and select that category
        else if (slug) {
          console.log('Looking for category with slug:', slug);
          const matchingCategory = flattenedCategories.find(cat => cat.slug === slug);
          if (matchingCategory) {
            console.log('Found matching category by slug:', matchingCategory);
            setCategory(matchingCategory);
            setSelectedCategoryId(matchingCategory._id);
          } else {
            // Try finding by ID as a fallback
            const matchingCategoryById = flattenedCategories.find(cat => cat._id === slug);
            if (matchingCategoryById) {
              console.log('Found matching category by ID:', matchingCategoryById);
              setCategory(matchingCategoryById);
              setSelectedCategoryId(matchingCategoryById._id);
            } else {
              console.error('No matching category found for slug or ID:', slug);
              setError('Invalid category. Please select a category from the dropdown.');
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCategories();
  }, [slug, categoryFromState]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated && !isLoading) {
      navigate('/login', { state: { from: slug ? `/create-topic/${slug}` : '/create-topic' } });
    }
  }, [isAuthenticated, isLoading, navigate, slug]);

  // Helper function to flatten nested categories
  const flattenCategories = (categories: any[]): Category[] => {
    let result: Category[] = [];
    
    const processCategory = (category: any) => {
      result.push({
        _id: category._id,
        name: category.name,
        description: category.description || '',
        slug: category.slug,
        parent: category.parent
      });
      
      if (category.subcategories && category.subcategories.length > 0) {
        category.subcategories.forEach(processCategory);
      }
    };
    
    categories.forEach(processCategory);
    return result;
  };

  const handleCategoryChange = (value: string) => {
    // First try to find by ID
    let selectedCategory = allCategories.find(cat => cat._id === value);
    
    // If not found, try to find by slug (in case we're receiving a slug from NewPostButton)
    if (!selectedCategory) {
      selectedCategory = allCategories.find(cat => cat.slug === value);
    }
    
    if (selectedCategory) {
      setSelectedCategoryId(selectedCategory._id);
      setCategory(selectedCategory);
    } else {
      console.error('Could not find category with ID or slug:', value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !selectedCategoryId) {
      setError('Please fill in all fields and select a category');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await topicsAPI.createTopic({
        title,
        content,
        categoryId: selectedCategoryId
      });
      
      // Extract topic information
      const newTopic = response.topic || response;
      
      console.log('Topic created successfully:', newTopic);
      
      // Show success message
      toast.success('Topic created successfully!');
      
      // Reset form
      setTitle('');
      setContent('');
      
      // Make sure we have a valid identifier before redirecting
      if (newTopic) {
        // Check for a valid slug first
        if (newTopic.slug && newTopic.slug !== 'null' && newTopic.slug !== 'undefined') {
          console.log('Using topic slug for navigation:', newTopic.slug);
          navigate(`/topics/${newTopic.slug}`);
        } 
        // Otherwise use ID
        else if (newTopic._id || newTopic.id) {
          const topicId = newTopic._id || newTopic.id;
          console.log('Using topic ID for navigation:', topicId);
          navigate(`/topics/${topicId}`);
        }
        // Last resort, just go to the topics page
        else {
          console.warn('No valid slug or ID found, redirecting to topics list');
          toast.info('Topic created, but redirecting to topics list');
          navigate('/topics/latest');
        }
      } else {
        console.warn('No topic data returned, redirecting to topics list');
        navigate('/topics/latest');
      }

    } catch (error) {
      console.error('Failed to create topic:', error);
      setError('Failed to create topic. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="border rounded-lg shadow-sm">
          <div className="p-6 pb-2">
            <Skeleton className="h-7 w-full max-w-md mb-2" />
            <Skeleton className="h-4 w-full max-w-sm" />
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
          <div className="p-6">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link 
                to="/" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link 
                to="/topics/latest" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Latest Topics
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="font-medium text-foreground">
              New Topic
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <h1 className="text-3xl font-bold tracking-tight mb-6 flex items-center gap-2">
        <FileText className="h-7 w-7 text-primary" />
        Create New Topic
      </h1>
      
      <div className="border rounded-lg shadow-sm mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Topic</CardTitle>
            <CardDescription>
              Start a new discussion in our community
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {successMessage && (
                <Alert className="mb-4" variant="success">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base">
                  Category <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Select 
                    value={selectedCategoryId} 
                    onValueChange={handleCategoryChange}
                    defaultValue={selectedCategoryId}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select a category">
                        {category ? category.name : "Select a category"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
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
              
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">
                  Topic Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <MarkdownEditor
                  label="Content"
                  required
                  value={content}
                  onChange={setContent}
                  placeholder="Write your topic content here..."
                  height={300}
                  showFileUpload={true}
                  maxFiles={5}
                  maxFileSize={5 * 1024 * 1024} // 5MB
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)} // jst go back to the previous page
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !title.trim() || !content.trim() || !selectedCategoryId}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Create Topic
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
} 