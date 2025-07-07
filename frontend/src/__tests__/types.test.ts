import { describe, it, expect } from 'vitest';
import { Role, roleUtils, User } from '@/lib/types';

describe('types', () => {
  describe('Role enum', () => {
    it('has correct string values', () => {
      expect(Role.STUDENT).toBe('student');
      expect(Role.TEACHER).toBe('teacher');
      expect(Role.ADMIN).toBe('admin');
    });
  });

  describe('roleUtils.normalizeRole', () => {
    it('normalizes admin role correctly', () => {
      expect(roleUtils.normalizeRole('admin')).toBe(Role.ADMIN);
      expect(roleUtils.normalizeRole('ADMIN')).toBe(Role.ADMIN);
      expect(roleUtils.normalizeRole('Admin')).toBe(Role.ADMIN);
    });

    it('normalizes teacher role correctly', () => {
      expect(roleUtils.normalizeRole('teacher')).toBe(Role.TEACHER);
      expect(roleUtils.normalizeRole('TEACHER')).toBe(Role.TEACHER);
      expect(roleUtils.normalizeRole('Teacher')).toBe(Role.TEACHER);
    });

    it('normalizes student role correctly', () => {
      expect(roleUtils.normalizeRole('student')).toBe(Role.STUDENT);
      expect(roleUtils.normalizeRole('STUDENT')).toBe(Role.STUDENT);
      expect(roleUtils.normalizeRole('Student')).toBe(Role.STUDENT);
    });

    it('defaults to student for unknown roles', () => {
      expect(roleUtils.normalizeRole('unknown')).toBe(Role.STUDENT);
      expect(roleUtils.normalizeRole('random')).toBe(Role.STUDENT);
      expect(roleUtils.normalizeRole('')).toBe(Role.STUDENT);
    });

    it('handles null and undefined inputs', () => {
      expect(roleUtils.normalizeRole(null)).toBe(Role.STUDENT);
      expect(roleUtils.normalizeRole(undefined)).toBe(Role.STUDENT);
    });

    it('handles mixed case inputs', () => {
      expect(roleUtils.normalizeRole('aDmIn')).toBe(Role.ADMIN);
      expect(roleUtils.normalizeRole('TeAcHeR')).toBe(Role.TEACHER);
      expect(roleUtils.normalizeRole('StUdEnT')).toBe(Role.STUDENT);
    });
  });

  describe('roleUtils.hasAtLeastSamePrivilegesAs', () => {
    describe('Admin privileges', () => {
      it('admin has privileges for all roles', () => {
        expect(roleUtils.hasAtLeastSamePrivilegesAs(Role.ADMIN, Role.ADMIN)).toBe(true);
        expect(roleUtils.hasAtLeastSamePrivilegesAs(Role.ADMIN, Role.TEACHER)).toBe(true);
        expect(roleUtils.hasAtLeastSamePrivilegesAs(Role.ADMIN, Role.STUDENT)).toBe(true);
      });
    });

    describe('Teacher privileges', () => {
      it('teacher has correct privilege hierarchy', () => {
        expect(roleUtils.hasAtLeastSamePrivilegesAs(Role.TEACHER, Role.ADMIN)).toBe(false);
        expect(roleUtils.hasAtLeastSamePrivilegesAs(Role.TEACHER, Role.TEACHER)).toBe(true);
        expect(roleUtils.hasAtLeastSamePrivilegesAs(Role.TEACHER, Role.STUDENT)).toBe(true);
      });
    });

    describe('Student privileges', () => {
      it('student has correct privilege hierarchy', () => {
        expect(roleUtils.hasAtLeastSamePrivilegesAs(Role.STUDENT, Role.ADMIN)).toBe(false);
        expect(roleUtils.hasAtLeastSamePrivilegesAs(Role.STUDENT, Role.TEACHER)).toBe(false);
        expect(roleUtils.hasAtLeastSamePrivilegesAs(Role.STUDENT, Role.STUDENT)).toBe(true);
      });
    });
  });

  describe('User interface', () => {
    it('has correct required properties', () => {
      const user: User = {
        _id: 'user123',
        username: 'johndoe',
        email: 'john@example.com',
        displayName: 'John Doe',
        role: Role.STUDENT
      };

      expect(user._id).toBe('user123');
      expect(user.username).toBe('johndoe');
      expect(user.email).toBe('john@example.com');
      expect(user.displayName).toBe('John Doe');
      expect(user.role).toBe(Role.STUDENT);
    });

    it('supports optional properties', () => {
      const user: User = {
        _id: 'user123',
        username: 'johndoe',
        email: 'john@example.com',
        displayName: 'John Doe',
        role: Role.TEACHER,
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Software developer',
        githubUrl: 'https://github.com/johndoe',
        websiteUrl: 'https://johndoe.com',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        twitterUrl: 'https://twitter.com/johndoe',
        createdAt: '2023-01-01T00:00:00Z'
      };

      expect(user.avatar).toBe('https://example.com/avatar.jpg');
      expect(user.bio).toBe('Software developer');
      expect(user.githubUrl).toBe('https://github.com/johndoe');
      expect(user.websiteUrl).toBe('https://johndoe.com');
      expect(user.linkedinUrl).toBe('https://linkedin.com/in/johndoe');
      expect(user.twitterUrl).toBe('https://twitter.com/johndoe');
      expect(user.createdAt).toBe('2023-01-01T00:00:00Z');
    });
  });
}); 