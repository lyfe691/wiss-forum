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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, MessageSquare, PlusCircle, ArrowLeft, Clock, User, Eye, ArrowRight } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getAvatarUrl, getInitials, formatRoleName, getRoleBadgeColor } from '@/lib/utils';

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
    role?: string;
  };
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
  postCount?: number;
  replyCount?: number;
  viewCount?: number;
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

// Define a type for the API response that might include a topics property
interface TopicsResponse {
  topics?: Topic[];
  [key: string]: any;
}

export function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'activity', 'popular'
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [success, setSuccess] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchCategoryAndTopics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!slug) {
          console.error('No slug provided in URL parameters');
          setCategory(null);
          setIsLoading(false);
          return;
        }
        
        // Fetch category details - using the correct method name
        try {
          console.log(`Fetching category with slug: ${slug}`);
          const categoryData = await categoriesAPI.getCategoryByIdOrSlug(slug);
          
          if (!categoryData || !categoryData._id) {
            console.error('Invalid category data received:', categoryData);
            setCategory(null);
            setIsLoading(false);
            return;
          }
          
          console.log('Category data received:', categoryData);
          setCategory(categoryData);
          
          // Fetch topics for the category
          try {
            console.log('Fetching topics for category:', categoryData._id);
            const topicsData = await topicsAPI.getTopicsByCategory(categoryData._id) as TopicsResponse | Topic[];
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
        } catch (categoryError) {
          console.error(`Failed to fetch category with slug "${slug}":`, categoryError);
          setCategory(null);
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
      const topicsData = await topicsAPI.getTopicsByCategory(category._id) as TopicsResponse | Topic[];
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
      setError('Failed to refresh topics');
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
      // Use replyCount if available, otherwise fall back to postCount
      const bCount = b.replyCount !== undefined ? b.replyCount : (b.postCount || 0);
      const aCount = a.replyCount !== undefined ? a.replyCount : (a.postCount || 0);
      return bCount - aCount;
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
    <div className="container mx-auto max-w-6xl p-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4" variant="success">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
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
      ) : !category ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Category Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested category could not be found.</p>
          <Button onClick={() => navigate('/categories')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
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
                    to="/categories" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Categories
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {category.parent && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link 
                        to={`/categories/${category.parent.slug}`} 
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {category.parent.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="font-medium text-foreground">
                  {category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          {/* Category Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>

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
                    <SelectItem value="popular">Most Replies</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={refreshTopics} className="flex gap-1 items-center">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </Button>
                {isAuthenticated && (
                  <Link to={`/create-topic/${category.slug}`}>
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
                  <Link to={`/create-topic/${category.slug}`}>
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
                  <div key={topic._id}>
                    <Link to={`/topics/${topic.slug}`} className="block group">
                      <Card className="border group-hover:border-primary/30 group-hover:shadow-md transition-all duration-200 overflow-hidden relative">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              {topic.title}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="line-clamp-2 text-muted-foreground">
                            {topic.content.replace(/<[^>]*>/g, '')}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-2 text-sm text-muted-foreground flex flex-wrap justify-between items-center">
                          <div className="flex items-center space-x-4">
                            {topic.author && (
                              <div onClick={(e) => e.stopPropagation()} className="z-10">
                                <Link 
                                  to={`/users/${topic.author.username}`} 
                                  className={cn(
                                    "flex items-center gap-2 rounded-md px-1.5 -ml-1.5 py-1",
                                    "hover:bg-muted/50 transition-colors"
                                  )}
                                >
                                  <Avatar className={cn(
                                    "h-7 w-7 border-2 border-background",
                                    "ring-1 ring-border transition-all"
                                  )}>
                                    <AvatarImage 
                                      src={getAvatarUrl(topic.author.username)} 
                                      alt={topic.author.displayName || topic.author.username} 
                                    />
                                    <AvatarFallback className="text-xs font-medium bg-primary/10">
                                      {getInitials(topic.author.displayName || topic.author.username)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium leading-tight">
                                      {topic.author.displayName || topic.author.username}
                                    </span>
                                    {topic.author.role && (
                                      <Badge
                                        className={cn(
                                          "px-1.5 py-0.5 text-xs font-normal w-fit mt-0.5",
                                          getRoleBadgeColor(topic.author.role)
                                        )}
                                      >
                                        {formatRoleName(topic.author.role)}
                                      </Badge>
                                    )}
                                  </div>
                                </Link>
                              </div>
                            )}
                            
                            {!topic.author && (
                              <div className="flex items-center gap-2">
                                <Avatar className={cn(
                                  "h-7 w-7 border-2 border-background",
                                  "ring-1 ring-border bg-muted"
                                )}>
                                  <AvatarFallback className="bg-muted">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  Unknown user
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{formatRelativeTime(topic.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {topic.replyCount !== undefined ? topic.replyCount : (topic.postCount || 0)} {(topic.replyCount !== undefined ? topic.replyCount : (topic.postCount || 0)) === 1 ? 'reply' : 'replies'}
                            </Badge>
                            {topic.viewCount !== undefined && (
                              <Badge variant="outline" className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {topic.viewCount} {topic.viewCount === 1 ? 'view' : 'views'}
                              </Badge>
                            )}
                            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 group-hover:bg-primary/10 group-hover:text-primary pointer-events-none">
                              View Topic
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 