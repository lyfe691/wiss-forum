import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { categoriesAPI, topicsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, Send, FileText, Loader2, ChevronLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';

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

const MotionCard = motion(Card);

export function CreateTopic() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchCategory = async () => {
      setIsLoading(true);
      try {
        if (!slug) return;
        
        // Fetch category details
        const categoryData = await categoriesAPI.getCategoryByIdOrSlug(slug);
        setCategory(categoryData);
      } catch (error) {
        console.error('Failed to fetch category details:', error);
        setError('Failed to load category. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated && !isLoading) {
      navigate('/login', { state: { from: `/categories/${slug}/create-topic` } });
    }
  }, [isAuthenticated, isLoading, navigate, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !category) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await topicsAPI.createTopic({
        title,
        content,
        categoryId: category._id
      });
      
      // Extract topic information
      const newTopic = response.topic || response;
      
      // Show success message
      setSuccessMessage('Topic created successfully!');
      
      // Reset form
      setTitle('');
      setContent('');
      
      // Redirect to the new topic after a short delay
      setTimeout(() => {
        navigate(`/topics/${newTopic.slug || newTopic._id}`);
      }, 1500);
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
        <MotionCard 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CardHeader>
            <Skeleton className="h-7 w-full max-w-md mb-2" />
            <Skeleton className="h-4 w-full max-w-sm" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </MotionCard>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
        <h2 className="text-2xl font-bold mb-3">Category Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          We couldn't find the category you're looking for.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link to="/categories">
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-8 text-sm">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
            Categories
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to={`/categories/${category.slug}`} className="text-muted-foreground hover:text-foreground transition-colors">
            {category.name}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink className="font-medium text-foreground">
            Create Topic
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <h1 className="text-3xl font-bold tracking-tight mb-6 flex items-center gap-2">
        <FileText className="h-7 w-7 text-primary" />
        Create New Topic
      </h1>
      
      <MotionCard 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CardHeader>
          <CardTitle>Post in {category.name}</CardTitle>
          <CardDescription>
            {category.description || "Start a new discussion in this category"}
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
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            
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
              <Label htmlFor="content" className="text-base">
                Content <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="Write your topic content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-64 resize-y"
                required
              />
              <p className="text-xs text-muted-foreground">
                Be descriptive and provide all relevant information. You can use basic formatting.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/categories/${category.slug}`)}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !title.trim() || !content.trim()}
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
      </MotionCard>
    </div>
  );
} 