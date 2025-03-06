import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { categoriesAPI, topicsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Search, MessageSquare, PlusCircle, ArrowLeft, Clock, User } from 'lucide-react';

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
        const topicsData = await topicsAPI.getTopicsByCategory(categoryData._id);
        setTopics(topicsData);
      } catch (error) {
        console.error('Failed to fetch category details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryAndTopics();
  }, [slug]);

  const filteredTopics = topics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/categories">Categories</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {category.parent && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to={`/categories/${category.parent.slug}`}>
                {category.parent.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbLink>{category.name}</BreadcrumbLink>
        </BreadcrumbItem>
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
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
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
                  <Link to={`/topics/${topic.slug}`}>
                    <CardTitle className="text-xl hover:text-primary transition-colors">
                      {topic.title}
                    </CardTitle>
                  </Link>
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
    </div>
  );
} 