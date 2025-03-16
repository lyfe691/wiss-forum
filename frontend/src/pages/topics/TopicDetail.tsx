import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { topicsAPI, postsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  AlertCircle, 
  ArrowLeft, 
  Edit, 
  Heart, 
  MessageSquare, 
  MoreVertical, 
  Reply, 
  Trash, 
  User,
  ChevronLeft,
  ChevronRight,
  Send,
  Lock,
  Pin,
  CalendarDays,
  Eye,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Author {
  _id: string;
  username: string;
  displayName?: string;
  role: string;
  avatar?: string;
}

interface Post {
  _id: string;
  content: string;
  author: Author;
  topic: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLiked: boolean;
}

interface Topic {
  _id: string;
  title: string;
  content: string;
  slug: string;
  author: Author;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  viewCount?: number;
  replyCount?: number;
  isPinned?: boolean;
  isLocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

const MotionCard = motion(Card);

export function TopicDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyToPostId, setReplyToPostId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [likeInProgress, setLikeInProgress] = useState<{[key: string]: boolean}>({});
  const { isAuthenticated, user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Early check for missing slug parameter
  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const fetchTopicAndPosts = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      try {
        console.log('Fetching topic with slug:', slug);
        // Fetch topic details
        const topicData = await topicsAPI.getTopicByIdOrSlug(slug);
        console.log('Topic data received:', topicData);
        
        // Check if we have a valid topic with an ID
        if (!topicData || !topicData._id) {
          console.error('Invalid topic data received:', topicData);
          throw new Error('Topic not found or invalid');
        }
        
        setTopic(topicData);
        
        try {
          console.log('Fetching posts for topic ID:', topicData._id);
          // Fetch posts for this topic with valid ID
          const postsData = await postsAPI.getPostsByTopic(topicData._id);
          console.log('Posts data received:', postsData);
          setPosts(postsData);
        } catch (postsError) {
          console.error('Failed to fetch posts:', postsError);
          // Set empty posts array instead of failing the entire component
          setPosts([]);
        }
      } catch (error) {
        console.error('Failed to fetch topic:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopicAndPosts();
  }, [slug]);

  const handleNewPost = async () => {
    if (!isAuthenticated || !topic || !newPostContent.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the new post
      const result = await postsAPI.createPost({
        content: newPostContent,
        topicId: topic._id,
        // If replying to a specific post, include that information
        ...(replyToPostId ? { replyTo: replyToPostId } : {})
      });
      
      // Add the new post to the list
      setPosts(prevPosts => [...prevPosts, result]);
      
      // Clear the text area and any reply state
      setNewPostContent('');
      setReplyToPostId(null);
      
      // Scroll to the bottom to see the new post
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!isAuthenticated) return;
    
    // Prevent multiple clicks
    if (likeInProgress[postId]) return;
    
    setLikeInProgress(prev => ({ ...prev, [postId]: true }));
    
    try {
      // Optimistic update - toggle the like state immediately in the UI
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            const newIsLiked = !post.isLiked;
            return {
              ...post,
              isLiked: newIsLiked,
              likes: post.likes + (newIsLiked ? 1 : -1)
            };
          }
          return post;
        })
      );
      
      // Make the API call to update the like on the server
      await postsAPI.toggleLike(postId);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert the optimistic update if there was an error
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            const revertedIsLiked = !post.isLiked;
            return {
              ...post,
              isLiked: revertedIsLiked,
              likes: post.likes + (revertedIsLiked ? 1 : -1)
            };
          }
          return post;
        })
      );
    } finally {
      // Allow liking again after a short delay
      setTimeout(() => {
        setLikeInProgress(prev => ({ ...prev, [postId]: false }));
      }, 500);
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      await postsAPI.deletePost(postToDelete);
      
      // Remove the deleted post from the list
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postToDelete));
      
      // Close the delete dialog
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Unknown date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'p');
    } catch (error) {
      return '';
    }
  };

  const getInitials = (name: string = 'User') => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Check if the current user can edit/delete a post
  const canManagePost = (postAuthorId: string = '') => {
    if (!isAuthenticated || !user) return false;
    
    // Admin can manage all posts
    if (user.role === 'admin') return true;
    
    // A user can manage their own posts
    return user._id === postAuthorId;
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-4" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div>
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-6 w-full" />
        </div>
        {[...Array(3)].map((_, index) => (
          <MotionCard 
            key={index} 
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-32" />
            </CardFooter>
          </MotionCard>
        ))}
      </div>
    );
  }

  if (!slug || !topic) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-bold mb-3">Topic Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          The requested topic could not be found or may have been removed.
        </p>
        <Button onClick={() => navigate('/categories')} size="lg" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Button>
      </div>
    );
  }

  // Update the allPosts declaration to ensure posts is always treated as an array and all data is valid
  const allPosts = topic ? [
    // First include the topic content as a post
    {
      _id: 'topic-content',
      content: topic.content || '',
      author: topic.author || {
        _id: 'unknown',
        username: 'unknown',
        role: 'user'
      },
      topic: topic._id,
      createdAt: topic.createdAt || new Date().toISOString(),
      updatedAt: topic.updatedAt || new Date().toISOString(),
      likes: 0,
      isLiked: false
    } as Post,
    // Then add all the actual posts with validation
    ...(Array.isArray(posts) ? posts.map(post => ({
      ...post,
      _id: post._id || `temp-${Math.random().toString(36).substring(2, 9)}`,
      content: post.content || '',
      // Ensure every post has valid author data
      author: post.author || {
        _id: 'unknown',
        username: 'unknown',
        role: 'user'
      },
      // Ensure other required fields have defaults
      topic: post.topic || topic._id,
      createdAt: post.createdAt || new Date().toISOString(),
      updatedAt: post.updatedAt || post.createdAt || new Date().toISOString(),
      likes: typeof post.likes === 'number' ? post.likes : 0,
      isLiked: !!post.isLiked
    })) : [])
  ] : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb className="text-sm">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/categories" className="text-muted-foreground hover:text-foreground transition-colors">Categories</BreadcrumbLink>
          </BreadcrumbItem>
          {topic?.category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} to={`/categories/${topic.category.slug || ''}`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {topic.category.name || 'Category'}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="font-medium text-foreground">
                  {topic.title || 'Topic'}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
        </Breadcrumb>
      </div>
      
      {/* Topic Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {topic.isPinned && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1">
                  <Pin className="h-3 w-3" />
                  <span>Pinned</span>
                </Badge>
              )}
              {topic.isLocked && (
                <Badge variant="outline" className="bg-muted text-muted-foreground gap-1">
                  <Lock className="h-3 w-3" />
                  <span>Locked</span>
                </Badge>
              )}
              {topic.category && (
                <Badge variant="secondary" className="hover:bg-secondary/80">
                  {topic.category.name}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">{topic.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={topic.author?.avatar} alt={topic.author?.displayName || topic.author?.username || 'Unknown'} />
                  <AvatarFallback className="text-xs">
                    {getInitials(topic.author?.displayName || topic.author?.username || 'U')}
                  </AvatarFallback>
                </Avatar>
                <span>{topic.author?.displayName || topic.author?.username || 'Unknown'}</span>
              </div>

              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-1.5 text-muted-foreground/70" />
                {formatDate(topic.createdAt)}
              </div>

              {topic.viewCount !== undefined && (
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1.5 text-muted-foreground/70" />
                  {topic.viewCount} {topic.viewCount === 1 ? 'view' : 'views'}
                </div>
              )}

              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1.5 text-muted-foreground/70" />
                {posts.length} {posts.length === 1 ? 'reply' : 'replies'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Posts */}
      <div className="space-y-6">
        {allPosts.map((post, index) => {
          // Generate a truly unique key for each post
          const uniqueKey = post._id === 'topic-content' 
            ? 'topic-content' 
            : `post-${post._id}-${index}`;
            
          return (
            <MotionCard 
              key={uniqueKey} 
              id={`post-${post._id}`} 
              className={cn(
                "border relative",
                index === 0 && "border-primary/20 bg-primary/5",
                post._id === replyToPostId && "ring-2 ring-primary/30"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border border-border rounded-full">
                    <AvatarImage src={post.author?.avatar} alt={post.author?.displayName || post.author?.username || 'Unknown'} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(post.author?.displayName || post.author?.username || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {post.author?.displayName || post.author?.username || 'Unknown user'}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="px-1.5 py-0 text-xs rounded-sm">
                        {post.author?.role?.charAt(0).toUpperCase() + post.author?.role?.slice(1) || 'User'}
                      </Badge>
                      <span>{formatDate(post.createdAt)} at {formatTime(post.createdAt)}</span>
                      {post.createdAt !== post.updatedAt && (
                        <span className="italic">(edited)</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {canManagePost(post.author?._id) && post._id !== 'topic-content' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="flex items-center cursor-pointer"
                        onClick={() => {
                          // Edit functionality could be implemented here
                          console.log('Edit post:', post._id);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="flex items-center text-destructive cursor-pointer hover:bg-destructive/10"
                        onClick={() => {
                          setPostToDelete(post._id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardHeader>
              
              <CardContent className="prose prose-sm max-w-none pb-3 text-foreground">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </CardContent>
              
              <CardFooter className="pt-3 border-t flex justify-between items-center">
                <div className="flex gap-2">
                  {post._id !== 'topic-content' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleLike(post._id)}
                            disabled={!isAuthenticated || likeInProgress[post._id]}
                            className={cn(
                              "h-8 px-2 gap-1.5",
                              post.isLiked && "text-red-500"
                            )}
                          >
                            {likeInProgress[post._id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Heart className={cn("h-4 w-4", post.isLiked && "fill-red-500")} />
                            )}
                            <span>{post.likes || 0}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{post.isLiked ? 'Unlike' : 'Like'} this post</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {isAuthenticated && post._id !== 'topic-content' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyToPostId(post._id === replyToPostId ? null : post._id);
                              setTimeout(() => {
                                // Focus the textarea when replying
                                document.querySelector('textarea')?.focus();
                              }, 100);
                            }}
                            className={cn(
                              "h-8 px-2",
                              post._id === replyToPostId && "bg-primary/10 text-primary"
                            )}
                          >
                            <Reply className="h-4 w-4 mr-1.5" />
                            Reply
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reply to this post</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                
                {post._id === replyToPostId && (
                  <Badge variant="outline" className="cursor-pointer" onClick={() => setReplyToPostId(null)}>
                    Replying - Click to cancel
                  </Badge>
                )}
              </CardFooter>
            </MotionCard>
          );
        })}
      </div>
      
      {/* Reply Box */}
      {isAuthenticated ? (
        <MotionCard 
          className="mt-8 border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {replyToPostId ? 'Post a Reply' : 'Join the Conversation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <Textarea
              placeholder="Write your reply..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-32 resize-y"
            />
          </CardContent>
          <CardFooter className="flex justify-end pt-3 border-t">
            <Button
              onClick={handleNewPost}
              disabled={!newPostContent.trim() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Post Reply
                </>
              )}
            </Button>
          </CardFooter>
        </MotionCard>
      ) : (
        <MotionCard 
          className="mt-8 border-dashed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardContent className="flex flex-col items-center justify-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium mb-2">Join the conversation</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              You need to be logged in to post replies and participate in discussions.
            </p>
            <div className="flex gap-4">
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild size="lg">
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </MotionCard>
      )}
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <Button asChild variant="outline" size="sm" className="gap-1">
          <Link to={`/categories/${topic.category?.slug || ''}`}>
            <ChevronLeft className="h-4 w-4" />
            Back to Category
          </Link>
        </Button>

        <Button asChild variant="outline" size="sm" className="gap-1">
          <Link to="/">
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      {/* Reference for scrolling to bottom after new reply */}
      <div ref={bottomRef} />
      
      {/* Delete Post Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post
              and remove it from the topic.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 