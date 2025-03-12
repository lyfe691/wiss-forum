import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { topicsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  ArrowRight, 
  Eye, 
  Tag,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Pagination } from '../../components/ui/pagination';

interface Author {
  _id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  role: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
}

interface Topic {
  _id: string;
  title: string;
  content: string;
  slug: string;
  authorId: string;
  categoryId: string;
  tags: string[];
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  author?: Author;
  category?: Category;
}

export function LatestTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTopics: 0,
    hasMore: false
  });

  useEffect(() => {
    const fetchLatestTopics = async () => {
      setIsLoading(true);
      try {
        const data = await topicsAPI.getLatestTopics(pagination.currentPage);
        setTopics(data.topics);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Failed to fetch latest topics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestTopics();
  }, [pagination.currentPage]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Latest Topics</h1>
          <p className="text-muted-foreground">Browse the most recent discussions</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="border shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent className="pb-3">
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : topics.length === 0 ? (
        <Card className="border shadow-sm text-center p-8">
          <h3 className="text-xl font-semibold mb-2">No topics found</h3>
          <p className="text-muted-foreground mb-4">Be the first to start a discussion!</p>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {topics.map((topic) => (
              <Card key={topic._id} className="border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="hover:text-primary transition-colors">
                        <Link to={`/topics/${topic.slug}`} className="flex items-start">
                          {topic.isPinned && (
                            <Badge variant="outline" className="mr-2 bg-primary/5 text-primary border-primary/20 whitespace-nowrap">
                              Pinned
                            </Badge>
                          )}
                          <span>{topic.title}</span>
                        </Link>
                      </CardTitle>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                        {topic.category && (
                          <Link to={`/categories/${topic.category.slug}`}>
                            <Badge variant="secondary" className="hover:bg-secondary/80">
                              {topic.category.name}
                            </Badge>
                          </Link>
                        )}
                        
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}
                        </div>
                        
                        <div className="flex items-center">
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          {topic.viewCount} views
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <CardDescription className="line-clamp-2">
                    {topic.content.replace(/<[^>]*>?/gm, '')}
                  </CardDescription>
                  
                  {topic.tags && topic.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      {topic.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="bg-background text-xs px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="text-sm text-muted-foreground pt-0">
                  <div className="flex justify-between w-full">
                    <div className="flex items-center">
                      <User className="h-3.5 w-3.5 mr-1.5" />
                      {topic.author ? topic.author.displayName || topic.author.username : 'Unknown user'}
                    </div>
                    
                    <Link to={`/topics/${topic.slug}`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 hover:bg-primary/5 hover:text-primary">
                        View Topic
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
} 