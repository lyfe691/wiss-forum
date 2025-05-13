import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { topicsAPI, postsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator, 
  BreadcrumbList 
} from "@/components/ui/breadcrumb";
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
  CalendarDays,
  Eye,
  Loader2,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getAvatarUrl } from '@/lib/utils';
import React from 'react';

// Types for users and content
interface Author {
  _id: string;
  username: string;
  displayName?: string;
  role: string;
  avatar?: string;
}

interface Post {
  _id: string;
  id?: string;
  content: string;
  author: Author;
  topic: string;
  replyTo?: string;
  replyToAuthor?: Author;
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
  createdAt: string;
  updatedAt: string;
}

// Create a forwardRef wrapper for Textarea
import { Textarea as TextareaComponent } from '@/components/ui/textarea';
const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentPropsWithoutRef<typeof TextareaComponent>>(
  (props, ref) => <TextareaComponent {...props} ref={ref} />
);

// Implement a custom TextareaWithFocus component to correctly handle focusing
const TextareaWithFocus = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { autoFocus?: boolean }>(
  ({ autoFocus, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    // Combine the forwarded ref with our local ref
    React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);
    
    // Focus the textarea on mount if autoFocus is true
    useEffect(() => {
      if (autoFocus && textareaRef.current) {
        // Short delay to ensure the component is fully mounted
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        }, 50);
      }
    }, [autoFocus]);
    
    return <Textarea ref={textareaRef} {...props} />;
  }
);
TextareaWithFocus.displayName = 'TextareaWithFocus';

// Debugging utility
const debugPost = (post: any, prefix: string = '') => {
  const safePost = post || {};
  console.log(`${prefix} Post debug:`, {
    _id: safePost._id,
    id: safePost.id,
    content: safePost.content?.substring(0, 20) + '...',
    author: safePost.author?.username,
    replyTo: safePost.replyTo
  });
};

