import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Calendar,
  MessageSquare,
  PlusCircle,
  RefreshCcw,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getAvatarUrl, getInitials, formatRoleName, getRoleBadgeColor } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { PaginationControls } from '@/components/PaginationControls';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { ContentActions } from '@/components/content/ContentActions';

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
  viewCount?: number;
  replyCount?: number;
  createdAt: string;
  updatedAt: string;
  author?: Author;
  category?: Category;
}

export function LatestTopics() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'mostReplies'>('latest');

  useEffect(() => {
    fetchTopics();
  }, [page, sortBy]);

  const fetchTopics = async () => {
    if (isRefreshing) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
    
    try {
      let data;
      if (sortBy === 'latest') {
        data = await topicsAPI.getLatestTopics(page);
      } else if (sortBy === 'popular') {
        data = await topicsAPI.getLatestTopics(page);
        data.topics = [...data.topics].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      } else {
        data = await topicsAPI.getLatestTopics(page);
        data.topics = [...data.topics].sort((a, b) => (b.replyCount || 0) - (a.replyCount || 0));
      }
      
      const topicsArray = Array.isArray(data.topics) ? data.topics : [];
      setTopics(topicsArray);
      
      setTotalPages(data.totalPages || 1);
      
      
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      setTopics([]);
      setTotalPages(1);
      
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTopics();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle topic edit
  const handleEditTopic = async (topic: any, newData: any) => {
    try {
      await topicsAPI.updateTopic(topic._id, {
        title: newData.title,
        content: newData.content,
        tags: newData.tags
      });
      
      // Refresh the topics list
      await fetchTopics();
    } catch (error) {
      console.error('Failed to update topic:', error);
      throw error;
    }
  };

  // Handle topic delete
  const handleDeleteTopic = async (topic: any) => {
    try {
      await topicsAPI.deleteTopic(topic._id);
      
      // Remove the topic from local state immediately for better UX
      setTopics(prevTopics => prevTopics.filter(t => t._id !== topic._id));
      
      // Optionally refresh the list to ensure consistency
      setTimeout(() => {
        fetchTopics();
      }, 500);
    } catch (error) {
      console.error('Failed to delete topic:', error);
      throw error;
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
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
            <BreadcrumbLink className="font-medium text-foreground">
              Latest Topics
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Latest Topics</h1>
          <p className="text-muted-foreground mt-1">Browse the most recent discussions in our community</p>
        </div>
        <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 w-9 p-0" 
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
                >
                  <RefreshCcw className={cn(
                    "h-4 w-4",
                    isRefreshing && "animate-spin"
                  )} />
                  <span className="sr-only">Refresh</span>
                </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <Filter className="h-4 w-4" />
                <span>Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className={cn(sortBy === 'latest' && "bg-primary/10 font-medium")}
                onClick={() => setSortBy('latest')}
              >
                Latest
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={cn(sortBy === 'popular' && "bg-primary/10 font-medium")}
                onClick={() => setSortBy('popular')}
              >
                Most viewed
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={cn(sortBy === 'mostReplies' && "bg-primary/10 font-medium")}
                onClick={() => setSortBy('mostReplies')}
              >
                Most replies
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

                <Link to="/create-topic">
                  <Button className="gap-2" size="sm">
                    <PlusCircle className="h-4 w-4" />
                    <span>Create Topic</span>
                  </Button>
                </Link>
                  
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index}>
              <Card className="border shadow-sm">
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
            </div>
          ))}
        </div>
      ) : topics.length === 0 ? (
        <div>
          <Card className="border shadow-sm text-center p-8 bg-muted/20">
            <div className="flex flex-col items-center justify-center py-8">
              <MessageSquare className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No topics found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">Be the first to start a discussion in our community!</p>
              <Link to="/create-topic">
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Topic</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      ) : (
        <div>
          <div className="space-y-4">
            {topics.map((topic) => (
              <div key={topic._id}>
                <Link to={`/topics/${topic.slug}`} className="block group">
                  <Card 
                    className="border group-hover:border-primary/30 group-hover:shadow-md transition-all duration-200 overflow-hidden relative"
                  >
                    <CardHeader className="pb-3 pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {topic.title}
                            </CardTitle>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                            {topic.category && (
                              <div onClick={(e) => e.stopPropagation()} className="z-10">
                                <Link to={`/categories/${topic.category.slug}`} className="hover:opacity-80 transition-opacity">
                                  <Badge variant="secondary" className="px-2 py-0">
                                    {topic.category.name}
                                  </Badge>
                                </Link>
                              </div>
                            )}
                            
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/70" />
                              {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}
                            </div>
                            
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Eye className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/70" />
                              {topic.viewCount || 0} {(topic.viewCount || 0) === 1 ? 'view' : 'views'}
                            </div>

                            <div className="flex items-center text-xs text-muted-foreground">
                              <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/70" />
                              {topic.replyCount || 0} {(topic.replyCount || 0) === 1 ? 'reply' : 'replies'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Content Actions */}
                        {topic.author && (
                          <ContentActions
                            content={{
                              _id: topic._id,
                              author: topic.author,
                              createdAt: topic.createdAt,
                              updatedAt: topic.updatedAt
                            }}
                            contentType="topic"
                            onEdit={handleEditTopic}
                            onDelete={handleDeleteTopic}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-3">
                      <CardDescription className="line-clamp-2 text-sm">
                        {topic.content.replace(/<[^>]*>?/gm, '')}
                      </CardDescription>
                      
                      {topic.tags && topic.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          <Tag className="h-3.5 w-3.5 text-muted-foreground/70" />
                          {topic.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-muted/30 border-muted/50 text-xs px-1.5 py-0 hover:bg-muted/50">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="pt-0 pb-4 border-t border-border/50 mt-2">
                      <div className="flex justify-between w-full">
                        <div className="flex items-center gap-2">
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
                                    src={getAvatarUrl(topic.author._id, topic.author.avatar)} 
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
                        </div>
                        
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
          
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                maxVisible={5}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 