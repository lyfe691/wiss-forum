import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Make sure we're sending a clean token without any "Bearer " prefix
      const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const errorStatus = error.response?.status;
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    
    // For non-auth endpoints with 401 errors, redirect to login
    if (errorStatus === 401 && !isAuthEndpoint && !error.config?.__isRetry) {
      // Try token refresh once
      try {
        const refreshResponse = await api.post('/auth/refresh-token');
        
        if (refreshResponse.data && refreshResponse.data.token) {
          const newToken = refreshResponse.data.token.replace(/^Bearer\s+/i, '').trim();
          localStorage.setItem('token', newToken);
          
          // Retry the original request with the new token
          const originalRequest = error.config;
          originalRequest.__isRetry = true;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Clear localStorage and redirect to login on auth error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper to normalize data with consistent id fields
const normalizeId = (item: any) => {
  if (!item) return item;
  return {
    ...item,
    _id: item._id || item.id,
    id: item.id || item._id
  };
};

// Auth API
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
    return response.data;
  },
  
  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    return response.data;
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
    const response = await api.get(`/users/${username}`);
    return response.data;
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
    const response = await api.put(`/users/${userId}/role`, role);
    return response.data;
  },
  
  getUserProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  updateUserProfile: async (data: { username?: string; email?: string; displayName?: string; bio?: string }) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
  
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/users/profile/password', data);
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
  getTopicsByCategory: async (categoryId: string, page = 1, limit = 10) => {
    // Note: Spring pagination is 0-based, but our frontend uses 1-based pagination
    const response = await api.get(`/topics/category/${categoryId}?page=${page-1}&size=${limit}`);
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.content)) {
      return response.data.content;
    } else if (response.data && Array.isArray(response.data.topics)) {
      return response.data.topics;
    }
    
    return [];
  },
  
  getLatestTopics: async (page = 0, limit = 10) => {
    const response = await api.get(`/topics?page=${page}&size=${limit}&sort=createdAt&order=desc`);
    
    const totalCount = response.data?.totalElements || 
                      response.data?.totalItems || 
                      response.data?.total || 
                      (Array.isArray(response.data?.content) ? response.data.content.length : 0);
    
    return {
      topics: response.data?.content || [],
      totalTopics: totalCount,
      totalItems: totalCount,
      currentPage: response.data?.number || page,
      totalPages: response.data?.totalPages || 1
    };
  },
  
  getTopicByIdOrSlug: async (idOrSlug: string) => {
    try {
      const response = await api.get(`/topics/${idOrSlug}`);
      return normalizeId(response.data);
    } catch (error) {
      console.error(`Error fetching topic ${idOrSlug}:`, error);
      throw error;
    }
  },
  
  createTopic: async (data: { title: string; content: string; categoryId: string; tags?: string[] }) => {
    const response = await api.post('/topics', data);
    
    let topicData = response.data;
    return {
      ...topicData,
      _id: topicData._id || topicData.id,
      id: topicData.id || topicData._id
    };
  },
  
  deleteTopic: async (id: string) => {
    const response = await api.delete(`/topics/${id}`);
    return response.data;
  }
};

// Posts API
export const postsAPI = {
  getPostsByTopic: async (topicId: string, page = 1, limit = 10) => {
    if (!topicId) {
      throw new Error('Topic ID is required');
    }
    
    const response = await api.get(`/posts/topic/${topicId}?page=${page-1}&limit=${limit}`);
    
    // Get current user ID to check if posts are liked by current user
    const userString = localStorage.getItem('user');
    const currentUserId = userString ? JSON.parse(userString)._id : null;
    
    // Process the response to transform the likes array
    const processPost = (post: any) => {
      const processedPost = { ...post };
      
      if (Array.isArray(processedPost.likes)) {
        processedPost.isLiked = currentUserId ? processedPost.likes.includes(currentUserId) : false;
        processedPost.likes = processedPost.likes.length;
      } else {
        processedPost.likes = typeof processedPost.likes === 'number' ? processedPost.likes : 0;
        processedPost.isLiked = !!processedPost.isLiked;
      }
      
      return processedPost;
    };
    
    if (Array.isArray(response.data)) {
      return response.data.map(processPost);
    } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
      return response.data.content.map(processPost);
    } else if (response.data && Array.isArray(response.data.posts)) {
      return response.data.posts.map(processPost);
    }
    
    return [];
  },
  
  createPost: async (data: { content: string; topicId: string; replyTo?: string }) => {
    const response = await api.post('/posts', data);
    return response.data;
  },
  
  deletePost: async (id: string) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
  
  toggleLike: async (id: string) => {
    const response = await api.post(`/posts/${id}/like`);
    
    // Extract the updated post data from the response
    const updatedPost = response.data.post || response.data;
    
    // Get current user ID from localStorage
    const userString = localStorage.getItem('user');
    const currentUserId = userString ? JSON.parse(userString)._id : null;
    
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
      return normalizeId(response.data);
    } catch (error) {
      console.error(`Error fetching post ${id}:`, error);
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
        // Continue if error
      }
      
      return {
        userCount,
        categoryCount,
        topicCount,
        postCount: 0 // Simplified
      };
    } catch (error) {
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