import axios from 'axios';
import { Role, roleUtils } from './types';


// API
// used for a lot.
// such as making requests to the backend etc.


// create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// add a request interceptor to attach the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const errorStatus = error.response?.status;
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    
    // handle 404 errors specifically to provide better error messages
    if (errorStatus === 404) {
      console.error('Resource not found:', error.config?.url);
      // we'll let the component handle this error with appropriate iu
      return Promise.reject({
        ...error,
        message: error.response?.data?.message || 'Resource not found'
      });
    }
    
    // for non-auth endpoints with 401 errors, redirect to login
    if (errorStatus === 401 && !isAuthEndpoint && !error.config?.__isRetry) {
      // try token refresh once
      try {
        const refreshResponse = await api.post('/auth/refresh-token');
        
        if (refreshResponse.data && refreshResponse.data.token) {
          const newToken = refreshResponse.data.token.replace(/^Bearer\s+/i, '').trim();
          localStorage.setItem('token', newToken);
          
          // retry the original request with the new token
          const originalRequest = error.config;
          originalRequest.__isRetry = true;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // clear localStorage and redirect to login on auth error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// =============================================================================
// STANDARDIZED RESPONSE NORMALIZATION FUNCTIONS
// =============================================================================

/**
 * Normalizes ID fields to ensure both _id and id exist
 */
const normalizeId = (item: any) => {
  if (!item) return item;
  const id = item._id || item.id;
  return {
    ...item,
    _id: id,
    id: id
  };
};

/**
 * Normalizes role field from various backend formats to consistent frontend format
 */
const normalizeRole = (role: any): Role => {
  if (!role) return Role.STUDENT;
  
  // Handle string roles
  if (typeof role === 'string') {
    return roleUtils.normalizeRole(role);
  }
  
  // Handle Java enum objects
  if (typeof role === 'object' && role !== null) {
    // Try .name property first (Java enum)
    if ('name' in role && typeof role.name === 'string') {
      return roleUtils.normalizeRole(role.name);
    }
    
    // Try converting object to string
    const roleStr = String(role);
    if (roleStr.includes('_')) {
      // Handle "ROLE_ADMIN" format
      const rolePart = roleStr.split('_')[1];
      return roleUtils.normalizeRole(rolePart);
    }
    
    return roleUtils.normalizeRole(roleStr);
  }
  
  return Role.STUDENT;
};

/**
 * Normalizes user object with consistent fields
 */
const normalizeUser = (user: any) => {
  if (!user) return null;
  
  const normalized = normalizeId(user);
  return {
    ...normalized,
    role: normalizeRole(user.role),
    displayName: user.displayName || user.username || '',
    avatar: user.avatar || undefined,
    bio: user.bio || undefined,
    githubUrl: user.githubUrl || undefined,
    websiteUrl: user.websiteUrl || undefined,
    linkedinUrl: user.linkedinUrl || undefined,
    twitterUrl: user.twitterUrl || undefined,
  };
};

/**
 * Normalizes auth response (login/register)
 */
const normalizeAuthResponse = (response: any, fallbackData?: any) => {
  if (!response) return null;
  
  // Handle message-only responses (like successful registration)
  if (response.message && !response.token) {
    return {
      message: response.message,
      success: true
    };
  }
  
  const role = normalizeRole(response.role);
  
  return {
    token: response.token || '',
    id: response.id || '',
    username: response.username || fallbackData?.username || '',
    email: response.email || fallbackData?.email || '',
    displayName: response.displayName || response.username || fallbackData?.displayName || fallbackData?.username || '',
    role: role,
    avatar: response.avatar || '',
    message: response.message || undefined
  };
};

/**
 * Normalizes topic object
 */
const normalizeTopic = (topic: any) => {
  if (!topic) return null;
  
  const normalized = normalizeId(topic);
  return {
    ...normalized,
    author: topic.author ? normalizeUser(topic.author) : null,
    category: topic.category ? normalizeId(topic.category) : null,
    tags: Array.isArray(topic.tags) ? topic.tags : [],
    views: topic.views || 0,
    replies: topic.replies || 0,
    isLocked: !!topic.isLocked,
    isPinned: !!topic.isPinned
  };
};

/**
 * Normalizes post object
 */
const normalizePost = (post: any) => {
  if (!post) return null;
  
  const normalized = normalizeId(post);
  
  // Get current user ID for like status
  const userString = localStorage.getItem('user');
  const currentUserId = userString ? JSON.parse(userString)._id : null;
  
  // Handle likes field (can be array of IDs or number)
  let likes = 0;
  let isLiked = false;
  
  if (Array.isArray(post.likes)) {
    likes = post.likes.length;
    isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
  } else {
    likes = typeof post.likes === 'number' ? post.likes : 0;
    isLiked = !!post.isLiked;
  }
  
  return {
    ...normalized,
    author: post.author ? normalizeUser(post.author) : null,
    likes,
    isLiked,
    replyTo: post.replyTo || null,
    replies: Array.isArray(post.replies) ? post.replies.map(normalizePost) : []
  };
};

/**
 * Normalizes paginated response
 */
const normalizePaginatedResponse = (response: any, itemNormalizer?: (item: any) => any) => {
  if (!response) return { items: [], pagination: null };
  
  // Handle direct array response
  if (Array.isArray(response)) {
    const items = itemNormalizer ? response.map(itemNormalizer) : response;
    return {
      items,
      pagination: {
        currentPage: 0,
        totalPages: 1,
        totalItems: items.length,
        hasNext: false,
        hasPrevious: false
      }
    };
  }
  
  // Handle Spring Boot Page response
  if (response.content && Array.isArray(response.content)) {
    const items = itemNormalizer ? response.content.map(itemNormalizer) : response.content;
    return {
      items,
      pagination: {
        currentPage: response.number || 0,
        totalPages: response.totalPages || 1,
        totalItems: response.totalElements || items.length,
        hasNext: !(response.last === true),
        hasPrevious: !(response.first === true)
      }
    };
  }
  
  // Handle other paginated formats
  const items = response.items || response.data || response.topics || response.posts || [];
  const normalizedItems = itemNormalizer ? items.map(itemNormalizer) : items;
  
  return {
    items: normalizedItems,
    pagination: {
      currentPage: response.currentPage || response.page || 0,
      totalPages: response.totalPages || 1,
      totalItems: response.totalItems || response.totalElements || response.total || normalizedItems.length,
      hasNext: response.hasNext || false,
      hasPrevious: response.hasPrevious || false
    }
  };
};

// =============================================================================
// AUTH API
// =============================================================================

export const authAPI = {
  register: async (data: { username: string; email: string; password: string; displayName: string }) => {
    try {
      console.log('Sending register request with:', { username: data.username });
      const response = await api.post('/auth/register', data);
      console.log('Raw register response:', response.data);
      
      // Spring backend may return a MessageResponse instead of a JwtResponse
      // Check if we have a success message without token/user data
      if (response.data.message && !response.data.token) {
        console.log('Registration successful, but no token/user data');
        return {
          message: response.data.message,
          success: true
        };
      }
      
      // Otherwise, normalize the response like we do for login
      // Process the role value if it exists
      let role = 'student';
      if (response.data.role) {
        if (typeof response.data.role === 'string') {
          role = response.data.role.toLowerCase();
        } else if (typeof response.data.role === 'object' && response.data.role !== null) {
          if ('name' in response.data.role) {
            role = response.data.role.name.toLowerCase();
          } else {
            const roleStr = String(response.data.role).toLowerCase();
            if (roleStr.includes('_')) {
              role = roleStr.split('_')[1];
            } else if (roleStr === 'student' || roleStr === 'teacher' || roleStr === 'admin') {
              role = roleStr;
            }
          }
        }
      }
      
      return {
        token: response.data.token || '',
        id: response.data.id || '',
        username: response.data.username || data.username,
        email: response.data.email || data.email,
        displayName: response.data.displayName || data.displayName,
        role: role,
        avatar: response.data.avatar || '',
        message: response.data.message || 'Registration successful'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  login: async (data: { username: string; password: string }) => {
    try {
      // Check if the username field actually contains an email
      const isEmail = /\S+@\S+\.\S+/.test(data.username);
      console.log('Sending login request with:', { 
        username: data.username, 
        isEmail: isEmail 
      });
      
      // When it's an email, modify the request to tell the backend
      const requestData = isEmail 
        ? { email: data.username, password: data.password }
        : { username: data.username, password: data.password };
        
      const response = await api.post('/auth/login', requestData);
      const responseData = response.data;
      console.log('Raw login response:', responseData);
      
      // Process the role value from Java Spring's enum object
      let role = 'student';
      if (responseData.role) {
        if (typeof responseData.role === 'string') {
          role = responseData.role.toLowerCase();
        } else if (typeof responseData.role === 'object' && responseData.role !== null) {
          // For Java enums, check if it has a name property first
          if ('name' in responseData.role) {
            role = responseData.role.name.toLowerCase();
          } else {
            // Try to convert the enum to a string
            const roleStr = String(responseData.role).toLowerCase();
            // Extract just the role name if format is like "ROLE_STUDENT" or "STUDENT"
            if (roleStr.includes('_')) {
              role = roleStr.split('_')[1];
            } else if (roleStr === 'student' || roleStr === 'teacher' || roleStr === 'admin') {
              role = roleStr;
            }
          }
        }
      }
      
      console.log('Processed role:', role);
      
      // Ensure we have values for all fields with fallbacks
      const normalizedResponse = {
        token: responseData.token || '',
        id: responseData.id || '',
        username: responseData.username || data.username,
        email: responseData.email || '',
        displayName: responseData.displayName || responseData.username || data.username,
        role: role,
        avatar: responseData.avatar || ''
      };
      
      console.log('Normalized response:', normalizedResponse);
      return normalizedResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return normalizeUser(response.data);
  },
  
  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    return normalizeAuthResponse(response.data);
  },
  
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return {
        success: true,
        message: response.data.message || 'Password reset instructions sent successfully.'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },
  
  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return {
        success: true,
        message: response.data.message || 'Password has been reset successfully.'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
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
  
  getUserByUsername: async (username: string) => {
    try {
      console.log(`API call: Getting user by username: ${username}`);
      const response = await api.get(`/users/${username}`);
      const userData = response.data;
      
      // Normalize the response
      return normalizeId({
        ...userData,
        role: typeof userData.role === 'string' 
          ? userData.role.toLowerCase() 
          : (userData.role && userData.role.name 
              ? userData.role.name.toLowerCase() 
              : 'student')
      });
    } catch (error) {
      console.error(`Error fetching user by username ${username}:`, error);
      throw error;
    }
  },
  
  getPublicUserProfile: async (usernameOrId: string) => {
    try {
      // First try by username
      const response = await api.get(`/users/${usernameOrId}`);
      return normalizeId(response.data);
    } catch (error) {
      console.error(`Error fetching user profile for ${usernameOrId}:`, error);
      throw error;
    }
  },
  
  updateUserRole: async (userId: string, role: string) => {
    // Since we're sending plain text, we need to set the Content-Type explicitly
    const response = await api.put(`/users/${userId}/role`, role, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    return response.data;
  },
  
  getUserProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  updateUserProfile: async (data: { 
    username?: string; 
    email?: string; 
    displayName?: string; 
    bio?: string;
    githubUrl?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
  }) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
  
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/users/profile/password', data);
    return response.data;
  },
  
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  uploadAvatar: async (formData: FormData) => {
    const response = await api.post('/users/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  getAllCategories: async () => {
    try {
      const response = await api.get('/categories');
      
      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }
      
      // Normalize all categories to have both id and _id fields for consistency
      return response.data.map(category => normalizeId(category));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },
  
  getCategoryByIdOrSlug: async (idOrSlug: string) => {
    try {
      const response = await api.get(`/categories/${idOrSlug}`);
      return normalizeId(response.data);
    } catch (error) {
      console.error(`Error fetching category ${idOrSlug}:`, error);
      throw error;
    }
  },
  
  createCategory: async (data: { name: string; description: string; order?: number }) => {
    // Generate a slug from the name
    const slug = data.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Add the slug to the data
    const categoryData = {
      ...data,
      slug,
      isActive: true
    };
    
    const response = await api.post('/categories', categoryData);
    return normalizeId(response.data);
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
  getTopicsByCategory: async (categoryId: string, page = 0, limit = 10) => {
    const response = await api.get(`/topics/category/${categoryId}?page=${page}&size=${limit}`);
    const normalized = normalizePaginatedResponse(response.data, normalizeTopic);
    return normalized.items; // Return just items for backward compatibility
  },
  
  getLatestTopics: async (page = 0, limit = 10) => {
    const response = await api.get(`/topics?page=${page}&size=${limit}&sort=createdAt&order=desc`);
    const normalized = normalizePaginatedResponse(response.data, normalizeTopic);
    
    return {
      topics: normalized.items,
      totalTopics: normalized.pagination?.totalItems || 0,
      totalItems: normalized.pagination?.totalItems || 0,
      currentPage: normalized.pagination?.currentPage || 0,
      totalPages: normalized.pagination?.totalPages || 1
    };
  },
  
  getTopicByIdOrSlug: async (idOrSlug: string) => {
    try {
      const response = await api.get(`/topics/${idOrSlug}`);
      return normalizeTopic(response.data);
    } catch (error) {
      console.error(`Error fetching topic ${idOrSlug}:`, error);
      throw error;
    }
  },
  
  createTopic: async (data: { title: string; content: string; categoryId: string; tags?: string[] }) => {
    const response = await api.post('/topics', data);
    return normalizeTopic(response.data);
  },


  
  deleteTopic: async (id: string) => {
    if (!id) {
      console.error('Cannot delete topic: No ID provided');
      throw new Error('Topic ID is required for deletion');
    }
    
    try {
      console.log(`Deleting topic with ID: ${id}`);
      const response = await api.delete(`/topics/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting topic ${id}:`, error);
      
      // Provide more context in the error
      if (error.response?.status === 404) {
        throw new Error(`Topic with ID ${id} not found`);
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this topic');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw error;
    }
  },
  
  incrementViewCount: async (topicId: string) => {
    try {
      await api.post(`/topics/${topicId}/view`);
    } catch (error) {
      console.error('Failed to increment view count:', error);
      throw error;
    }
  },
};

// Posts API
export const postsAPI = {
  getPostsByTopic: async (topicId: string, page = 1, limit = 10) => {
    if (!topicId) {
      throw new Error('Topic ID is required');
    }
    
    const response = await api.get(`/posts/topic/${topicId}?page=${page-1}&limit=${limit}`);
    const normalized = normalizePaginatedResponse(response.data, normalizePost);
    return normalized.items; // Return just items for backward compatibility
  },
  
  createPost: async (data: { content: string; topicId: string; replyTo?: string }) => {
    const response = await api.post('/posts', data);
    return normalizePost(response.data);
  },
  
  deletePost: async (id: string) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
  
  toggleLike: async (id: string) => {
    // Get current user ID from localStorage
    const userString = localStorage.getItem('user');
    const currentUserId = userString ? JSON.parse(userString)._id : null;
    
    // Get current post to check if it's already liked
    const checkResponse = await api.get(`/posts/${id}`);
    const currentPost = checkResponse.data;
    const isCurrentlyLiked = Array.isArray(currentPost.likes) && 
      currentUserId ? currentPost.likes.includes(currentUserId) : false;
    
    // Call the appropriate endpoint based on current like status
    const response = await api.post(`/posts/${id}/${isCurrentlyLiked ? 'unlike' : 'like'}`);
    
    // Extract the updated post data from the response
    const updatedPost = response.data.post || response.data;
    
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
  },
  
  getPostById: async (id: string) => {
    try {
      const response = await api.get(`/posts/${id}`);
      return normalizePost(response.data);
    } catch (error) {
      console.error(`Error fetching post ${id}:`, error);
      throw error;
    }
  },

  updatePost: async (id: string, data: { content: string }) => {
    try {
      const response = await api.put(`/posts/${id}`, data);
      return normalizePost(response.data);
    } catch (error) {
      console.error(`Error updating post ${id}:`, error);
      throw error;
    }
  },
};

// Statistics API
export const statsAPI = {
  getStats: async () => {
    try {
      // Get users
      const usersRequest = await api.get('/users/public');
      const users = Array.isArray(usersRequest.data) ? usersRequest.data : [];
      const userCount = users.length;
      
      // Get categories
      const categoriesRequest = await api.get('/categories');
      const categories = Array.isArray(categoriesRequest.data) ? categoriesRequest.data : [];
      const categoryCount = categories.length;
      
      // Get topics count
      let topicCount = 0;
      try {
        const topicsData = await api.get('/topics?page=0&size=1');
        topicCount = topicsData.data?.totalElements || 0;
      } catch (error) {
      }
      
      return {
        userCount,
        categoryCount,
        topicCount,
        postCount: 0 // simplified
      };
    } catch (error) {
      return {
        userCount: 0,
        categoryCount: 0,
        topicCount: 0,
        postCount: 0
      };
    }
  },

  // New analytics functions
  getAnalyticsData: async () => {
    try {
      // Fetch all data concurrently
      const [usersData, categoriesData, leaderboardData, topicsData] = await Promise.all([
        api.get('/users/public'),
        api.get('/categories'),
        api.get('/users/leaderboard?type=enhanced'),
        api.get('/topics?page=0&size=1000&sort=createdAt&order=desc') // Get up to 1000 recent topics
      ]);

      const users = Array.isArray(usersData.data) ? usersData.data : [];
      const categories = Array.isArray(categoriesData.data) ? categoriesData.data : [];
      const leaderboard = Array.isArray(leaderboardData.data) ? leaderboardData.data : [];
      
      // Extract topics from paginated response
      const topics = topicsData.data?.content || topicsData.data || [];

      // Process user registration data by month
      const userRegistrations = users.reduce((acc: any, user: any) => {
        if (user.createdAt) {
          const date = new Date(user.createdAt);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          acc[monthYear] = (acc[monthYear] || 0) + 1;
        }
        return acc;
      }, {});

      // Process topics creation data by month
      const topicCreations = Array.isArray(topics) ? topics.reduce((acc: any, topic: any) => {
        if (topic.createdAt) {
          const date = new Date(topic.createdAt);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          acc[monthYear] = (acc[monthYear] || 0) + 1;
        }
        return acc;
      }, {}) : {};

      // Process user activity data
      const totalTopics = leaderboard.reduce((sum: number, user: any) => sum + (user.topicsCreated || 0), 0);
      const totalPosts = leaderboard.reduce((sum: number, user: any) => sum + (user.postsCreated || 0), 0);
      const totalLikes = leaderboard.reduce((sum: number, user: any) => sum + (user.likesReceived || 0), 0);

      // User role distribution
      const roleDistribution = users.reduce((acc: any, user: any) => {
        const role = user.role || 'STUDENT';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      // Top performers
      const topPerformers = leaderboard.slice(0, 10).map((user: any) => ({
        _id: user._id || user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        totalScore: user.totalScore,
        level: user.level,
        topicsCreated: user.topicsCreated || 0,
        postsCreated: user.postsCreated || 0,
        likesReceived: user.likesReceived || 0
      }));

      // Activity over time (last 6 months) - using REAL data
      // Calculate average posts per topic from real data
      const avgPostsPerTopic = totalTopics > 0 ? totalPosts / totalTopics : 2.5;
      
      const activityData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        const monthTopics = topicCreations[monthYear] || 0;
        const monthRegistrations = userRegistrations[monthYear] || 0;
        
        activityData.push({
          month: monthName,
          registrations: monthRegistrations,
          topics: monthTopics,
          posts: Math.round(monthTopics * avgPostsPerTopic) // Use real ratio from total data
        });
      }

      return {
        overview: {
          totalUsers: users.length,
          totalCategories: categories.length,
          totalTopics: totalTopics,
          totalPosts: totalPosts,
          totalLikes: totalLikes
        },
        registrations: Object.entries(userRegistrations).map(([month, count]) => ({
          month,
          count: count as number
        })),
        roleDistribution: Object.entries(roleDistribution).map(([role, count]) => ({
          role,
          count: count as number
        })),
        topPerformers,
        activityData
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      return {
        overview: {
          totalUsers: 0,
          totalCategories: 0,
          totalTopics: 0,
          totalPosts: 0,
          totalLikes: 0
        },
        registrations: [],
        roleDistribution: [],
        topPerformers: [],
        activityData: []
      };
    }
  }
};

export const usersAPI = {
  getUserLeaderboard: async (type: string = 'enhanced') => {
    try {
      const response = await api.get(`/users/leaderboard?type=${type}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },
  
  getUserGamificationStats: async () => {
    try {
      const response = await api.get('/users/profile/gamification');
      return response.data || {};
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
      return {};
    }
  },

  getPublicUserGamificationStats: async (username: string) => {
    try {
      console.log(`API: Calling /users/${username}/gamification`);
      const response = await api.get(`/users/${username}/gamification`);
      console.log(`API: Response for ${username}:`, response.data);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching public gamification stats:', error);
      console.error(`API: Failed to fetch stats for username: ${username}`);
      // Return default stats structure if API fails
      return {
        totalScore: 0,
        level: 1,
        topicsCreated: 0,
        postsCreated: 0,
        likesReceived: 0,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
        achievements: [],
        levelProgress: 0,
        pointsToNextLevel: 50
      };
    }
  },
};

export default api;