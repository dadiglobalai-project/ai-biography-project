import { RegisterFormState } from '../types';

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    fullName: string;
    email: string;
  };
}

export const authService = {
  /**
   * Register a new user in the archives.
   */
  async register(form: RegisterFormState): Promise<AuthResponse> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return {
      success: true,
      message: data.message || 'Registration complete',
      user: data.user
    };
  },

  /**
   * Log in to verify signature and identity.
   */
  async login(credentials: { email: string; password?: string }): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    return {
      success: true,
      message: data.message || 'Signature verified',
      user: data.user
    };
  },

  /**
   * Fetch authenticated user details of active session.
   */
  async getCurrentUser(): Promise<AuthResponse> {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'No active session');
    }

    return {
      success: true,
      message: 'Active session resolved',
      user: data.user
    };
  },

  /**
   * Clear secure session and log out.
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Logout failed');
    }

    return {
      success: true,
      message: data.message || 'Session closed'
    };
  },

  /**
   * Request password reset link.
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Password reset request failed');
    }

    return {
      success: true,
      message: data.message || 'Password reset link sent'
    };
  }
};
