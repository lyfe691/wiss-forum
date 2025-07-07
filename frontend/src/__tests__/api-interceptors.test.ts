import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios, { AxiosError } from 'axios';

// mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('API Interceptors', () => {
  let requestInterceptor: any;
  let responseInterceptor: any;
  let mockApiInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // mock the request interceptor
    requestInterceptor = {
      use: vi.fn((onFulfilled, onRejected) => {
        requestInterceptor.onFulfilled = onFulfilled;
        requestInterceptor.onRejected = onRejected;
      })
    };

    // mock the response interceptor
    responseInterceptor = {
      use: vi.fn((onFulfilled, onRejected) => {
        responseInterceptor.onFulfilled = onFulfilled;
        responseInterceptor.onRejected = onRejected;
      })
    };

    mockApiInstance = {
      post: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      put: vi.fn(),
      interceptors: {
        request: requestInterceptor,
        response: responseInterceptor
      },
      defaults: {},
      getUri: vi.fn(),
      request: vi.fn(),
      head: vi.fn(),
      options: vi.fn(),
      patch: vi.fn(),
      postForm: vi.fn(),
      putForm: vi.fn(),
      patchForm: vi.fn()
    };

    mockedAxios.create = vi.fn(() => mockApiInstance);
    mockedAxios.isAxiosError = ((error: any): error is AxiosError => error && error.isAxiosError) as any;
    
    // re-import the module to trigger the interceptor setup
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Request Interceptor', () => {
    it('should attach authorization token when token exists', async () => {
      localStorage.setItem('token', 'test-token');
      
      // re-import to trigger interceptor setup
      await import('@/lib/api');
      
      const config = {
        headers: {},
        url: '/test'
      };

      const result = requestInterceptor.onFulfilled(config);

      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should clean Bearer prefix from token', async () => {
      localStorage.setItem('token', 'Bearer test-token');
      
      await import('@/lib/api');
      
      const config = {
        headers: {},
        url: '/test'
      };

      const result = requestInterceptor.onFulfilled(config);

      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should handle multiple Bearer prefixes', async () => {
      localStorage.setItem('token', 'Bearer Bearer test-token');
      
      await import('@/lib/api');
      
      const config = {
        headers: {},
        url: '/test'
      };

      const result = requestInterceptor.onFulfilled(config);

      expect(result.headers.Authorization).toBe('Bearer Bearer test-token');
    });

    it('should not attach authorization when no token exists', async () => {
      await import('@/lib/api');
      
      const config = {
        headers: {},
        url: '/test'
      };

      const result = requestInterceptor.onFulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should handle request interceptor errors', async () => {
      await import('@/lib/api');
      
      const error = new Error('Request error');
      
      await expect(requestInterceptor.onRejected(error)).rejects.toEqual(error);
    });
  });

  describe('Response Interceptor', () => {
    beforeEach(() => {
      // mock window.location.href
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:3000/current-page'
        },
        writable: true
      });
    });

    it('should pass through successful responses', async () => {
      await import('@/lib/api');
      
      const response = {
        data: { message: 'Success' },
        status: 200,
        statusText: 'OK'
      };

      const result = responseInterceptor.onFulfilled(response);

      expect(result).toEqual(response);
    });

    it('should handle 404 errors with custom message', async () => {
      await import('@/lib/api');
      
      const error = {
        response: {
          status: 404,
          data: { message: 'Resource not found' }
        },
        config: { url: '/api/test' }
      };

      await expect(responseInterceptor.onRejected(error)).rejects.toEqual({
        ...error,
        message: 'Resource not found'
      });
    });

    it('should handle 404 errors with default message', async () => {
      await import('@/lib/api');
      
      const error = {
        response: {
          status: 404,
          data: {}
        },
        config: { url: '/api/test' }
      };

      await expect(responseInterceptor.onRejected(error)).rejects.toEqual({
        ...error,
        message: 'Resource not found'
      });
    });

    it('should handle 401 errors on auth endpoints', async () => {
      await import('@/lib/api');
      
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        },
        config: { url: '/api/auth/login' }
      };

      await expect(responseInterceptor.onRejected(error)).rejects.toEqual(error);
    });

    it('should attempt token refresh on 401 errors for non-auth endpoints', async () => {
      localStorage.setItem('token', 'old-token');
      
      mockApiInstance.post.mockResolvedValueOnce({
        data: { token: 'new-token' }
      });

      // mock axios for the retry request
      mockedAxios.mockResolvedValueOnce({
        data: { message: 'Success with new token' }
      });

      await import('@/lib/api');
      
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        },
        config: { 
          url: '/api/users/profile',
          headers: { Authorization: 'Bearer old-token' }
        }
      };

      await responseInterceptor.onRejected(error);

      expect(mockApiInstance.post).toHaveBeenCalledWith('/auth/refresh-token');
      expect(localStorage.getItem('token')).toBe('new-token');
      expect(mockedAxios).toHaveBeenCalledWith({
        url: '/api/users/profile',
        headers: { Authorization: 'Bearer new-token' },
        __isRetry: true
      });
    });

         it('should handle token refresh failure', async () => {
       localStorage.setItem('token', 'old-token');
       localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
       
       mockApiInstance.post.mockRejectedValueOnce(new Error('Refresh failed'));

       await import('@/lib/api');
       
       const error = {
         response: {
           status: 401,
           data: { message: 'Unauthorized' }
         },
         config: { 
           url: '/api/users/profile',
           headers: { Authorization: 'Bearer old-token' }
         }
       };

       try {
         await responseInterceptor.onRejected(error);
       } catch (e) {
         // expected to be rejected but shouldn't throw
       }

       expect(localStorage.getItem('token')).toBeNull();
       expect(localStorage.getItem('user')).toBeNull();
       expect(window.location.href).toBe('/login');
     });

    

    it('should not retry already retried requests', async () => {
      localStorage.setItem('token', 'old-token');
      
      await import('@/lib/api');
      
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        },
        config: { 
          url: '/api/users/profile',
          headers: { Authorization: 'Bearer old-token' },
          __isRetry: true
        }
      };

      await expect(responseInterceptor.onRejected(error)).rejects.toEqual(error);
      expect(mockApiInstance.post).not.toHaveBeenCalled();
    });

    it('should handle non-HTTP errors', async () => {
      await import('@/lib/api');
      
      const error = new Error('Network error');
      
      await expect(responseInterceptor.onRejected(error)).rejects.toEqual(error);
    });

    it('should handle errors without response', async () => {
      await import('@/lib/api');
      
      const error = {
        message: 'Network error',
        config: { url: '/api/test' }
      };

      await expect(responseInterceptor.onRejected(error)).rejects.toEqual(error);
    });

    it('should handle refresh token response with Bearer prefix', async () => {
      localStorage.setItem('token', 'old-token');
      
      mockApiInstance.post.mockResolvedValueOnce({
        data: { token: 'Bearer new-token' }
      });

      mockedAxios.mockResolvedValueOnce({
        data: { message: 'Success with cleaned token' }
      });

      await import('@/lib/api');
      
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        },
        config: { 
          url: '/api/users/profile',
          headers: { Authorization: 'Bearer old-token' }
        }
      };

      await responseInterceptor.onRejected(error);

      expect(localStorage.getItem('token')).toBe('new-token');
      expect(mockedAxios).toHaveBeenCalledWith({
        url: '/api/users/profile',
        headers: { Authorization: 'Bearer new-token' },
        __isRetry: true
      });
    });
  });

  describe('API Instance Configuration', () => {
    it('should create axios instance with correct configuration', async () => {
      await import('@/lib/api');
      
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8080/api',
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
    });

    it('should use environment variable for base URL', async () => {
      // mock environment variable
      vi.stubEnv('VITE_API_URL', 'https://api.example.com');
      
      await import('@/lib/api');
      
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.example.com',
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
    });

    it('should set up request and response interceptors', async () => {
      await import('@/lib/api');
      
      expect(requestInterceptor.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
      expect(responseInterceptor.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
    });
  });
}); 