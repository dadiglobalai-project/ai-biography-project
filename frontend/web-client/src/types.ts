/**
 * TypeScript definitions for Xinghuoji Platform
 */

export interface RegisterFormState {
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  agreedToTerms: boolean;
}

export interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreedToTerms?: string;
}

export type ActiveFormView = 'register' | 'login';

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  status: string;
}

export interface AuthApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  user?: AuthUser;
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  content: string[];
}
