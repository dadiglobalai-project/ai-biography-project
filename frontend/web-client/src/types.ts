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

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  content: string[];
}
