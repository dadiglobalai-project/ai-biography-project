import { RegisterFormState } from '../types';

const DEFAULT_API_PORT = '8080';

function getApiBaseUrl() {
  const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${DEFAULT_API_PORT}`;
  }

  return '';
}

const API_BASE_URL = getApiBaseUrl();

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('token');

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string | null;
  user?: {
    fullName: string;
    email: string;
  };
}

export const authService = {
  async register(form: RegisterFormState): Promise<AuthResponse> {
    const response = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok || !data.user) {
      throw new Error(data.error || data.message || 'Registration failed');
    }

    return {
      success: true,
      message: data.message || 'Registration complete',
      user: data.user,
    };
  },

  async login(credentials: { email: string; password?: string }): Promise<AuthResponse> {
    const response = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      throw new Error(data.error || data.message || 'Authentication failed');
    }

    localStorage.setItem('token', data.token);

    return {
      success: true,
      message: data.message || 'Login successful',
      token: data.token,
      user: data.user,
    };
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No active session');
    }

    const response = await fetch(apiUrl('/api/auth/me'), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      localStorage.removeItem('token');
      throw new Error(data.error || data.message || 'No active session');
    }

    return {
      success: true,
      message: 'Active session resolved',
      user: data.user,
    };
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');

    const response = await fetch(apiUrl('/api/auth/logout'), {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    localStorage.removeItem('token');

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    const data = await response.json();

    return {
      success: true,
      message: data.message || 'Session closed',
    };
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(apiUrl('/api/auth/forgot-password'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Password reset request failed');
    }

    return {
      success: true,
      message: data.message || 'Password reset link sent',
    };
  },
};