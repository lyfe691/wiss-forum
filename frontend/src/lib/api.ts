import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable credentials for cookie-based auth support
  withCredentials: true
});

// Log all requests for debugging
const logRequest = (config: any): any => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
};

// Log all responses for debugging
const logResponse = (response: any): any => {
  console.log(`API Response: ${response.status} ${response.config.url}`);
  return response;
};

// Add a request interceptor to attach the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Make sure we're sending a clean token without any potential "Bearer " prefix
      // that might have been accidentally stored
      const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
      
      // Ensure the Authorization header is properly formatted with Bearer prefix
      config.headers.Authorization = `Bearer ${cleanToken}`;
      console.log('Added token to request');
    } else {
      console.log('No token available');
    }
    return logRequest(config);
  },
  (error) => {
    console.error('Request error interceptor:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => logResponse(response),
  (error) => {
    const errorStatus = error.response?.status;
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    
    console.error(`API Error ${errorStatus}: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, 
                  error.response?.data || error.message);
    
    // Only redirect for non-auth endpoints with 401 errors
    // Skip redirects for auth-related endpoints to avoid loops
    if (errorStatus === 401 && !isAuthEndpoint) {
      console.warn('Authentication error on non-auth endpoint, redirecting to login');
      // Clear localStorage and redirect to login on auth error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // For auth endpoints that fail, we'll handle recovery in the AuthContext
    return Promise.reject(error);
  }
);

// Add a silent error handling utility
const silentAuth = async <T>(fn: () => Promise<T>, fallback?: T): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    // Suppress console error for expected auth failures
    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (data: { username: string; email: string; password: string; displayName: string }) => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  login: async (data: { username: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
  
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      return response.data;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },
  
  // Use this method for silent auth operations that shouldn't log errors
  silentGetCurrentUser: async () => {
    return silentAuth(async () => {
      const response = await api.get('/auth/me');
      return response.data;
    });
  },
  
  silentRefreshToken: async () => {
    return silentAuth(async () => {
      const response = await api.post('/auth/refresh-token');
      return response.data;
    });
  }
};

// User API
export const userAPI = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getPublicUsersList: async () => {
    const response = await api.get('/users/public');
    return response.data;
  },
  
  getPublicUserProfile: async (idOrUsername: string) => {
    const response = await api.get(`/users/profile/${idOrUsername}`);
    return response.data;
  },
  
  updateUserRole: async (userId: string, role: 'STUDENT' | 'TEACHER' | 'ADMIN') => {
    console.log(`API: Updating user ${userId} to role ${role}`);
    const response = await api.put(`/users/${userId}/role`, { role });
    console.log('API: Update role response:', response.data);
    return response.data;
  },
  
  getUserProfile: async () => {
    try {
      // Try the current user endpoint first (returns more details)
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      try {
        // Fallback to /auth/me which might have less data but is more reliable
        const authResponse = await api.get('/auth/me');
        return authResponse.data;
      } catch (authError) {
        // Fall back to using stored user if API calls fail
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
        throw error;
      }
    }
  },
  
  updateUserProfile: async (data: { username?: string; email?: string; displayName?: string; bio?: string }) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
  
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/users/password', data);
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  getCategoryByIdOrSlug: async (idOrSlug: string) => {
    const response = await api.get(`/categories/${idOrSlug}`);
    return response.data;
  },
  
  createCategory: async (data: { name: string; description: string; order?: number }) => {
    // Make sure we have a token before creating a category
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required to create a category');
    }
    
    // The token will be automatically added by the axios interceptor
    const response = await api.post('/categories', data);
    
    // Return the category data or created category
    return response.data.category || response.data;
  },
  
  updateCategory: async (
    id: string, 
    data: { 
      name?: string; 
      description?: string; 
      order?: number;
      isActive?: boolean 
    }
  ) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  
  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Topics API
export const topicsAPI = {
  getTopicsByCategory: async (categoryId: string, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/topics/category/${categoryId}?page=${page}&limit=${limit}`);
      
      // Handle different response structures
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.topics)) {
        return response.data.topics;
      } else if (response.data && typeof response.data === 'object') {
        console.warn('Unexpected topics response structure:', response.data);
        // Try to extract topics from common response patterns
        const possibleTopicsArray = response.data.topics || response.data.data || response.data.items || [];
        return Array.isArray(possibleTopicsArray) ? possibleTopicsArray : [];
      }
      
      // Default to empty array if we can't find topics
      console.warn('Could not extract topics array from response:', response.data);
      return [];
    } catch (error) {
      console.error(`Error fetching topics for category ${categoryId}:`, error);
      return [];
    }
  },
  
  getLatestTopics: async (page = 0, limit = 10) => {
    try {
      console.log(`Fetching latest topics - page ${page}, limit ${limit}`);
      // Note: Corrected to match spring pagination which starts at 0
      const response = await api.get(`/topics?page=${page}&size=${limit}&sort=createdAt&order=desc`);
      console.log('Latest topics raw response:', response.data);
      
      // Extract and log the total count for debugging
      const totalCount = response.data?.totalElements || 
                         response.data?.totalItems || 
                         response.data?.total || 
                         (Array.isArray(response.data?.content) ? response.data.content.length : 0);
      
      console.log(`Total topics count from API: ${totalCount}`);
      
      // Enhance the response with the count if it's missing
      const enhancedResponse = {
        topics: response.data?.content || [],
        totalTopics: totalCount,
        totalItems: totalCount,
        currentPage: response.data?.number || page,
        totalPages: response.data?.totalPages || 1
      };
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error fetching latest topics:', error);
      return {
        topics: [],
        totalTopics: 0,
        totalItems: 0,
        currentPage: page,
        totalPages: 1
      };
    }
  },
  
  getTopicByIdOrSlug: async (idOrSlug: string) => {
    if (!idOrSlug) {
      console.error('getTopicByIdOrSlug called with undefined/empty idOrSlug');
      throw new Error('Topic ID or slug is required');
    }
    
    try {
      console.log(`Requesting topic with ID/Slug: ${idOrSlug}`);
      const response = await api.get(`/topics/${idOrSlug}`);
      console.log('Raw topic response:', response.data);
      
      // Extract topic data, handling both direct and nested responses
      let topicData = response.data;
      
      // If the topic is nested under a 'topic' property, extract it
      if (response.data && response.data.topic && typeof response.data.topic === 'object') {
        topicData = response.data.topic;
        console.log('Extracted nested topic data:', topicData);
      }
      
      // Validate the topic data
      if (!topicData || !topicData._id) {
        console.error('Invalid or missing topic data:', topicData);
        throw new Error('Invalid topic data received from server');
      }
      
      // Increment the view count by calling the backend
      try {
        await api.post(`/topics/${topicData._id}/view`);
      } catch (viewError) {
        console.warn('Failed to increment view count:', viewError);
        // Continue anyway even if view count update fails
      }
      
      return topicData;
    } catch (error) {
      console.error(`Error fetching topic ${idOrSlug}:`, error);
      throw error;
    }
  },
  
  createTopic: async (data: { title: string; content: string; categoryId: string; tags?: string[] }) => {
    const response = await api.post('/topics', data);
    return response.data;
  },
  
  updateTopic: async (
    id: string, 
    data: { 
      title?: string; 
      categoryId?: string; 
      tags?: string[] 
    }
  ) => {
    const response = await api.put(`/topics/${id}`, data);
    return response.data;
  },
  
  deleteTopic: async (id: string) => {
    try {
      const response = await api.delete(`/topics/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting topic:', error);
      throw error;
    }
  },
};

// Posts API
export const postsAPI = {
  getPostsByTopic: async (topicId: string, page = 1, limit = 10) => {
    if (!topicId) {
      console.error('getPostsByTopic called with undefined/empty topicId');
      throw new Error('Topic ID is required');
    }
    
    // Validate that topicId is a proper ObjectId format
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(topicId)) {
      console.error(`Invalid ObjectId format for topicId: ${topicId}`);
      throw new Error('Invalid topic ID format');
    }
    
    try {
      console.log(`Requesting posts for topic ID: ${topicId}`);
      const response = await api.get(`/posts/topic/${topicId}?page=${page}&limit=${limit}`);
      
      // Get current user ID to check if posts are liked by current user
      const userString = localStorage.getItem('user');
      const currentUserId = userString ? JSON.parse(userString)._id : null;
      
      // Process the response to transform the likes array into count and isLiked
      const processPost = (post: any) => {
        // Make a copy of the post to avoid mutating the original
        const processedPost = { ...post };
        
        // Process likes data
        if (Array.isArray(processedPost.likes)) {
          processedPost.isLiked = currentUserId ? processedPost.likes.includes(currentUserId) : false;
          processedPost.likes = processedPost.likes.length;
        } else {
          // If likes is not an array (perhaps already processed), ensure it's a number
          processedPost.likes = typeof processedPost.likes === 'number' ? processedPost.likes : 0;
          // Make sure isLiked is a boolean
          processedPost.isLiked = !!processedPost.isLiked;
        }
        
        return processedPost;
      };
      
      // Handle different response structures to ensure we always return an array
      let posts = [];
      
      if (Array.isArray(response.data)) {
        posts = response.data.map(processPost);
      } else if (response.data && Array.isArray(response.data.posts)) {
        posts = response.data.posts.map(processPost);
      } else if (response.data && typeof response.data === 'object') {
        console.warn('Unexpected posts response structure:', response.data);
        // Try to extract posts from common response patterns
        const possiblePostsArray = response.data.posts || response.data.data || response.data.items || [];
        posts = Array.isArray(possiblePostsArray) ? possiblePostsArray.map(processPost) : [];
      } else {
        // Default to empty array if we can't find posts
        console.warn('Could not extract posts array from response:', response.data);
        posts = [];
      }
      
      console.log('Processed posts with likes:', posts);
      return posts;
    } catch (error) {
      console.error(`Error fetching posts for topic ${topicId}:`, error);
      throw error;
    }
  },
  
  createPost: async (data: { content: string; topicId: string; replyTo?: string }) => {
    try {
      const response = await api.post('/posts', data);
      
      // Log the raw response to debug
      console.log('Raw API response from createPost:', response.data);
      
      // Extract the post data from the response
      const postData = response.data.post || response.data;
      
      // Process and validate the response
      if (!postData) {
        console.warn('Empty response from createPost API');
        // Create a minimal valid post with the data we sent
        return {
          _id: `temp-${Date.now()}`,
          content: data.content,
          topic: data.topicId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: 0,
          isLiked: false
        };
      }
      
      // Ensure all required fields exist
      const processedPost = {
        ...postData,
        _id: postData._id || `temp-${Date.now()}`,
        content: postData.content || data.content, // Use input if response lacks content
        topic: postData.topic || data.topicId,
        createdAt: postData.createdAt || new Date().toISOString(),
        updatedAt: postData.updatedAt || new Date().toISOString(),
        likes: Array.isArray(postData.likes) ? postData.likes.length : 0,
        isLiked: Array.isArray(postData.likes) ? postData.likes.includes(postData.authorId) : false
      };
      
      return processedPost;
    } catch (error) {
      console.error('Error in createPost:', error);
      throw error;
    }
  },
  
  updatePost: async (id: string, data: { content: string }) => {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },
  
  deletePost: async (id: string) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
  
  toggleLike: async (id: string) => {
    try {
      console.log(`Toggling like for post ID: ${id}`);
      const response = await api.post(`/posts/${id}/like`);
      
      // Log the response to help debug
      console.log('Like toggle response:', response.data);
      
      // Extract the updated post data from the response
      const updatedPost = response.data.post || response.data;
      
      if (!updatedPost) {
        console.warn('Empty response from toggleLike API');
        return { success: true }; // Return minimal success response
      }
      
      // Get current user ID from localStorage to check if post is liked by current user
      const userString = localStorage.getItem('user');
      const currentUserId = userString ? JSON.parse(userString)._id : null;
      
      // Process the response to get consistent shape
      return {
        success: true,
        post: {
          ...updatedPost,
          likes: Array.isArray(updatedPost.likes) ? updatedPost.likes.length : updatedPost.likes || 0,
          isLiked: Array.isArray(updatedPost.likes) && currentUserId
            ? updatedPost.likes.includes(currentUserId)
            : updatedPost.isLiked || false
        }
      };
    } catch (error) {
      console.error(`Error toggling like for post ${id}:`, error);
      throw error;
    }
  },
};

// Statistics API
export const statsAPI = {
  getStats: async () => {
    try {
      // Simplify to a single approach - just fetch the collections directly
      console.log("Getting stats by directly fetching collections...");
      
      // Get users
      const usersRequest = await api.get('/users/public');
      const users = Array.isArray(usersRequest.data) ? usersRequest.data : [];
      const userCount = users.length;
      console.log(`User count: ${userCount}`);
      
      // Get categories
      const categoriesRequest = await api.get('/categories');
      const categories = Array.isArray(categoriesRequest.data) ? categoriesRequest.data : [];
      const categoryCount = categories.length;
      console.log(`Category count: ${categoryCount}`);
      
      // Get topics count - use the paginated endpoint
      let topicCount = 0;
      try {
        const topicsData = await api.get('/topics?page=0&size=1');
        // Extract the count from page metadata
        topicCount = topicsData.data?.totalElements || 0;
      } catch (error) {
        console.error("Error fetching topics count:", error);
      }
      console.log(`Topic count: ${topicCount}`);
      
      return {
        userCount,
        categoryCount,
        topicCount,
        postCount: 0 // Simplified
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      return {
        userCount: 0,
        categoryCount: 0,
        topicCount: 0,
        postCount: 0
      };
    }
  }
};

export default api; 