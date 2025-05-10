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
      console.log('Added token to request', config.url, cleanToken.substring(0, 10) + '...');
    } else {
      console.log('No token available for request to', config.url);
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
  async (error) => {
    const errorStatus = error.response?.status;
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    const isAdminEndpoint = error.config?.url?.includes('/admin') || 
                          error.config?.url?.includes('/categories') && 
                          (error.config?.method === 'post' || error.config?.method === 'put' || error.config?.method === 'delete');
    const isTopicCreateEndpoint = error.config?.url?.includes('/topics') && error.config?.method === 'post';
    
    console.error(`API Error ${errorStatus}: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, 
                  error.response?.data || error.message);
    
    // For admin endpoints or topic creation, try token refresh once
    if ((isAdminEndpoint || isTopicCreateEndpoint) && errorStatus === 401 && !error.config?.__isRetry) {
      console.warn('Admin or topic creation endpoint authentication error, attempting token refresh');
      
      try {
        // Try direct token refresh
        const originalRequest = error.config;
        originalRequest.__isRetry = true;
        
        // Get a new token
        const refreshResponse = await api.post('/auth/refresh-token');
        
        if (refreshResponse.data && refreshResponse.data.token) {
          const newToken = refreshResponse.data.token.replace(/^Bearer\s+/i, '').trim();
          localStorage.setItem('token', newToken);
          console.log('New token obtained:', newToken.substring(0, 10) + '...');
          
          // Update user data if available
          if (refreshResponse.data.id || refreshResponse.data._id) {
            const userData = {
              _id: refreshResponse.data.id || refreshResponse.data._id,
              username: refreshResponse.data.username,
              email: refreshResponse.data.email,
              displayName: refreshResponse.data.displayName,
              role: refreshResponse.data.role.toLowerCase(),
              avatar: refreshResponse.data.avatar
            };
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('Updated user data in localStorage for', userData.username, 'with role', userData.role);
          }
          
          // Explicitly set the Authorization header with the new token
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newToken}`
          };
          
          // Retry the original request with the new token
          console.log('Retrying request with new token...');
          return axios(originalRequest);  // Use axios directly, not the api instance
        }
      } catch (refreshError) {
        console.warn('Token refresh failed, letting component handle the error', refreshError);
      }
      
      // Let the component handle the error if refresh fails
      return Promise.reject(error);
    }
    
    // Only redirect for non-auth endpoints with 401 errors
    // Skip redirects for auth-related endpoints to avoid loops
    if (errorStatus === 401 && !isAuthEndpoint && !isAdminEndpoint && !isTopicCreateEndpoint) {
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
    try {
      const response = await api.get(`/users/profile/${idOrUsername}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get user profile for ${idOrUsername}:`, error);
      throw error;
    }
  },
  
  updateUserRole: async (userId: string, role: 'student' | 'teacher' | 'admin' | 'STUDENT' | 'TEACHER' | 'ADMIN') => {
    // Convert lowercase roles to uppercase for the backend
    const normalizedRole = role.toUpperCase();
    console.log(`API: Updating user ${userId} to role ${normalizedRole}`);
    const response = await api.put(`/users/${userId}/role`, { role: normalizedRole });
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
    try {
      const response = await api.put('/users/profile', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  },
  
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await api.put('/users/profile/password', data);
      return response.data;
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  },
};

