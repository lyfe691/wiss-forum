import { describe, it, expect } from 'vitest';
import { 
  cn, 
  formatDate, 
  getAvatarUrl, 
  getRoleBadgeColor, 
  formatRoleName, 
  getInitials 
} from '@/lib/utils';
import { Role } from '@/lib/types';

describe('utils', () => {
  describe('cn', () => {
    it('combines class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'not-included')).toBe('base conditional');
    });

    it('merges Tailwind classes correctly', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });

    it('handles empty input', () => {
      expect(cn()).toBe('');
    });

    it('handles undefined and null values', () => {
      expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly in Swiss format', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/); // Swiss format: dd.mm.yyyy
    });

    it('handles different dates', () => {
      const date1 = new Date('2023-01-01T00:00:00Z');
      const date2 = new Date('2023-12-31T23:59:59Z');
      
      const formatted1 = formatDate(date1);
      const formatted2 = formatDate(date2);
      
      expect(formatted1).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/);
      expect(formatted2).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/);
    });
  });

  describe('getAvatarUrl', () => {
    it('returns custom avatar URL when provided', () => {
      const customAvatar = 'https://example.com/avatar.jpg';
      expect(getAvatarUrl('user123', customAvatar)).toBe(customAvatar);
    });

    it('generates Dicebear URL when no avatar provided', () => {
      const result = getAvatarUrl('user123');
      expect(result).toBe('https://api.dicebear.com/9.x/thumbs/svg?seed=user123');
    });

    it('generates different URLs for different user IDs', () => {
      const avatar1 = getAvatarUrl('user1');
      const avatar2 = getAvatarUrl('user2');
      expect(avatar1).not.toBe(avatar2);
    });

    it('handles empty string avatar', () => {
      const result = getAvatarUrl('user123', '');
      expect(result).toBe('https://api.dicebear.com/9.x/thumbs/svg?seed=user123'); // empty string is falsy, so generates URL
    });
  });

  describe('getRoleBadgeColor', () => {
    it('returns correct colors for admin role', () => {
      const adminColor = getRoleBadgeColor(Role.ADMIN);
      expect(adminColor).toBe('bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300');
    });

    it('returns correct colors for teacher role', () => {
      const teacherColor = getRoleBadgeColor(Role.TEACHER);
      expect(teacherColor).toBe('bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300');
    });

    it('returns correct colors for student role', () => {
      const studentColor = getRoleBadgeColor(Role.STUDENT);
      expect(studentColor).toBe('bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300');
    });

    it('handles string role inputs', () => {
      expect(getRoleBadgeColor('admin')).toBe('bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300');
      expect(getRoleBadgeColor('teacher')).toBe('bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300');
      expect(getRoleBadgeColor('student')).toBe('bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300');
    });

    it('defaults to student colors for unknown roles', () => {
      const unknownColor = getRoleBadgeColor('unknown' as any);
      expect(unknownColor).toBe('bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300');
    });
  });

  describe('formatRoleName', () => {
    it('formats admin role correctly', () => {
      expect(formatRoleName(Role.ADMIN)).toBe('Admin');
    });

    it('formats teacher role correctly', () => {
      expect(formatRoleName(Role.TEACHER)).toBe('Teacher');
    });

    it('formats student role correctly', () => {
      expect(formatRoleName(Role.STUDENT)).toBe('Student');
    });

    it('handles string role inputs', () => {
      expect(formatRoleName('admin')).toBe('Admin');
      expect(formatRoleName('teacher')).toBe('Teacher');
      expect(formatRoleName('student')).toBe('Student');
    });

    it('handles unknown roles gracefully', () => {
      expect(formatRoleName('unknown' as any)).toBe('Student'); // unknown roles normalize to STUDENT
    });

    it('handles uppercase string inputs', () => {
      expect(formatRoleName('ADMIN' as any)).toBe('Admin');
    });
  });

  describe('getInitials', () => {
    it('returns initials from single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('returns initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('handles three names', () => {
      expect(getInitials('John Middle Doe')).toBe('JM');
    });

    it('handles names with extra spaces', () => {
      expect(getInitials('  John   Doe  ')).toBe('JD');
    });

    it('handles empty string', () => {
      expect(getInitials('')).toBe('U');
    });

    it('handles undefined', () => {
      expect(getInitials(undefined)).toBe('U');
    });

    it('handles whitespace only', () => {
      expect(getInitials('   ')).toBe('U');
    });

    it('handles single character names', () => {
      expect(getInitials('J')).toBe('J');
    });

    it('converts to uppercase', () => {
      expect(getInitials('john doe')).toBe('JD');
    });

    it('handles names with multiple words and spaces', () => {
      expect(getInitials('John  Middle  Doe Smith')).toBe('JM');
    });

    it('handles special characters in names', () => {
      expect(getInitials('Jean-Pierre Müller')).toBe('JM');
    });
  });
}); 