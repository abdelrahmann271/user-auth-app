import { describe, it, expect } from 'vitest';
import { validateEmail, validateName, validatePassword } from './validation';

describe('validateEmail', () => {
  it('returns error for empty email', () => {
    expect(validateEmail('')).toBe('Email is required');
  });

  it('returns error for invalid email', () => {
    expect(validateEmail('invalid')).toBe('Please enter a valid email address');
    expect(validateEmail('invalid@')).toBe('Please enter a valid email address');
    expect(validateEmail('@test.com')).toBe('Please enter a valid email address');
  });

  it('returns undefined for valid email', () => {
    expect(validateEmail('test@example.com')).toBeUndefined();
    expect(validateEmail('user.name@domain.org')).toBeUndefined();
  });
});

describe('validateName', () => {
  it('returns error for empty name', () => {
    expect(validateName('')).toBe('Name is required');
  });

  it('returns error for name too short', () => {
    expect(validateName('AB')).toBe('Name must be at least 3 characters');
  });

  it('returns undefined for valid name', () => {
    expect(validateName('John')).toBeUndefined();
    expect(validateName('ABC')).toBeUndefined();
  });
});

describe('validatePassword', () => {
  it('returns error for empty password', () => {
    expect(validatePassword('')).toBe('Password is required');
  });

  it('returns error for password too short', () => {
    expect(validatePassword('Ab1!')).toBe('Password must be at least 8 characters');
  });

  it('returns error for password without letter', () => {
    expect(validatePassword('12345678!')).toBe('Password must contain at least one letter');
  });

  it('returns error for password without number', () => {
    expect(validatePassword('Abcdefgh!')).toBe('Password must contain at least one number');
  });

  it('returns error for password without special character', () => {
    expect(validatePassword('Abcdefg1')).toBe('Password must contain at least one special character (@$!%*#?&)');
  });

  it('returns undefined for valid password', () => {
    expect(validatePassword('Password1!')).toBeUndefined();
    expect(validatePassword('MyP@ss123')).toBeUndefined();
  });
});
