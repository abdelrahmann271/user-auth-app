/**
 * Validation utilities for form fields
 */

export function validateEmail(email: string): string | undefined {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return undefined;
}

export function validateName(name: string): string | undefined {
  if (!name) return 'Name is required';
  if (name.length < 3) return 'Name must be at least 3 characters';
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(password)) return 'Password must contain at least one letter';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  if (!/[@$!%*#?&]/.test(password)) return 'Password must contain at least one special character (@$!%*#?&)';
  return undefined;
}
