import { RegisterFormState } from '../types';

function getApiBaseUrl() {
  const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/$/, '');
  }

  return '';
}

const API_BASE_URL = getApiBaseUrl();

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function parseApiResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return { error: response.statusText || 'Request failed' };
  }

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

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
    const response = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form)
    });

    const data = await parseApiResponse(response);
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Registration failed');
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
    const response = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });

    const data = await parseApiResponse(response);
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Authentication failed');
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
    const response = await fetch(apiUrl('/api/auth/me'), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await parseApiResponse(response);
    if (!response.ok) {
      throw new Error(data.error || data.message || 'No active session');
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
    const response = await fetch(apiUrl('/api/auth/logout'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await parseApiResponse(response);
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Logout failed');
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
    const response = await fetch(apiUrl('/api/auth/forgot-password'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    const data = await parseApiResponse(response);
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Password reset request failed');
    }

    return {
      success: true,
      message: data.message || 'Password reset link sent'
    };
  }
};