export function TopicDetail() {
  // States for data
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States for user interaction - explicitly initialize replyToPost to null
  const [newPostContent, setNewPostContent] = useState('');
  const [replyToPost, setReplyToPost] = useState<Post | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [likeInProgress, setLikeInProgress] = useState<{[key: string]: boolean}>({});
  
  // Replace single replyContent with a map of post ID -> content
  const [replyContents, setReplyContents] = useState<{[key: string]: string}>({});
  
  // Refs for DOM manipulation
  const { isAuthenticated, user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyFormRef = useRef<HTMLDivElement>(null);

  // Make sure replyToPost is always null on component mount
  useEffect(() => {
    console.log('Component mounted - ensuring replyToPost is null');
    setReplyToPost(null);
  }, []);

  // Clear replyToPost when the slug changes (navigating to a different topic)
  useEffect(() => {
    console.log('Slug changed - clearing replyToPost');
    setReplyToPost(null);
  }, [slug]);

  // Fetch topic and posts data
  useEffect(() => {
    const fetchData = async () => {
      if (!slug) {
        setIsLoading(false);
        return;
      }

      // Clear any existing reply state
      setReplyToPost(null);
      setNewPostContent('');
      // Also clear any persisted reply contents
      setReplyContents({});

      try {
        console.log('Fetching topic with slug:', slug);
        const topicData = await topicsAPI.getTopicByIdOrSlug(slug);
        console.log('Topic data received:', topicData);
        setTopic(topicData);
        
        try {
          console.log('Fetching posts for topic ID:', topicData._id);
          const postsData = await postsAPI.getPostsByTopic(topicData._id);
          console.log('Posts data received:', postsData);
          
          // Process posts to add reply author information for better display
          const processedPosts = processPosts(postsData);
          
          // Sort posts by created date
          const sortedPosts = sortPosts(processedPosts);
          
          // Debug the posts
          console.log('Processed and sorted posts:', sortedPosts.map(p => ({ 
            _id: p._id, 
            content: p.content.substring(0, 20) + '...',
            replyTo: p.replyTo
          })));
          
          setPosts(sortedPosts);
        } catch (error) {
          console.error('Failed to fetch posts:', error);
          setPosts([]);
        }
      } catch (error) {
        console.error('Failed to fetch topic:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Process posts to add replyToAuthor information
  const processPosts = (posts: Post[]): Post[] => {
    if (!Array.isArray(posts) || posts.length === 0) {
      return [];
    }
    
    console.log('Processing posts:', posts.length);
    
    // Log the structure of the first post to understand its properties
    if (posts.length > 0) {
      console.log('Sample post structure:', JSON.stringify(posts[0], null, 2));
    }
    
    // Create a map for fast lookup
    const postsMap = new Map<string, Post>();
    
    // First pass: add all posts to the map
    posts.forEach(post => {
      // Ensure post has an _id property
      const postId = post._id || post.id || '';
      if (postId) {  // Only add if we have a valid ID
        const postWithId = {
          ...post,
          _id: postId  // Ensure we have _id
        };
        postsMap.set(postId, postWithId);
      }
    });
    
    // Second pass: add replyToAuthor information
    return posts.map(post => {
      // Ensure post has an _id property
      const postId = post._id || post.id || '';
      const postWithId = { ...post, _id: postId };
      
      if (postId && post.replyTo && postsMap.has(post.replyTo)) {
        const replyToPost = postsMap.get(post.replyTo);
        console.log(`Post ${postId} is replying to post ${post.replyTo}`);
        return {
          ...postWithId,
          replyToAuthor: replyToPost?.author
        };
      }
      return postWithId;
    });
  };
  
  // Sort posts by creation date, but keep replies near their parent posts
  const sortPosts = (posts: Post[]): Post[] => {
    if (!Array.isArray(posts)) {
      console.error('sortPosts received non-array:', posts);
      return [];
    }
    
    // First sort all posts by creation date
    return [...posts].sort((a, b) => {
      // Ensure we have createdAt values
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aDate - bDate;
    });
  };

  // Handle creating a new post or reply
  const handleSubmitPost = async () => {
    if (!isAuthenticated || !topic || !newPostContent.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const requestData = {
        content: newPostContent,
        topicId: topic._id,
        // Only include replyTo if we're replying to a specific post
        ...(replyToPost && replyToPost._id ? { replyTo: replyToPost._id } : {})
      };
      
      console.log('Creating new post with data:', requestData);
      
      // Create the post through the API
      const result = await postsAPI.createPost(requestData);
      console.log('Post created successfully:', result);
      
      // Clear the form
      setNewPostContent('');
      setReplyToPost(null);
      
      // Refresh posts data
      const refreshedPosts = await postsAPI.getPostsByTopic(topic._id);
      console.log('Refreshed posts data:', refreshedPosts);
      const processedPosts = processPosts(refreshedPosts);
      const sortedPosts = sortPosts(processedPosts);
      setPosts(sortedPosts);
      
      // Scroll to the new post
      setTimeout(() => {
        // Try to find and scroll to the newly created post
        const newPostElement = document.getElementById(`post-${result._id}`);
        if (newPostElement) {
          newPostElement.scrollIntoView({ behavior: 'smooth' });
          // Add a highlight effect
          newPostElement.classList.add('ring-2', 'ring-primary');
          setTimeout(() => {
            newPostElement.classList.remove('ring-2', 'ring-primary');
          }, 2000);
        } else {
          // If post element not found, just scroll to bottom
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle like/unlike a post
  const handleToggleLike = async (postId: string) => {
    if (!isAuthenticated) return;
    
    // Prevent multiple simultaneous likes
    if (likeInProgress[postId]) return;
    
    setLikeInProgress(prev => ({ ...prev, [postId]: true }));
    
    try {
      // Optimistic update
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
      
      // Actual API call
      const response = await postsAPI.toggleLike(postId);
      
      // Update with server data if available
      if (response && response.post) {
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post._id === postId) {
              return {
                ...post,
                likes: response.post.likes,
                isLiked: response.post.isLiked
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      
      // Revert on error
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            const revertIsLiked = !post.isLiked;
            return {
              ...post,
              isLiked: revertIsLiked,
              likes: post.likes + (revertIsLiked ? 1 : -1)
            };
          }
          return post;
        })
      );
    } finally {
      // Re-enable like button after delay
      setTimeout(() => {
        setLikeInProgress(prev => ({ ...prev, [postId]: false }));
      }, 500);
    }
  };

  // Handle post deletion
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

  // Handle reply to a post
  const handleReplyClick = (post: Post) => {
    // Validate post and post._id
    if (!post) {
      console.error('Invalid post object:', post);
      return;
    }
    
    if (!post._id) {
      console.error('Post has no _id:', post);
      debugPost(post, 'Error:');
      return;
    }
    
    console.log('Reply button clicked for post ID:', post._id);
    debugPost(post, 'Replying to:');
    console.log('Current replyToPost:', replyToPost ? replyToPost._id : 'null');
    
    // If we're already replying to this post, cancel the reply
    if (replyToPost && replyToPost._id === post._id) {
      console.log('Canceling reply to same post');
      setReplyToPost(null);
      // Clear the reply content for this specific post
      setReplyContents(prev => ({
        ...prev,
        [post._id]: ''
      }));
      return;
    }
    
    // Otherwise, set it as the post we're replying to
    console.log('Setting replyToPost to post ID:', post._id);
    setReplyToPost({...post}); // Clone the post object to prevent reference issues
    
    // Initialize reply content for this post if it doesn't exist
    if (!replyContents[post._id]) {
      setReplyContents(prev => ({
        ...prev,
        [post._id]: ''
      }));
    }
    
    // Focus the textarea and scroll to the reply form 
    setTimeout(() => {
      // Find the post element
      const postElement = document.getElementById(`post-${post._id}`);
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        console.log('Scrolled to post:', post._id);
      } else {
        console.log('Post element not found:', post._id);
      }
    }, 100);
  };
  
  // React to replyToPost changes for debugging
  useEffect(() => {
    console.log('replyToPost changed:', replyToPost ? replyToPost._id : 'null');
  }, [replyToPost]);

  // Cancel replying to a post
  const cancelReply = () => {
    console.log('Canceling reply');
    if (replyToPost) {
      // Clear the reply content for this specific post
      setReplyContents(prev => ({
        ...prev,
        [replyToPost._id]: ''
      }));
    }
    setReplyToPost(null);
  };

  // Update handleSubmitReply to check post validity
  const handleSubmitReply = async () => {
    if (!isAuthenticated || !topic || !replyToPost) {
      console.log('Cannot submit reply: missing required data');
      return;
    }
    
    // Validate replyToPost has a valid ID
    if (!replyToPost._id) {
      console.error('Cannot reply: Post ID is undefined');
      return;
    }
    
    // Get the reply content for this specific post
    const content = replyContents[replyToPost._id] || '';
    
    if (!content.trim()) {
      console.log('Cannot submit empty reply');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const requestData = {
        content: content,
        topicId: topic._id,
        replyTo: replyToPost._id
      };
      
      console.log('Creating reply with data:', requestData);
      
      // Create the post through the API
      const result = await postsAPI.createPost(requestData);
      console.log('Reply created successfully:', result);
      
      // Clear the form
      setReplyContents(prev => ({
        ...prev,
        [replyToPost._id]: ''
      }));
      setReplyToPost(null);
      
      // Refresh posts data
      const refreshedPosts = await postsAPI.getPostsByTopic(topic._id);
      console.log('Refreshed posts after reply:', refreshedPosts.length);
      
      // Make sure each post has the required _id field
      const postsWithIds = refreshedPosts.map((post: any) => ({
        ...post,
        _id: post._id || post.id || ''
      }));
      
      const processedPosts = processPosts(postsWithIds);
      const sortedPosts = sortPosts(processedPosts);
      
      // Debug the posts
      console.log('Posts after reply -', sortedPosts.map(p => ({
        _id: p._id,
        content: p.content.substring(0, 20) + '...',
        replyTo: p.replyTo
      })));
      
      setPosts(sortedPosts);
      
      // Scroll to the new post
      setTimeout(() => {
        // Try to find and scroll to the newly created post
        const newPostElement = document.getElementById(`post-${result._id || result.id}`);
        if (newPostElement) {
          newPostElement.scrollIntoView({ behavior: 'smooth' });
          // Add a highlight effect
          newPostElement.classList.add('ring-2', 'ring-primary');
          setTimeout(() => {
            newPostElement.classList.remove('ring-2', 'ring-primary');
          }, 2000);
        } else {
          // If post element not found, just scroll to bottom
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error('Failed to create reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Utility functions for date and avatar
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

  // Check if the current user can manage a post
  const canManagePost = (postAuthorId: string = '') => {
    if (!isAuthenticated || !user) return false;
    
    // Admin can manage all posts
    if (user.role?.toString().toUpperCase() === 'ADMIN') return true;
    
    // A user can manage their own posts
    return user._id === postAuthorId;
  };

  // Add debug statement to check what's happening when rendering posts
  const renderPosts = () => {
    console.log('Rendering posts:', posts.length);
    
    return posts.map((post) => {
      console.log(`Rendering post ${post._id}, replyToPost:`, replyToPost ? replyToPost._id : 'null');
      
      return (
        <React.Fragment key={post._id || `post-${Math.random()}`}>
          <Card 
            id={`post-${post._id}`} 
            className={cn(
              "border relative transition-all duration-200 hover:shadow-md mb-2",
              replyToPost?._id === post._id && "ring-2 ring-primary/30",
              post.replyTo && "ml-8 border-l-4 border-l-primary/30"  // Indent replies with clearer border
            )}
          >
            {post.replyTo && (
              <div className="absolute -left-6 top-6 h-6 w-6 border-t-2 border-l-2 border-primary/30 rounded-tl-md"></div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage 
                      src={getAvatarUrl(post.author?.username || 'unknown', post.author?.avatar)}
                      alt={post.author?.displayName || post.author?.username || 'Unknown'} 
                    />
                    <AvatarFallback>
                      {getInitials(post.author?.displayName || post.author?.username || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {post.author?.displayName || post.author?.username || 'Unknown user'}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="px-1.5 py-0 text-xs">
                        {post.author?.role?.charAt(0).toUpperCase() + post.author?.role?.slice(1) || 'User'}
                      </Badge>
                      <span>{formatDate(post.createdAt)} at {formatTime(post.createdAt)}</span>
                      {post.createdAt !== post.updatedAt && (
                        <span className="italic">(edited)</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {canManagePost(post.author?._id) && (
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
              </div>
            </CardHeader>
            
            <CardContent className="prose prose-sm max-w-none pb-3">
              {/* Show who this post is replying to */}
              {post.replyTo && post.replyToAuthor && (
                <div className="mb-3 text-sm flex items-center gap-2 text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
                  <Reply className="h-3.5 w-3.5 text-primary/70" />
                  <span>
                    Replying to <span className="font-semibold text-primary">@{post.replyToAuthor.displayName || post.replyToAuthor.username}</span>
                  </span>
                </div>
              )}
              
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </CardContent>
            
            <CardFooter className="pt-3 border-t flex justify-between items-center">
              <div className="flex gap-2">
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

                {isAuthenticated && (
                  <Button
                    variant={replyToPost !== null && post._id === replyToPost._id ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => {
                      console.log('Reply button clicked. Post:', post);
                      console.log('Post _id:', post._id);
                      console.log('Post id property:', (post as any).id);
                      handleReplyClick(post);
                    }}
                    className={cn(
                      "h-8 px-2",
                      replyToPost !== null && post._id === replyToPost._id ? "bg-primary/10 text-primary font-medium" : ""
                    )}
                  >
                    {replyToPost !== null && post._id === replyToPost._id ? (
                      <>
                        <X className="h-4 w-4 mr-1.5" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Reply className="h-4 w-4 mr-1.5" />
                        Reply
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
          
          {/* Inline reply box that appears directly under the post being replied to */}
          {isAuthenticated && 
            replyToPost !== null && 
            replyToPost._id && 
            post._id && 
            post._id === replyToPost._id && (
            <div className="ml-8 mb-8 border-l-4 border-l-primary/30 pl-4">
              <Card className="bg-card/50 shadow-sm">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Reply className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      Replying to <span className="text-primary font-semibold">@{post.author?.username}</span>
                    </span>
                  </div>
                  
                  <TextareaWithFocus
                    key={`reply-textarea-${post._id}`}
                    autoFocus
                    placeholder={`Write your reply to ${post.author?.displayName || post.author?.username}...`}
                    value={replyContents[post._id] || ''}
                    onChange={(e) => setReplyContents(prev => ({
                      ...prev,
                      [post._id]: e.target.value
                    }))}
                    className="min-h-[100px] resize-y mb-3"
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={cancelReply}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSubmitReply}
                      disabled={isSubmitting || !(replyContents[post._id] || '').trim()}
                      className="gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Post Reply
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  // Loading state UI
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
          <Card key={index} className="mb-4">
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
          </Card>
        ))}
      </div>
    );
  }

  // Error state for missing topic
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

  // Main component UI
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
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="font-medium text-foreground">
                {topic.title || 'Topic'}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      {/* Topic Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
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
                  <AvatarImage 
                    src={getAvatarUrl(topic.author?.username || 'unknown', topic.author?.avatar)} 
                    alt={topic.author?.displayName || topic.author?.username || 'Unknown'} 
                  />
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
      
      {/* Topic content */}
      <Card className="border-primary/20 bg-primary/5 mb-8">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage 
                src={getAvatarUrl(topic.author?.username || 'unknown', topic.author?.avatar)} 
                alt={topic.author?.displayName || topic.author?.username || 'Unknown'} 
              />
              <AvatarFallback>
                {getInitials(topic.author?.displayName || topic.author?.username || 'U')}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <div className="font-semibold">
                {topic.author?.displayName || topic.author?.username || 'Unknown user'}
                <Badge className="ml-2 bg-primary/20 text-primary border-none">Topic Author</Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="px-1.5 py-0 text-xs">
                  {topic.author?.role?.charAt(0).toUpperCase() + topic.author?.role?.slice(1) || 'User'}
                </Badge>
                <span>{formatDate(topic.createdAt)} at {formatTime(topic.createdAt)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="prose prose-sm max-w-none pb-3">
          <div dangerouslySetInnerHTML={{ __html: topic.content }} />
        </CardContent>
        
        <CardFooter className="pt-3 border-t flex items-center justify-between">
          <div className="flex items-center">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyToPost(null);
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                  replyFormRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-8 px-2"
              >
                <Reply className="h-4 w-4 mr-1.5" />
                Reply to Topic
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      {/* Posts section */}
      <div className="space-y-6 mb-8">
        <h2 className="text-xl font-semibold">Replies</h2>
        
        {/* No replies message */}
        {posts.length === 0 && (
          <div className="text-center p-8 border rounded-md bg-muted/20">
            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No replies yet. Be the first to respond!</p>
          </div>
        )}
        
        {/* Posts list - use the renderPosts function */}
        {renderPosts()}
      </div>
      
      {/* Main reply form - only show if not currently replying to a specific post */}
      {isAuthenticated && replyToPost === null ? (
        <div 
          ref={replyFormRef} 
          className={cn(
            "mb-8 p-4 border rounded-md bg-card transition-all duration-300",
            "border-border"
          )}
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">
              Join the conversation
            </h3>
          </div>
          
          <Textarea
            ref={textareaRef}
            placeholder="Write your reply to this topic..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="min-h-[120px] resize-y mb-4"
          />
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitPost}
              disabled={isSubmitting || !newPostContent.trim()}
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
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      ) : null}
      
      {!isAuthenticated && (
        <Card className="mb-8 border-dashed">
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
      <div className="flex justify-between">
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