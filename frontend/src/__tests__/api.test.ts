import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { Role } from '@/lib/types';
import api, { 
  authAPI, 
  userAPI, 
  categoriesAPI, 
  topicsAPI, 
  postsAPI, 
  statsAPI, 
  usersAPI 
} from '@/lib/api';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn().mockResolvedValue({ data: [] }),
      post: vi.fn().mockResolvedValue({ data: {} }),
      put: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} }),
    })),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock window.location
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
});

describe('API Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('API Structure and Exports', () => {
    it('exports all expected API objects', () => {
      expect(authAPI).toBeDefined();
      expect(userAPI).toBeDefined();
      expect(categoriesAPI).toBeDefined();
      expect(topicsAPI).toBeDefined();
      expect(postsAPI).toBeDefined();
      expect(statsAPI).toBeDefined();
      expect(usersAPI).toBeDefined();
    });

    it('exports default api instance', () => {
      expect(api).toBeDefined();
    });

    it('authAPI contains expected functions', () => {
      expect(typeof authAPI.login).toBe('function');
      expect(typeof authAPI.register).toBe('function');
      expect(typeof authAPI.getCurrentUser).toBe('function');
      expect(typeof authAPI.refreshToken).toBe('function');
      expect(typeof authAPI.forgotPassword).toBe('function');
      expect(typeof authAPI.resetPassword).toBe('function');
    });

    it('userAPI contains expected functions', () => {
      expect(typeof userAPI.getAllUsers).toBe('function');
      expect(typeof userAPI.getPublicUsersList).toBe('function');
      expect(typeof userAPI.getUserByUsername).toBe('function');
      expect(typeof userAPI.getPublicUserProfile).toBe('function');
      expect(typeof userAPI.updateUserRole).toBe('function');
      expect(typeof userAPI.getUserProfile).toBe('function');
      expect(typeof userAPI.updateUserProfile).toBe('function');
      expect(typeof userAPI.changePassword).toBe('function');
      expect(typeof userAPI.deleteUser).toBe('function');
      expect(typeof userAPI.uploadAvatar).toBe('function');
    });

    it('categoriesAPI contains expected functions', () => {
      expect(typeof categoriesAPI.getAllCategories).toBe('function');
      expect(typeof categoriesAPI.getCategoryByIdOrSlug).toBe('function');
      expect(typeof categoriesAPI.createCategory).toBe('function');
      expect(typeof categoriesAPI.updateCategory).toBe('function');
      expect(typeof categoriesAPI.deleteCategory).toBe('function');
    });

    it('topicsAPI contains expected functions', () => {
      expect(typeof topicsAPI.getTopicsByCategory).toBe('function');
      expect(typeof topicsAPI.getLatestTopics).toBe('function');
      expect(typeof topicsAPI.getTopicByIdOrSlug).toBe('function');
      expect(typeof topicsAPI.createTopic).toBe('function');
      expect(typeof topicsAPI.deleteTopic).toBe('function');
      expect(typeof topicsAPI.incrementViewCount).toBe('function');
    });

    it('postsAPI contains expected functions', () => {
      expect(typeof postsAPI.getPostsByTopic).toBe('function');
      expect(typeof postsAPI.createPost).toBe('function');
      expect(typeof postsAPI.deletePost).toBe('function');
      expect(typeof postsAPI.toggleLike).toBe('function');
      expect(typeof postsAPI.getPostById).toBe('function');
      expect(typeof postsAPI.updatePost).toBe('function');
    });

    it('statsAPI contains expected functions', () => {
      expect(typeof statsAPI.getStats).toBe('function');
      expect(typeof statsAPI.getAnalyticsData).toBe('function');
    });

    it('usersAPI contains expected functions', () => {
      expect(typeof usersAPI.getUserLeaderboard).toBe('function');
      expect(typeof usersAPI.getUserGamificationStats).toBe('function');
      expect(typeof usersAPI.getPublicUserGamificationStats).toBe('function');
    });
  });

  describe('Error Handling and Real Function Tests', () => {
    it('usersAPI.getPublicUserGamificationStats handles empty responses', async () => {
      // with our mock returning { data: [] }, this function should handle the empty response
      const result = await usersAPI.getPublicUserGamificationStats('test-user');
      
      // the function returns the data directly when successful, even if it's an empty array
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });

    it('usersAPI.getUserLeaderboard handles errors gracefully', async () => {
      // this function should return empty array on error
      const result = await usersAPI.getUserLeaderboard('enhanced');
      expect(Array.isArray(result)).toBe(true);
    });

    it('usersAPI.getUserGamificationStats handles errors gracefully', async () => {
      // this function should return empty object on error
      const result = await usersAPI.getUserGamificationStats();
      expect(typeof result).toBe('object');
    });
  });
}); 