// Categories API
export const categoriesAPI = {
  getAllCategories: async () => {
    try {
      console.log('Fetching all categories...');
      const response = await api.get('/categories');
      
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('Unexpected response format from categories API:', response.data);
        return [];
      }
      
      // Normalize all categories to have both id and _id fields for consistency
      const normalizedCategories = response.data.map(category => {
        // Spring returns objects with 'id' field, frontend expects '_id'
        if (category.id && !category._id) {
          return {
            ...category,
            _id: category.id  // Ensure _id exists for frontend compatibility
          };
        }
        return category;
      });
      
      // Add some logging for debugging
      console.log(`Retrieved ${normalizedCategories.length} categories:`, 
        normalizedCategories.map(c => ({name: c.name, slug: c.slug, id: c.id, _id: c._id}))
      );
      
      return normalizedCategories;
    } catch (error: any) {
      console.error('Failed to fetch categories:', 
        error.response?.status,
        error.response?.data || error.message
      );
      // Return empty array instead of failing to avoid breaking the UI
      return [];
    }
  },
  
  getCategoryByIdOrSlug: async (idOrSlug: string) => {
    try {
      console.log(`Fetching category with ID/Slug: ${idOrSlug}`);
      const response = await api.get(`/categories/${idOrSlug}`);
      
      if (!response.data) {
        console.warn('Empty response from category API');
        throw new Error('Category not found');
      }
      
      // Spring returns objects with 'id' field, frontend expects '_id'
      let categoryData = response.data;
      
      // Normalize the data structure
      if (categoryData.id && !categoryData._id) {
        categoryData = {
          ...categoryData,
          _id: categoryData.id  // Ensure _id exists for frontend compatibility
        };
      }
      
      console.log('Retrieved category data:', categoryData);
      return categoryData;
    } catch (error: any) {
      // Convert 500 errors to 404 when the message indicates "not found"
      if (error.response?.status === 500 && 
          error.response?.data?.message?.toLowerCase().includes('not found')) {
        console.warn(`Category not found (${idOrSlug}), converting 500 to 404 error`);
        const notFoundError = new Error('Category not found');
        notFoundError.name = 'NotFoundError';
        throw notFoundError;
      }
      
      console.error(`Failed to fetch category with ID/Slug ${idOrSlug}:`, 
        error.response?.status,
        error.response?.data || error.message
      );
      throw error;
    }
  },
  
  createCategory: async (data: { name: string; description: string; order?: number }) => {
    try {
      // Make sure we have a token before creating a category
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required to create a category');
      }
      
      // Verify we have user data with correct role
      const userStr = localStorage.getItem('user');
      const userData = userStr ? JSON.parse(userStr) : null;
      if (!userData) {
        console.warn('No user data found in localStorage when creating category');
      } else {
        console.log('Creating category with user role:', userData.role);
        if (userData.role !== 'admin' && userData.role !== 'teacher') {
          throw new Error('You do not have permission to create categories');
        }
      }
      
      // Generate a slug from the name
      const slug = data.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with a single one
        .trim();                  // Trim any leading/trailing spaces or hyphens
      
      // Add the slug to the data
      const categoryData = {
        ...data,
        slug,
        isActive: true
      };
      
      console.log('Creating category with data including slug:', categoryData);
      
      // Always try to refresh the token first before creating a category
      try {
        console.log('Refreshing token before category creation...');
        const refreshResponse = await api.post('/auth/refresh-token');
        if (refreshResponse.data && refreshResponse.data.token) {
          // Store the fresh token
          const newToken = refreshResponse.data.token.replace(/^Bearer\s+/i, '').trim();
          localStorage.setItem('token', newToken);
          console.log('Token successfully refreshed for category creation:', newToken.substring(0, 10) + '...');
          
          // Update user data if available in the response
          if (refreshResponse.data.id || refreshResponse.data._id) {
            const userData = {
              _id: refreshResponse.data.id || refreshResponse.data._id,
              username: refreshResponse.data.username,
              email: refreshResponse.data.email,
              displayName: refreshResponse.data.displayName,
              role: (refreshResponse.data.role || '').toLowerCase(),
              avatar: refreshResponse.data.avatar
            };
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('User data updated during category creation for', userData.username, 'with role', userData.role);
          }
        }
      } catch (refreshError: any) {
        console.warn('Token refresh attempt failed before category creation:', 
          refreshError.response?.status, 
          refreshError.response?.data || refreshError.message
        );
      }
      
      // Manually prepare the request with the latest token
      const currentToken = localStorage.getItem('token');
      const cleanToken = currentToken ? currentToken.replace(/^Bearer\s+/i, '').trim() : '';
      
      console.log('Making category creation request with token:', cleanToken.substring(0, 10) + '...');
      
      // Make the request with explicit headers
      const response = await axios.post(
        `${api.defaults.baseURL}/categories`,
        categoryData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanToken}`
          },
          withCredentials: true
        }
      );
      
      // Log raw response
      console.log('Category creation raw response:', response.data);
      
      // Spring returns objects with 'id' field, not '_id'
      let categoryResponse = response.data;
      
      // Normalize the category data to have both id and _id fields
      if (categoryResponse && categoryResponse.id) {
        // Create a normalized category object with both id and _id fields
        const normalizedCategory = {
          ...categoryResponse,
          _id: categoryResponse.id, // Ensure _id exists since frontend expects it
          slug: categoryResponse.slug || slug // Use the server's slug or fallback to our generated one
        };
        
        console.log('Normalized category data:', normalizedCategory);
        return normalizedCategory;
      } else {
        console.error('Invalid category data received from server:', response.data);
        throw new Error('Server returned invalid category data');
      }
    } catch (error: any) {
      // Better error handling to prevent redirects
      console.error('Category creation failed:', 
        error.response?.status,
        error.response?.data
      );
      
      if (error.response?.status === 401) {
        console.error('Authentication error when creating category. Please log in again.');
        throw new Error('Your session has expired. Please log in again.');
      }
      
      throw error;
    }
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
    
    // Don't make API calls with null/undefined values
    if (idOrSlug === 'null' || idOrSlug === 'undefined') {
      console.error('Invalid topic ID/slug:', idOrSlug);
      throw new Error('Invalid topic identifier');
    }
    
    try {
      console.log(`Requesting topic with ID/Slug: ${idOrSlug}`);
      const response = await api.get(`/topics/${idOrSlug}`);
      console.log('Raw topic response retrieved');
      
      // Check if the response is too large (indicating circular references)
      const isCircularJSON = JSON.stringify(response.data).length > 10000;
      if (isCircularJSON) {
        console.log('Detected potential circular reference in topic data, using simplified extraction');
        // Extract only the essential topic data
        const { id, _id, title, content, slug, viewCount, replyCount, author, category, createdAt, updatedAt } = response.data;
        
        // Create a simplified topic object
        const simplifiedTopic = {
          id: id || _id,
          _id: _id || id,
          title,
          content,
          slug,
          viewCount: viewCount || 0,
          replyCount: replyCount || 0,
          author: author ? {
            id: author.id || author._id,
            _id: author._id || author.id,
            username: author.username,
            displayName: author.displayName,
            avatar: author.avatar
          } : null,
          category: category ? {
            id: category.id || category._id,
            _id: category._id || category.id,
            name: category.name,
            slug: category.slug
          } : null,
          createdAt,
          updatedAt
        };
        
        // Handle null or missing category
        if (!simplifiedTopic.category) {
          simplifiedTopic.category = {
            _id: 'uncategorized',
            id: 'uncategorized',
            name: 'Uncategorized',
            slug: 'uncategorized'
          };
        }
        
        console.log('Successfully extracted simplified topic data');
        
        // Increment the view count by calling the backend
        try {
          await api.post(`/topics/${simplifiedTopic.id}/view`);
        } catch (viewError) {
          console.warn('Failed to increment view count:', viewError);
          // Continue anyway even if view count update fails
        }
        
        return simplifiedTopic;
      }
      
      // For non-circular JSON, continue with existing approach
      // Extract topic data, handling both direct and nested responses
      let topicData = response.data;
      
      // If response is a string (JSON), parse it
      if (typeof topicData === 'string') {
        try {
          console.log('Attempting to parse response string as JSON');
          topicData = JSON.parse(topicData);
        } catch (parseError) {
          console.error('Failed to parse response string as JSON:', parseError);
          // Instead of throwing, try to extract basic data
          console.log('Attempting to extract basic topic data from malformed response');
          
          // Create a fallback topic from other parts of the response or the URL
          return {
            _id: idOrSlug,
            id: idOrSlug,
            title: 'Topic unavailable',
            content: 'The topic content could not be loaded due to a data format issue.',
            slug: idOrSlug,
            category: {
              _id: 'uncategorized',
              id: 'uncategorized', 
              name: 'Uncategorized',
              slug: 'uncategorized'
            },
            author: null,
            viewCount: 0,
            replyCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      }
      
      // If the topic is nested under a 'topic' property, extract it
      if (topicData && topicData.topic && typeof topicData.topic === 'object') {
        topicData = topicData.topic;
        console.log('Extracted nested topic data');
      }
      
      // Break circular references in nested structures
      const simplifyNestedObjects = (obj: any, seenObjects = new WeakMap<object, Record<string, any>>()) => {
        // Don't process null or primitive values
        if (!obj || typeof obj !== 'object') return obj;
        
        // If we've seen this object before, return a simplified version
        if (seenObjects.has(obj)) {
          return seenObjects.get(obj);
        }
        
        // Create a simplified object to break circular references
        const simplified: Record<string, any> = Array.isArray(obj) ? [] : {};
        
        // Store this simplified version for this object
        seenObjects.set(obj, simplified);
        
        // Handle arrays
        if (Array.isArray(obj)) {
          for (let i = 0; i < obj.length; i++) {
            simplified[i] = simplifyNestedObjects(obj[i], seenObjects);
          }
          return simplified;
        }
        
        // Process object properties
        for (const key in obj) {
          // Skip functions
          if (typeof obj[key] === 'function') continue;
          
          // Skip known problematic nested structures
          if (key === 'lastPost' && obj['id']) {
            // Just store a reference to the lastPost ID instead of the whole object
            simplified[key] = { id: obj[key].id || obj[key]._id };
            continue;
          }
          
          // Skip deep nesting of topic references inside posts
          if (key === 'topic' && obj['content']) {
            // This is likely a post, just store the topic ID
            simplified[key] = { id: obj[key].id || obj[key]._id };
            continue;
          }
          
          // Process other properties
          simplified[key] = simplifyNestedObjects(obj[key], seenObjects);
        }
        
        return simplified;
      };
      
      // Apply circular reference removal
      topicData = simplifyNestedObjects(topicData);
      
      // Normalize the data structure (Spring returns 'id', frontend expects '_id')
      if (topicData && topicData.id && !topicData._id) {
        topicData = {
          ...topicData,
          _id: topicData.id
        };
      }
      
      // Generate a slug if missing
      if (topicData && (!topicData.slug || topicData.slug === 'null')) {
        const timestamp = new Date().getTime();
        // Make sure title is defined before calling toLowerCase
        const safeTitle = topicData.title || 'untitled';
        topicData.slug = `${safeTitle.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()}-${timestamp}`;
        
        console.log('Generated slug for topic:', topicData.slug);
      }
      
      // Handle null or missing category
      if (!topicData.category || topicData.category === null) {
        topicData.category = {
          _id: 'uncategorized',
          id: 'uncategorized',
          name: 'Uncategorized',
          slug: 'uncategorized'
        };
      }
      
      // Validate the topic data
      if (!topicData || (!topicData._id && !topicData.id)) {
        console.error('Invalid or missing topic data:', topicData);
        throw new Error('Invalid topic data received from server');
      }
      
      // Increment the view count by calling the backend
      try {
        await api.post(`/topics/${topicData._id || topicData.id}/view`);
      } catch (viewError) {
        console.warn('Failed to increment view count:', viewError);
        // Continue anyway even if view count update fails
      }
      
      console.log('Successfully normalized topic data');
      return topicData;
    } catch (error) {
      console.error(`Error fetching topic ${idOrSlug}:`, error);
      throw error;
    }
  },
  
  createTopic: async (data: { title: string; content: string; categoryId: string; tags?: string[] }) => {
    try {
      // Make sure we have a token before creating a topic
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required to create a topic');
      }
      
      console.log('Creating topic with data:', { ...data, contentLength: data.content.length });
      
      // Always refresh token before topic creation
      try {
        console.log('Refreshing token before topic creation...');
        const refreshResponse = await api.post('/auth/refresh-token');
        if (refreshResponse.data && refreshResponse.data.token) {
          // Store the fresh token
          const newToken = refreshResponse.data.token.replace(/^Bearer\s+/i, '').trim();
          localStorage.setItem('token', newToken);
          console.log('Token successfully refreshed for topic creation:', newToken.substring(0, 10) + '...');
          
          // Update user data if available in the response
          if (refreshResponse.data.id || refreshResponse.data._id) {
            const userData = {
              _id: refreshResponse.data.id || refreshResponse.data._id,
              username: refreshResponse.data.username,
              email: refreshResponse.data.email,
              displayName: refreshResponse.data.displayName,
              role: (refreshResponse.data.role || '').toLowerCase(),
              avatar: refreshResponse.data.avatar
            };
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('User data updated during topic creation for', userData.username, 'with role', userData.role);
          }
        }
      } catch (refreshError: any) {
        console.warn('Token refresh attempt failed before topic creation:', 
          refreshError.response?.status, 
          refreshError.response?.data || refreshError.message
        );
      }
      
      // Manually prepare the request with the latest token
      const currentToken = localStorage.getItem('token');
      const cleanToken = currentToken ? currentToken.replace(/^Bearer\s+/i, '').trim() : '';
      
      console.log('Making topic creation request with token:', cleanToken.substring(0, 10) + '...');
      
      // Make the request with explicit headers
      const response = await axios.post(
        `${api.defaults.baseURL}/topics`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanToken}`
          },
          withCredentials: true
        }
      );
      
      console.log('Topic creation raw response:', response.data);
      
      // Normalize response data
      let topicResponse = response.data;
      
      // If the topic is nested under a property
      if (response.data && response.data.topic) {
        topicResponse = response.data.topic;
      }
      
      // Ensure the response has _id (Spring might use id)
      if (topicResponse && topicResponse.id && !topicResponse._id) {
        topicResponse = {
          ...topicResponse,
          _id: topicResponse.id
        };
      }
      
      return topicResponse;
    } catch (error: any) {
      console.error('Topic creation failed:', 
        error.response?.status,
        error.response?.data || error.message
      );
      throw error;
    }
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
    
    try {
      console.log(`Requesting posts for topic ID: ${topicId}`);
      const response = await api.get(`/posts/topic/${topicId}?page=${page-1}&limit=${limit}`);
      
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
      
      // We're expecting an array directly from the backend now
      if (Array.isArray(response.data)) {
        console.log(`Received ${response.data.length} posts from backend`);
        return response.data.map(processPost);
      } 
      
      // Fallback handling for unexpected formats
      console.warn('Unexpected posts response format, trying to extract posts array:', response.data);
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        // Spring Data pagination format
        return response.data.content.map(processPost);
      } else if (response.data && Array.isArray(response.data.posts)) {
        // Nested posts array
        return response.data.posts.map(processPost);
      } else if (response.data && typeof response.data === 'object') {
        // Try to extract posts from common response patterns
        const possiblePostsArray = response.data.posts || 
                                   response.data.content || 
                                   response.data.data || 
                                   response.data.items || [];
        
        if (Array.isArray(possiblePostsArray)) {
          return possiblePostsArray.map(processPost);
        }
      }
      
      // Default to empty array if we can't find posts
      console.warn('Could not extract posts array from response:', response.data);
      return [];
    } catch (error) {
      console.error(`Error fetching posts for topic ${topicId}:`, error);
      throw error;
    }
  },
  
  createPost: async (data: { content: string; topicId: string; replyTo?: string }) => {
    try {
      console.log('Creating post with data:', { 
        topicId: data.topicId,
        contentLength: data.content.length,
        replyTo: data.replyTo || 'none'
      });
      
      // Make sure we're authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required to create a post');
      }
      
      // Create a clean request with explicit token
      const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
      
      // Create the post with explicit headers
      const response = await axios.post(
        `${api.defaults.baseURL}/posts`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanToken}`
          },
          withCredentials: true
        }
      );
      
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
        _id: postData._id || postData.id || `temp-${Date.now()}`,
        content: postData.content || data.content, // Use input if response lacks content
        topic: postData.topic || data.topicId,
        createdAt: postData.createdAt || new Date().toISOString(),
        updatedAt: postData.updatedAt || new Date().toISOString(),
        likes: Array.isArray(postData.likes) ? postData.likes.length : 0,
        isLiked: Array.isArray(postData.likes) ? postData.likes.includes(postData.authorId) : false
      };
      
      console.log('Successfully created post:', processedPost._id);
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