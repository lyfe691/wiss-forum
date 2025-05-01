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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbList } from "@/components/ui/breadcrumb";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  AlertCircle, 
  ArrowLeft, 
  ChevronLeft,
  Heart,
  MessageSquare,
  MoreVertical,
  Reply,
  Send,
  Trash,
  Lock,
  Pin,
  CalendarDays,
  Eye,
  Loader2
} from 'lucide-react';
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
  replyTo?: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLiked: boolean;
  replies: Post[];
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

  // Helper function to recursively update a post's like status in the nested structure
  const updatePostLikeStatus = (posts: Post[], postId: string, updatedPost: Partial<Post>): Post[] => {
    return posts.map(post => {
      // If this is the post we're looking for
      if (post._id === postId) {
        return {
          ...post,
          ...updatedPost,
          // Preserve replies
          replies: post.replies
        };
      }
      
      // If this post has replies, check them recursively
      if (post.replies && post.replies.length > 0) {
        return {
          ...post,
          replies: updatePostLikeStatus(post.replies, postId, updatedPost)
        };
      }
      
      // Otherwise return the post unchanged
      return post;
    });
  };

  const handleToggleLike = async (postId: string) => {
    if (!isAuthenticated) return;
    
    // Prevent multiple clicks
    if (likeInProgress[postId]) return;
    
    setLikeInProgress(prev => ({ ...prev, [postId]: true }));
    
    try {
      // Optimistic update - toggle the like state immediately in the UI
      setPosts(prevPosts => {
        // Find the post in the flat structure
        const targetPost = prevPosts.find(p => p._id === postId);
        if (!targetPost) return prevPosts;
        
        const newIsLiked = !targetPost.isLiked;
        const updatedPost = {
          isLiked: newIsLiked,
          likes: targetPost.likes + (newIsLiked ? 1 : -1)
        };
        
        return updatePostLikeStatus(prevPosts, postId, updatedPost);
      });
      
      // Make the API call to update the like on the server
      const response = await postsAPI.toggleLike(postId);
      console.log('Server response from like toggle:', response);
      
      // If we received specific updated post data from the server, use it to update the UI
      if (response && response.post) {
        const updatedPost = response.post;
        
        // Update all posts including nested replies
        setPosts(prevPosts => {
          return updatePostLikeStatus(prevPosts, postId, {
            likes: updatedPost.likes !== undefined ? updatedPost.likes : 0,
            isLiked: updatedPost.isLiked !== undefined ? updatedPost.isLiked : false
          });
        });
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert the optimistic update if there was an error
      setPosts(prevPosts => {
        // Find the post in the flat structure
        const targetPost = prevPosts.find(p => p._id === postId);
        if (!targetPost) return prevPosts;
        
        const revertedIsLiked = !targetPost.isLiked;
        const updatedPost = {
          isLiked: revertedIsLiked,
          likes: targetPost.likes + (revertedIsLiked ? 1 : -1)
        };
        
        return updatePostLikeStatus(prevPosts, postId, updatedPost);
      });
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

  // Update organizePostsIntoThreads function to ensure like data is preserved
  const organizePostsIntoThreads = (posts: Post[]): Post[] => {
    // First create a map of all posts
    const postMap = new Map<string, Post>();
    
    // Initialize each post with an empty replies array and ensure like data is preserved
    posts.forEach(post => {
      // Create a deep copy of the post to avoid reference issues
      const postCopy = {
        ...post,
        replies: [],
        // Make sure like data is preserved
        likes: typeof post.likes === 'number' ? post.likes : 0,
        isLiked: !!post.isLiked
      };
      postMap.set(post._id, postCopy);
    });
    
    // Group replies under their parent posts
    const rootPosts: Post[] = [];
    
    // Sort posts by created date to ensure replies appear in chronological order
    const sortedPosts = [...posts].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // First pass - add all replies to their direct parents
    sortedPosts.forEach(post => {
      const postWithReplies = postMap.get(post._id)!;
      
      if (post.replyTo && postMap.has(post.replyTo)) {
        // This is a reply to another post
        const parentPost = postMap.get(post.replyTo)!;
        parentPost.replies.push(postWithReplies);
      } else {
        // This is a root level post
        rootPosts.push(postWithReplies);
      }
    });
    
    return rootPosts;
  };

  // Update RenderReplies component type
  const RenderReplies = ({ replies }: { replies: Post[] }) => {
    if (!replies || replies.length === 0) return null;
    
    return (
      <div className="ml-8 mt-2 pl-4 border-l-2 border-muted space-y-2">
        {replies.map((reply) => (
          <div key={reply._id}>
            <Card 
              id={`post-${reply._id}`} 
              className={cn(
                "border relative transition-all duration-200 hover:shadow-md",
                reply._id === replyToPostId && "ring-2 ring-primary/30"
              )}
            >
              <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 border border-border rounded-full">
                    <AvatarImage src={reply.author?.avatar} alt={reply.author?.displayName || reply.author?.username || 'Unknown'} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(reply.author?.displayName || reply.author?.username || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="font-semibold text-sm">
                      {reply.author?.displayName || reply.author?.username || 'Unknown user'}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="px-1.5 py-0 text-xs rounded-sm">
                        {reply.author?.role?.charAt(0).toUpperCase() + reply.author?.role?.slice(1) || 'User'}
                      </Badge>
                      <span>{formatDate(reply.createdAt)} at {formatTime(reply.createdAt)}</span>
                      {reply.createdAt !== reply.updatedAt && (
                        <span className="italic">(edited)</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {canManagePost(reply.author?._id) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="flex items-center text-destructive cursor-pointer hover:bg-destructive/10"
                        onClick={() => {
                          setPostToDelete(reply._id);
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
                <div dangerouslySetInnerHTML={{ __html: reply.content }} />
              </CardContent>
              
              <CardFooter className="pt-3 border-t flex justify-between items-center">
                <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleLike(reply._id)}
                          disabled={!isAuthenticated || likeInProgress[reply._id]}
                          className={cn(
                            "h-8 px-2 gap-1.5 transition-colors",
                            reply.isLiked && "text-red-500"
                          )}
                        >
                          {likeInProgress[reply._id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Heart className={cn("h-4 w-4", reply.isLiked && "fill-red-500")} />
                          )}
                          <span>{reply.likes || 0}</span>
                        </Button>
                  
                  {isAuthenticated && (
                
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyToPostId(reply._id === replyToPostId ? null : reply._id);
                              setTimeout(() => {
                                document.querySelector('textarea')?.focus();
                              }, 100);
                            }}
                            className={cn(
                              "h-8 px-2 transition-colors",
                              reply._id === replyToPostId && "bg-primary/10 text-primary"
                            )}
                          >
                            <Reply className="h-4 w-4 mr-1.5" />
                            Reply
                          </Button>
                  )}
                </div>
                
                {reply._id === replyToPostId && (
                  <Badge variant="outline" className="cursor-pointer" onClick={() => setReplyToPostId(null)}>
                    Replying - Click to cancel
                  </Badge>
                )}
              </CardFooter>
            </Card>
            
            {/* Recursively render nested replies */}
            {reply.replies && reply.replies.length > 0 && (
              <RenderReplies replies={reply.replies} />
            )}
          </div>
        ))}
      </div>
    );
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
          <Card 
            key={index} 
            className="mb-4"
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
          </Card>
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

  // Update allPosts declaration
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
      isLiked: false,
      replies: []
    } as Post,
    
    // Then add all the actual posts with validation, organized into threads
    ...organizePostsIntoThreads(Array.isArray(posts) ? posts.map(post => ({
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
      isLiked: !!post.isLiked,
      replies: post.replies || [] // Ensure replies array exists
    })) : [])
  ] : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb className="text-sm">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/categories" className="text-muted-foreground hover:text-foreground transition-colors">Categories</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {topic?.category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/categories/${topic.category.slug || ''}`} className="text-muted-foreground hover:text-foreground transition-colors">
                      {topic.category.name || 'Category'}
                    </Link>
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
          </BreadcrumbList>
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
                {topic.replyCount !== undefined ? topic.replyCount : posts.length} {(topic.replyCount !== undefined ? topic.replyCount : posts.length) === 1 ? 'reply' : 'replies'}
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
            <div key={uniqueKey}>
              <Card 
                id={`post-${post._id}`} 
                className={cn(
                  "border relative transition-all duration-200 hover:shadow-md",
                  index === 0 && "border-primary/20 bg-primary/5",
                  post._id === replyToPostId && "ring-2 ring-primary/30"
                )}
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleLike(post._id)}
                              disabled={!isAuthenticated || likeInProgress[post._id]}
                              className={cn(
                                "h-8 px-2 gap-1.5 transition-colors",
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

                    )}
                    
                    {isAuthenticated && post._id !== 'topic-content' && (
                      <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReplyToPostId(post._id === replyToPostId ? null : post._id);
                                setTimeout(() => {
                                  document.querySelector('textarea')?.focus();
                                }, 100);
                              }}
                              className={cn(
                                "h-8 px-2 transition-colors",
                                post._id === replyToPostId && "bg-primary/10 text-primary"
                              )}
                            >
                              <Reply className="h-4 w-4 mr-1.5" />
                              Reply
                            </Button>
                    )}
                  </div>
                  
                  {post._id === replyToPostId && (
                    <Badge variant="outline" className="cursor-pointer" onClick={() => setReplyToPostId(null)}>
                      Replying - Click to cancel
                    </Badge>
                  )}
                </CardFooter>
              </Card>
              
              {/* Use the recursive component for rendering replies */}
              {post.replies && post.replies.length > 0 && (
                <RenderReplies replies={post.replies} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Reply Box */}
      {isAuthenticated ? (
        <Card 
          className="mt-8 border-primary/20 transition-all duration-200"
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
              className="min-h-[120px] resize-y"
              disabled={isSubmitting || topic?.isLocked}
            />
            {replyToPostId && (
              <div className="mt-2 text-sm text-muted-foreground">
                Replying to a specific post. <Button onClick={() => setReplyToPostId(null)} variant="link" className="h-auto p-0">Cancel</Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleNewPost}
              disabled={isSubmitting || !newPostContent.trim() || topic?.isLocked}
              className="gap-2 transition-all duration-200"
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
        </Card>
      ) : (
        <Card className="mt-8 border-dashed">
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
        </Card>
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
            <AlertDialogDescription asChild>
              <div>
                This action cannot be undone. This will permanently delete the post
                and remove it from the topic.
              </div>
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