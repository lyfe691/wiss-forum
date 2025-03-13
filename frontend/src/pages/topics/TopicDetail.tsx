import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { topicsAPI, postsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
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
  User
} from 'lucide-react';

interface Author {
  _id: string;
  username: string;
  displayName?: string;
  role: string;
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
      if (!slug) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch topic details
        const topicData = await topicsAPI.getTopicByIdOrSlug(slug);
        if (!topicData || !topicData.topic) {
          console.error('Invalid topic data returned from API:', topicData);
          setIsLoading(false);
          return;
        }
        setTopic(topicData.topic);
        
        // Fetch posts for the topic
        if (topicData.topic._id) {
          try {
            const postsData = await postsAPI.getPostsByTopic(topicData.topic._id);
            // Ensure postsData is an array before setting state
            setPosts(Array.isArray(postsData) ? postsData : []);
          } catch (postError) {
            console.error('Failed to fetch posts:', postError);
            setPosts([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch topic details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopicAndPosts();
  }, [slug]);

  const handleNewPost = async () => {
    if (!topic || !newPostContent.trim() || !isAuthenticated) return;
    
    setIsSubmitting(true);
    try {
      const newPost = await postsAPI.createPost({
        content: newPostContent,
        topicId: topic._id,
        replyTo: replyToPostId || undefined
      });
      
      // Log the API response to see what's coming back
      console.log('API response for new post:', newPost);
      
      // Validate and augment the post data if needed
      const validatedPost = {
        ...newPost,
        // Ensure content is properly set - the API might return it in a different property
        content: newPost.content || newPostContent, // Use our input if API doesn't return content
        // Ensure author exists, use current user if missing
        author: newPost.author || {
          _id: user?._id || 'unknown',
          username: user?.username || 'unknown',
          displayName: user?.displayName,
          role: user?.role || 'user'
        }
      };
      
      console.log('Validated post being added to state:', validatedPost);
      
      setPosts(prevPosts => {
        const updatedPosts = [...prevPosts, validatedPost];
        console.log('Updated posts state:', updatedPosts);
        return updatedPosts;
      });
      
      setNewPostContent('');
      setReplyToPostId(null);
      
      // Scroll to bottom to see the new post
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
    
    try {
      await postsAPI.toggleLike(postId);
      
      // Update local state to reflect the like toggle
      setPosts(prevPosts => prevPosts.map(post => {
        if (post._id === postId) {
          const newIsLiked = !post.isLiked;
          return {
            ...post,
            isLiked: newIsLiked,
            likes: newIsLiked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      await postsAPI.deletePost(postToDelete);
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postToDelete));
      setPostToDelete(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  const canManagePost = (postAuthorId?: string) => {
    if (!isAuthenticated || !user || !postAuthorId) return false;
    return user._id === postAuthorId || user.role === 'admin' || user.role === 'teacher';
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
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Topic Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested topic could not be found.</p>
        <Button onClick={() => navigate('/categories')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
      </div>
    );
  }

  // Update the allPosts declaration to ensure posts is always treated as an array and all data is valid
  const allPosts = [
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
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/categories">Categories</BreadcrumbLink>
        </BreadcrumbItem>
        {topic?.category && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to={`/categories/${topic.category.slug || ''}`}>
                {topic.category.name || 'Category'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{topic.title || 'Topic'}</BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
      </Breadcrumb>
      
      {/* Topic Header */}
      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{topic.title}</h1>
        <div className="text-sm text-muted-foreground">
          Started by {topic.author?.displayName || topic.author?.username || 'Unknown user'} on {formatDate(topic.createdAt)}
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
            <Card key={uniqueKey} id={`post-${post._id}`} className="relative">
              {index === 0 && (
                <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
                  <Badge variant="outline" className="bg-primary text-primary-foreground">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Topic
                  </Badge>
                </div>
              )}
              <CardHeader className="flex flex-row space-y-0 items-start">
                <div className="flex flex-1 items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${post.author?.username || 'unknown'}`} />
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{post.author?.displayName || post.author?.username || 'Unknown user'}</div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2 text-xs">{post.author?.role || 'user'}</Badge>
                      {post.createdAt && (
                        <span className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
                {post._id !== 'topic-content' && post.author && canManagePost(post.author._id) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`/posts/${post._id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
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
              <CardContent>
                {post.content ? (
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                  <div className="text-muted-foreground">No content</div>
                )}
              </CardContent>
              {post._id !== 'topic-content' && (
                <CardFooter className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleToggleLike(post._id)}
                            disabled={!isAuthenticated}
                            className={post.isLiked ? "text-primary" : ""}
                          >
                            <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? "fill-current" : ""}`} />
                            <span>{post.likes}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isAuthenticated ? (post.isLiked ? "Unlike" : "Like") : "Login to like"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              if (isAuthenticated) {
                                setReplyToPostId(post._id === replyToPostId ? null : post._id);
                                if (post._id !== replyToPostId) {
                                  setTimeout(() => {
                                    document.getElementById('reply-textarea')?.focus();
                                  }, 100);
                                }
                              }
                            }}
                            disabled={!isAuthenticated}
                            className={replyToPostId === post._id ? "text-primary" : ""}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            <span>Reply</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isAuthenticated ? "Reply to this post" : "Login to reply"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {post.updatedAt && post.createdAt && post.updatedAt !== post.createdAt && (
                    <div className="text-xs text-muted-foreground">
                      Edited {formatDate(post.updatedAt)}
                    </div>
                  )}
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
      
      {/* Reply Form */}
      {isAuthenticated ? (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center font-medium">
              {replyToPostId ? (
                <div className="flex items-center">
                  <span>Replying to a post</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setReplyToPostId(null)}
                    className="ml-2 h-6 text-muted-foreground"
                  >
                    (Cancel)
                  </Button>
                </div>
              ) : (
                <span>Add a reply</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              id="reply-textarea"
              placeholder="Write your reply..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-32"
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleNewPost}
              disabled={!newPostContent.trim() || isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post Reply"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="mt-8 bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Join the conversation</h3>
            <p className="text-muted-foreground text-center mb-4">
              You need to be logged in to post replies.
            </p>
            <div className="flex gap-4">
              <Button asChild variant="outline">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
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
            <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 