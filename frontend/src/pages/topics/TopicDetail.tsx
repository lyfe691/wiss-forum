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
  ChevronDown,
  Heart,
  MessageSquare,
  MoreVertical,
  Reply,
  Send,
  Trash,
  CalendarDays,
  Eye,
  Loader2,
  X,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { cn, getAvatarUrl, getInitials } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
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
  children?: Post[];
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
  const [likeInProgress, setLikeInProgress] = useState<{[key: string]: boolean}>({});
  
  // Replace single replyContent with a map of post ID -> content
  const [replyContents, setReplyContents] = useState<{[key: string]: string}>({});
  
  // Add state to track which posts have expanded replies
  const [expandedPosts, setExpandedPosts] = useState<{[key: string]: boolean}>({});
  
  // Refs for DOM manipulation
  const { isAuthenticated, user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyFormRef = useRef<HTMLDivElement>(null);
  // Add a ref to track if we've already counted a view for this topic
  const viewCountedRef = useRef<string | null>(null);

  // Make sure replyToPost is always null on component mount
  useEffect(() => {
    console.log('Component mounted - ensuring replyToPost is null');
    setReplyToPost(null);
  }, []);

  // Clear replyToPost when the slug changes (navigating to a different topic)
  useEffect(() => {
    console.log('Slug changed - clearing replyToPost');
    setReplyToPost(null);
    // Reset the view counted flag when slug changes
    viewCountedRef.current = null;
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

          // Increment view count only if we haven't counted this topic yet
          if (viewCountedRef.current !== topicData._id) {
            await topicsAPI.incrementViewCount(topicData._id);
            viewCountedRef.current = topicData._id;
            console.log('View count incremented for topic:', topicData._id);
          }
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

  // Process posts to add replyToAuthor information and organize hierarchically
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
    
    // First pass: add all posts to the map with normalized IDs
    posts.forEach(post => {
      // Ensure post has an _id property
      const postId = post._id || post.id || '';
      if (postId) {  // Only add if we have a valid ID
        const postWithId = {
          ...post,
          _id: postId,  // Ensure we have _id
          children: [] as Post[]  // Initialize children array
        };
        postsMap.set(postId, postWithId);
      }
    });
    
    // Second pass: add replyToAuthor information and build the tree structure
    const rootPosts: Post[] = [];
    
    posts.forEach(post => {
      // Ensure post has an _id property
      const postId = post._id || post.id || '';
      if (!postId) return;
      
      const postWithId = postsMap.get(postId);
      if (!postWithId) return;
      
      // If this post is a reply to another post
      if (post.replyTo && postsMap.has(post.replyTo)) {
        const parentPost = postsMap.get(post.replyTo);
        if (parentPost) {
          // Add replyToAuthor information
          postWithId.replyToAuthor = parentPost.author;
          
          // Add this post as a child of the parent post
          parentPost.children = parentPost.children || [];
          parentPost.children.push(postWithId);
          
          console.log(`Post ${postId} is a reply to post ${post.replyTo}`);
        }
      } else {
        // This is a top-level post (not a reply or replying to a post that we don't have)
        rootPosts.push(postWithId);
      }
    });
    
    console.log('Hierarchical structure created with', rootPosts.length, 'root posts');
    
    // Return only the root posts - their children will be accessed through the tree structure
    return rootPosts;
  };
  
  // Modify the sort posts function to sort both root posts and their children
  const sortPosts = (posts: Post[]): Post[] => {
    if (!Array.isArray(posts)) {
      console.error('sortPosts received non-array:', posts);
      return [];
    }
    
    // Helper function to sort by date
    const sortByDate = (a: Post, b: Post) => {
      // Ensure we have createdAt values
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aDate - bDate;
    };
    
    // Sort the root posts
    const sortedPosts = [...posts].sort(sortByDate);
    
    // Sort each post's children recursively
    sortedPosts.forEach(post => {
      if (post.children && post.children.length > 0) {
        post.children = sortPosts(post.children);
      }
    });
    
    return sortedPosts;
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
    
    // Helper function to recursively update nested posts
    const updateNestedPost = (posts: Post[], targetId: string, updateFn: (post: Post) => Post): Post[] => {
      return posts.map(post => {
        if (post._id === targetId) {
          return updateFn(post);
        }
        
        // Process children recursively if they exist
        if (post.children && post.children.length > 0) {
          return {
            ...post,
            children: updateNestedPost(post.children, targetId, updateFn)
          };
        }
        
        return post;
      });
    };
    
    try {
      // Optimistic update - works for both top-level and nested posts
      setPosts(prevPosts => 
        updateNestedPost(prevPosts, postId, (post: Post) => {
          const newIsLiked = !post.isLiked;
          return {
            ...post,
            isLiked: newIsLiked,
            likes: post.likes + (newIsLiked ? 1 : -1)
          };
        })
      );
      
      // Actual API call
      const response = await postsAPI.toggleLike(postId);
      
      // Update with server data if available
      if (response && response.post) {
        setPosts(prevPosts => 
          updateNestedPost(prevPosts, postId, (post: Post) => {
            return {
              ...post,
              likes: response.post.likes,
              isLiked: response.post.isLiked
            };
          })
        );
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      
      // Revert on error - also works for nested posts
      setPosts(prevPosts => 
        updateNestedPost(prevPosts, postId, (post: Post) => {
          const revertIsLiked = !post.isLiked;
          return {
            ...post,
            isLiked: revertIsLiked,
            likes: post.likes + (revertIsLiked ? 1 : -1)
          };
        })
      );
    } finally {
      // Re-enable like button after delay
      setTimeout(() => {
        setLikeInProgress(prev => ({ ...prev, [postId]: false }));
      }, 500);
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

  // Check if the current user can manage a post
  const canManagePost = (postAuthorId: string = '') => {
    if (!isAuthenticated || !user) return false;
    
    // Admin can manage all posts
    if (user.role?.toString().toUpperCase() === 'ADMIN') return true;
    
    // A user can manage their own posts
    return user._id === postAuthorId;
  };

  // Toggle expanded/collapsed state for a post's replies
  const toggleReplies = (postId: string) => {
    setExpandedPosts((prev: {[key: string]: boolean}) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Recursive function to render a post and its replies
  const renderPost = (post: Post, level: number = 0) => {
    // Map nesting level to spacing and thread appearance
    const getThreadStyles = (level: number) => {
      const baseIndent = 12;
      const indent = Math.min(level, 3) * baseIndent;
      return {
        marginLeft: level > 0 ? `${indent}px` : '0',
        paddingLeft: level > 0 ? '24px' : '0',
        borderLeft: level > 0 ? '2px solid rgba(var(--primary), 0.15)' : 'none'
      };
    };
    
    const hasReplies = post.children && post.children.length > 0;
    const isExpanded = expandedPosts[post._id] || false;
    const threadStyles = getThreadStyles(level);
    
    return (
      <motion.div 
        key={post._id || `post-${Math.random()}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-4 relative"
        style={{
          marginLeft: threadStyles.marginLeft,
          paddingLeft: threadStyles.paddingLeft,
        }}
      >
        {level > 0 && (
          <div 
            className="absolute left-0 top-0 bottom-0" 
            style={{
              width: '2px',
              background: 'rgba(var(--primary), 0.15)',
              marginLeft: '-1px'
            }}
          />
        )}
        
        <Card 
          id={`post-${post._id}`} 
          className={cn(
            "border transition-all duration-200 hover:shadow-md",
            replyToPost?._id === post._id && "ring-2 ring-primary/30"
          )}
        >
          <CardHeader className="pb-2 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 border border-border ring-2 ring-background">
                  <AvatarImage 
                    src={getAvatarUrl(post.author?.username || 'unknown', post.author?.avatar)}
                    alt={post.author?.displayName || post.author?.username || 'Unknown'} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(post.author?.displayName || post.author?.username || 'U')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1">
                  <div className="font-semibold">
                    {post.author?.displayName || post.author?.username || 'Unknown user'}
                    {post.author?._id === topic?.author?._id && (
                      <Badge className="ml-2 bg-primary/20 text-primary border-none text-[10px] py-0">Author</Badge>
                    )}
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
            </div>
          </CardHeader>
          
          <CardContent className="prose prose-sm max-w-none pt-0 pb-2">
            {/* Make the "Replying to" section more prominent */}
            {post.replyTo && post.replyToAuthor && (
              <div className="mb-3 text-sm flex items-center gap-2 text-muted-foreground bg-muted/20 px-3 py-2 rounded-md">
                <Reply className="h-3.5 w-3.5 text-primary/70" />
                <span>
                  Replying to <span className="font-semibold text-primary">@{post.replyToAuthor.displayName || post.replyToAuthor.username}</span>
                </span>
              </div>
            )}
            
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </CardContent>
          
          <CardFooter className="py-2 px-4 border-t flex justify-between items-center gap-2 flex-wrap">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleLike(post._id)}
                disabled={!isAuthenticated || likeInProgress[post._id]}
                className={cn(
                  "h-8 px-2 gap-1.5 rounded-full",
                  post.isLiked && "text-red-500 bg-red-50 dark:bg-red-950/20"
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
                    handleReplyClick(post);
                    
                    // Auto-expand replies when replying
                    if (post.children && post.children.length > 0 && !expandedPosts[post._id]) {
                      toggleReplies(post._id);
                    }
                  }}
                  className={cn(
                    "h-8 px-3 rounded-full",
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

            {/* Toggle button with counter badge for replies */}
            {hasReplies && (
              <Button
                variant={isExpanded ? "secondary" : "outline"}
                size="sm"
                onClick={() => toggleReplies(post._id)}
                className={cn(
                  "h-8 px-3 gap-1.5 rounded-full text-xs font-medium",
                  isExpanded && "bg-primary/10 text-primary border-primary/20"
                )}
              >
                {isExpanded ? (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>Hide replies</span>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "ml-1 text-xs", 
                        isExpanded && "bg-primary/20 text-primary hover:bg-primary/30"
                      )}
                    >
                      {post.children?.length}
                    </Badge>
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span>View replies</span>
                    <Badge 
                      variant="secondary" 
                      className="ml-1 text-xs"
                    >
                      {post.children?.length}
                    </Badge>
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Inline reply box */}
        {isAuthenticated && 
          replyToPost !== null && 
          replyToPost._id && 
          post._id && 
          post._id === replyToPost._id && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-3 mb-4 ml-6"
          >
            <Card className="bg-card/50 border-primary/20 shadow-sm overflow-hidden">
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
                  className="min-h-[100px] resize-y mb-3 focus:border-primary/30"
                />
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={cancelReply}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSubmitReply}
                    disabled={isSubmitting || !(replyContents[post._id] || '').trim()}
                    className="gap-2 rounded-full"
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
          </motion.div>
        )}
        
        {/* Animate replies expanding/collapsing */}
        <AnimatePresence>
          {hasReplies && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 overflow-hidden"
            >
              <div className="space-y-0">
                {post.children!.map(childPost => renderPost(childPost, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Update the renderPosts function to use recursive rendering
  const renderPosts = () => {
    console.log('Rendering posts:', posts.length);
    
    return (
      <div className="space-y-6">
        {posts.map(post => renderPost(post))}
      </div>
    );
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
        <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Replies</h2>
        
          {/* Add expand/collapse all button */}
          {posts.length > 0 && posts.some(post => post.children && post.children.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allPostIds = posts.reduce((acc: string[], post) => {
                  if (post._id) acc.push(post._id);
                  return acc;
                }, []);
                
                // Check if any posts are already expanded
                const anyExpanded = allPostIds.some(id => expandedPosts[id]);
                
                // Toggle all posts based on current state
                const newState = allPostIds.reduce((acc: {[key: string]: boolean}, id) => {
                  acc[id] = !anyExpanded;
                  return acc;
                }, {});
                
                setExpandedPosts(newState);
              }}
              className="gap-1.5"
            >
              {Object.keys(expandedPosts).length > 0 ? (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Collapse All</span>
                        </>
                      ) : (
                        <>
                  <ChevronRight className="h-4 w-4" />
                  <span>Expand All</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
            
        {/* No replies message */}
        {posts.length === 0 && (
          <div className="text-center p-8 border rounded-md bg-muted/20">
            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No replies yet. Be the first to respond!</p>
                    </div>
        )}
        
        {/* Posts list - use the renderPosts function */}
        <AnimatePresence>
          {renderPosts()}
        </AnimatePresence>
      </div>
      
      {/* Main reply form - only show if not currently replying to a specific post */}
      {isAuthenticated && replyToPost === null ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          ref={replyFormRef} 
          className={cn(
            "mb-8 p-5 border border-primary/20 rounded-lg bg-card/80 shadow-sm transition-all duration-300"
          )}
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary/70" />
              Join the conversation
            </h3>
          </div>
          
          <Textarea
            ref={textareaRef}
            placeholder="Write your reply to this topic..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="min-h-[120px] resize-y mb-4 focus:border-primary/30"
          />
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitPost}
              disabled={isSubmitting || !newPostContent.trim()}
              className="gap-2 px-5 rounded-full"
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
        </motion.div>
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
    </div>
  );
} 