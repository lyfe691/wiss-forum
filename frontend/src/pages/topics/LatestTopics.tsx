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
  Calendar,
  MessageSquare,
  Pin,
  Lock,
  PlusCircle,
  RefreshCcw,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Pagination } from '@/components/ui/pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  replyCount?: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  author?: Author;
  category?: Category;
}

const MotionCard = motion(Card);

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function LatestTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTopics: 0,
    hasMore: false
  });
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'mostReplies'>('latest');

  useEffect(() => {
    fetchTopics();
  }, [pagination.currentPage, sortBy]);

  const fetchTopics = async () => {
    if (isRefreshing) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
    
    try {
      let data;
      if (sortBy === 'latest') {
        data = await topicsAPI.getLatestTopics(pagination.currentPage);
      } else if (sortBy === 'popular') {
        // We need to implement this sorting on the frontend since the API doesn't support it
        data = await topicsAPI.getLatestTopics(pagination.currentPage);
        data.topics = [...data.topics].sort((a, b) => b.viewCount - a.viewCount);
      } else {
        // We need to implement this sorting on the frontend since the API doesn't support it
        data = await topicsAPI.getLatestTopics(pagination.currentPage);
        data.topics = [...data.topics].sort((a, b) => (b.replyCount || 0) - (a.replyCount || 0));
      }
      
      setTopics(data.topics);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTopics();
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Latest Topics</h1>
          <p className="text-muted-foreground mt-1">Browse the most recent discussions in our community</p>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh topics</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
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
          
          <Link to="/categories">
            <Button className="gap-2" size="sm">
              <PlusCircle className="h-4 w-4" />
              <span>Create Topic</span>
            </Button>
          </Link>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            className="space-y-4"
            variants={container}
            initial="hidden"
            animate="show"
            key="loading"
          >
            {[...Array(5)].map((_, index) => (
              <motion.div key={index} variants={item}>
                <MotionCard className="border shadow-sm">
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
                </MotionCard>
              </motion.div>
            ))}
          </motion.div>
        ) : topics.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            key="empty"
          >
            <MotionCard className="border shadow-sm text-center p-8 bg-muted/20">
              <div className="flex flex-col items-center justify-center py-8">
                <MessageSquare className="h-16 w-16 text-muted-foreground/40 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No topics found</h3>
                <p className="text-muted-foreground mb-6 max-w-md">Be the first to start a discussion in our community!</p>
                <Link to="/categories">
                  <Button className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span>Create New Topic</span>
                  </Button>
                </Link>
              </div>
            </MotionCard>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="space-y-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {topics.map((topic, index) => (
                <motion.div key={topic._id} variants={item}>
                  <MotionCard 
                    whileHover={{ 
                      y: -2,
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)"
                    }}
                    className={cn(
                      "border hover:border-primary/20 transition-all duration-200 overflow-hidden",
                      topic.isPinned && "bg-primary/5 border-primary/10"
                    )}
                  >
                    <CardHeader className="pb-3 pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            {topic.isPinned && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Pin className="h-4 w-4 text-primary shrink-0 mt-1" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Pinned topic</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {topic.isLocked && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Locked topic</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <CardTitle className="text-lg hover:text-primary transition-colors">
                              <Link to={`/topics/${topic.slug}`} className="hover:underline">
                                {topic.title}
                              </Link>
                            </CardTitle>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                            {topic.category && (
                              <Link to={`/categories/${topic.category.slug}`} className="hover:opacity-80 transition-opacity">
                                <Badge variant="secondary" className="px-2 py-0">
                                  {topic.category.name}
                                </Badge>
                              </Link>
                            )}
                            
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/70" />
                              {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}
                            </div>
                            
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Eye className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/70" />
                              {topic.viewCount} {topic.viewCount === 1 ? 'view' : 'views'}
                            </div>

                            <div className="flex items-center text-xs text-muted-foreground">
                              <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/70" />
                              {topic.replyCount || 0} {(topic.replyCount || 0) === 1 ? 'reply' : 'replies'}
                            </div>
                          </div>
                        </div>
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
                    
                    <CardFooter className="pt-0 pb-4 border-t border-border/50 mt-2 pt-3">
                      <div className="flex justify-between w-full">
                        <div className="flex items-center gap-2">
                          {topic.author?.avatar ? (
                            <Avatar className="h-6 w-6 border border-border">
                              <AvatarImage src={topic.author.avatar} alt={topic.author.displayName || topic.author.username} />
                              <AvatarFallback className="text-xs">
                                {getInitials(topic.author.displayName || topic.author.username)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <User className="h-5 w-5 text-muted-foreground/70 mr-0.5" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {topic.author ? topic.author.displayName || topic.author.username : 'Unknown user'}
                          </span>
                        </div>
                        
                        <Link to={`/topics/${topic.slug}`}>
                          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 hover:bg-primary/10 hover:text-primary">
                            View Topic
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </CardFooter>
                  </MotionCard>
                </motion.div>
              ))}
            </motion.div>
            
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  maxVisible={5}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 