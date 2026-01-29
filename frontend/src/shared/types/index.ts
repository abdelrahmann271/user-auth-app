// User types
export interface User {
  id: string;
  email: string;
  name: string;
}

// API Response types
export interface AuthResponse {
  message: string;
  user: User;
}

export interface ProfileResponse {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Form types
export interface FormErrors {
  email?: string;
  name?: string;
  password?: string;
}
