import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { categoriesAPI, topicsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, MessageSquare, PlusCircle, ArrowLeft, Clock, User, MoreVertical, Trash, Check, X } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  subcategories?: Category[];
}

interface Topic {
  _id: string;
  title: string;
  content: string;
  slug: string;
  author: {
    _id: string;
    username: string;
    displayName?: string;
  };
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
  postCount: number;
  lastPost?: {
    _id: string;
    createdAt: string;
    author: {
      _id: string;
      username: string;
      displayName?: string;
    };
  };
}

export function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'activity', 'popular'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchCategoryAndTopics = async () => {
      setIsLoading(true);
      try {
        if (!slug) return;
        
        // Fetch category details - using the correct method name
        const categoryData = await categoriesAPI.getCategoryByIdOrSlug(slug);
        setCategory(categoryData);
        
        // Fetch topics for the category
        try {
          console.log('Fetching topics for category:', categoryData._id);
          const topicsData = await topicsAPI.getTopicsByCategory(categoryData._id);
          console.log('Topics data received:', topicsData);
          
          if (Array.isArray(topicsData)) {
            setTopics(topicsData);
          } else if (topicsData && Array.isArray(topicsData.topics)) {
            setTopics(topicsData.topics);
          } else {
            console.warn('Unexpected topics data structure:', topicsData);
            setTopics([]);
          }
        } catch (topicsError) {
          console.error('Failed to fetch topics:', topicsError);
          setTopics([]);
        }
      } catch (error) {
        console.error('Failed to fetch category details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryAndTopics();
    
    // Add a call to refetch data when the component is focused
    const handleFocus = () => {
      fetchCategoryAndTopics();
    };
    
    // Add event listener for when the window regains focus
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [slug]);

  // Add a manual refresh button
  const refreshTopics = async () => {
    if (!category) return;
    
    try {
      setIsLoading(true);
      const topicsData = await topicsAPI.getTopicsByCategory(category._id);
      console.log('Refreshed topics data:', topicsData);
      
      if (Array.isArray(topicsData)) {
        setTopics(topicsData);
      } else if (topicsData && Array.isArray(topicsData.topics)) {
        setTopics(topicsData.topics);
      } else {
        console.warn('Unexpected topics data structure during refresh:', topicsData);
        setTopics([]);
      }
    } catch (error) {
      console.error('Failed to refresh topics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTopics = Array.isArray(topics) ? topics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'activity') {
      const aActivity = b.lastPost ? new Date(b.lastPost.createdAt).getTime() : new Date(b.createdAt).getTime();
      const bActivity = a.lastPost ? new Date(a.lastPost.createdAt).getTime() : new Date(a.createdAt).getTime();
      return aActivity - bActivity;
    } else if (sortBy === 'popular') {
      return b.postCount - a.postCount;
    }
    return 0;
  });

  // Format date to relative time (like "2 days ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleDeleteTopic = async () => {
    if (!topicToDelete) return;
    
    try {
      setIsDeleting(true);
      setError(null);
      
      await topicsAPI.deleteTopic(topicToDelete._id);
      
      // Update local state
      setTopics(prevTopics => prevTopics.filter(topic => topic._id !== topicToDelete._id));
      
      setSuccess(`Topic "${topicToDelete.title}" deleted successfully`);
      setDeleteDialogOpen(false);
      setTopicToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete topic:', err);
      setError(err?.response?.data?.message || 'Failed to delete topic. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'teacher';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-4" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div>
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-6 w-full" />
        </div>
        <div className="flex justify-between mb-4">
          <Skeleton className="h-10 w-40" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        {[...Array(5)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-5 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Category Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested category could not be found.</p>
        <Button onClick={() => navigate('/categories')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/categories">Categories</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {category.parent && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/categories/${category.parent.slug}`}>
                    {category.parent.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbLink>{category.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Category Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{category.name}</h1>
        <p className="text-muted-foreground">{category.description}</p>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <X className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mt-4 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800/30">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Subcategories if any */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.subcategories.map((subcategory) => (
            <Link 
              key={subcategory._id} 
              to={`/categories/${subcategory.slug}`}
              className="block p-4 rounded-md border hover:bg-muted transition-colors"
            >
              <h3 className="font-medium">{subcategory.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {subcategory.description}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Topics Section */}
      <div>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold">Topics</h2>
          <div className="flex gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="activity">Recent Activity</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={refreshTopics} className="flex gap-1 items-center">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </Button>
            {isAuthenticated && (
              <Link to={`/categories/${category.slug}/create-topic`}>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Topic
                </Button>
              </Link>
            )}
          </div>
        </div>

        {sortedTopics.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Topics Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "No topics match your search criteria." 
                : "Be the first to start a discussion in this category!"}
            </p>
            {isAuthenticated && !searchQuery && (
              <Link to={`/categories/${category.slug}/create-topic`}>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create the First Topic
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTopics.map((topic) => (
              <Card key={topic._id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Link to={`/topics/${topic.slug}`}>
                      <CardTitle className="text-xl hover:text-primary transition-colors">
                        {topic.title}
                      </CardTitle>
                    </Link>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">More</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => {
                              setTopicToDelete(topic);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Topic
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="line-clamp-2 text-muted-foreground">
                    {topic.content.replace(/<[^>]*>/g, '')}
                  </p>
                </CardContent>
                <CardFooter className="pt-2 text-sm text-muted-foreground flex flex-wrap justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{topic.author.displayName || topic.author.username}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatRelativeTime(topic.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="secondary" className="mr-2">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {topic.postCount} {topic.postCount === 1 ? 'reply' : 'replies'}
                    </Badge>
                    {topic.lastPost && (
                      <span className="text-xs">
                        Last reply {formatRelativeTime(topic.lastPost.createdAt)}
                      </span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Topic Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this topic? This action cannot be undone and will remove all posts within this topic.
              {topicToDelete && (
                <div className="mt-2 p-2 bg-muted rounded-md">
                  <p className="font-medium">{topicToDelete.title}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteTopic();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 