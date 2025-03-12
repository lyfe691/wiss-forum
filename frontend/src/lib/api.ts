import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip auth redirects for auth endpoints to allow proper error handling in components
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    
    // Only redirect for non-auth endpoints with 401 errors
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Clear localStorage and redirect to login on auth error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: { username: string; email: string; password: string; displayName: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (data: { username: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// User API
export const userAPI = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  updateUserRole: async (userId: string, role: 'student' | 'teacher' | 'admin') => {
    const response = await api.put(`/users/${userId}/role`, { role });
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
  
  createCategory: async (data: { name: string; description: string; order?: number; parentCategory?: string }) => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  
  updateCategory: async (
    id: string, 
    data: { 
      name?: string; 
      description?: string; 
      order?: number; 
      parentCategory?: string | null; 
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
    const response = await api.get(`/topics/category/${categoryId}?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  getLatestTopics: async (page = 1, limit = 10) => {
    const response = await api.get(`/topics/latest?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  getTopicByIdOrSlug: async (idOrSlug: string) => {
    const response = await api.get(`/topics/${idOrSlug}`);
    return response.data;
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
      isPinned?: boolean; 
      isLocked?: boolean; 
      tags?: string[] 
    }
  ) => {
    const response = await api.put(`/topics/${id}`, data);
    return response.data;
  },
  
  deleteTopic: async (id: string) => {
    const response = await api.delete(`/topics/${id}`);
    return response.data;
  },
};

// Posts API
export const postsAPI = {
  getPostsByTopic: async (topicId: string, page = 1, limit = 10) => {
    const response = await api.get(`/posts/topic/${topicId}?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  createPost: async (data: { content: string; topicId: string; replyTo?: string }) => {
    const response = await api.post('/posts', data);
    return response.data;
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
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  },
};

export default api; 