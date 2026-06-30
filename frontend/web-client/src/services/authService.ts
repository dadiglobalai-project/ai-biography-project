import { RegisterFormState } from '../types';
import { getEmailValidationError } from '../utils/emailValidation';

const DEFAULT_API_PORT = '8080';
const AUTH_TOKEN_STORAGE_KEY = 'token';
const AUTH_USER_STORAGE_KEY = 'authUser';
const KNOWN_AUTH_USERS_STORAGE_KEY = 'knownAuthUsers';

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

  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string | null;
  resetToken?: string | null;
  user?: {
    fullName?: string;
    email: string;
  };
}

export type ServiceType = 'DIY' | 'PROFESSIONAL';

export interface OnboardingResponse {
  success: boolean;
  message: string;
  serviceType: ServiceType;
  onboardingStatus: string;
}

function getMessage(data: any, fallback: string) {
  return data?.error || data?.message || fallback;
}

function storeAuthSession(token: string, user?: AuthResponse['user']) {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);

  if (user) {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    rememberKnownUser(user);
  }
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}

function readStoredUser(): AuthResponse['user'] | undefined {
  const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (!storedUser) {
    return undefined;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return undefined;
  }
}

function readKnownUsers(): Record<string, string> {
  const storedKnownUsers = localStorage.getItem(KNOWN_AUTH_USERS_STORAGE_KEY);
  if (!storedKnownUsers) {
    return {};
  }

  try {
    return JSON.parse(storedKnownUsers);
  } catch {
    localStorage.removeItem(KNOWN_AUTH_USERS_STORAGE_KEY);
    return {};
  }
}

function rememberKnownUser(user?: AuthResponse['user']) {
  const email = user?.email?.trim().toLowerCase();
  const fullName = user?.fullName?.trim();

  if (!email || !fullName) {
    return;
  }

  localStorage.setItem(
    KNOWN_AUTH_USERS_STORAGE_KEY,
    JSON.stringify({
      ...readKnownUsers(),
      [email]: fullName,
    })
  );
}

function getKnownFullName(email: string) {
  return readKnownUsers()[email.trim().toLowerCase()] || '';
}

function getSessionFromJwt(token: string) {
  try {
    const [, payload] = token.split('.');
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalizedPayload));
    const email = typeof decoded.email === 'string' ? decoded.email : '';
    const expiresAt = typeof decoded.exp === 'number' ? decoded.exp * 1000 : 0;
    const firstName = typeof decoded.firstName === 'string' ? decoded.firstName : '';
    const lastName = typeof decoded.lastName === 'string' ? decoded.lastName : '';
    const fullName =
      typeof decoded.fullName === 'string'
        ? decoded.fullName
        : typeof decoded.name === 'string'
          ? decoded.name
          : `${firstName} ${lastName}`.trim();

    if (!email || (expiresAt && expiresAt <= Date.now())) {
      return null;
    }

    return { email, fullName };
  } catch {
    return null;
  }
}

function extractResetToken(message?: string) {
  return message?.match(/Password reset token generated:\s*(.+)$/i)?.[1]?.trim() || null;
}

export const authService = {
  async register(form: RegisterFormState): Promise<AuthResponse> {
    const emailValidationError = getEmailValidationError(form.email);
    if (emailValidationError) {
      throw new Error(emailValidationError);
    }

    const user = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
    };

    const response = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...form,
        fullName: user.fullName,
        email: user.email,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      throw new Error(getMessage(data, 'Registration failed'));
    }

    storeAuthSession(data.token, user);

    return {
      success: true,
      message: data.message || 'Registration complete',
      token: data.token,
      user,
    };
  },

  async login(credentials: { email: string; password?: string }): Promise<AuthResponse> {
    const email = credentials.email.trim();
    const response = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...credentials,
        email,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      throw new Error(getMessage(data, 'Authentication failed'));
    }

    const tokenSession = getSessionFromJwt(data.token);
    const fullName = data.user?.fullName || tokenSession?.fullName || getKnownFullName(email);
    const user = { fullName, email: data.user?.email || tokenSession?.email || email };
    storeAuthSession(data.token, user);

    return {
      success: true,
      message: data.message || 'Login successful',
      token: data.token,
      user,
    };
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (!token) {
      throw new Error('No active session');
    }

    const storedUser = readStoredUser();
    const tokenSession = getSessionFromJwt(token);

    if (!tokenSession) {
      clearAuthSession();
      throw new Error('No active session');
    }

    return {
      success: true,
      message: 'Active session resolved',
      token,
      user: {
        fullName: storedUser?.fullName || tokenSession.fullName || getKnownFullName(tokenSession.email),
        email: storedUser?.email || tokenSession.email,
      },
    };
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      await fetch(apiUrl('/api/auth/logout'), {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch {
      // The Java backend uses stateless JWTs and does not require server logout.
    }

    clearAuthSession();

    return {
      success: true,
      message: 'Session closed',
    };
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string | null }> {
    const response = await fetch(apiUrl('/api/auth/forgot-password'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim() }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(getMessage(data, 'Password reset request failed'));
    }

    const message = data.message || 'Password reset link sent';

    return {
      success: true,
      message,
      resetToken: data.resetToken || extractResetToken(message),
    };
  },

  
  async resetPassword(payload: { token: string; newPassword: string; confirmPassword: string }): Promise<{ success: boolean; message: string }> {
    const response = await fetch(apiUrl('/api/auth/reset-password'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const message = getMessage(data, 'Password update failed');

    if (!response.ok || !/password reset successful/i.test(message)) {
      throw new Error(message);
    }

    return {
      success: true,
      message,
    };
  },

  async saveServiceType(serviceType: ServiceType): Promise<OnboardingResponse> {
    const response = await fetch(apiUrl('/api/onboarding/service-type'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ serviceType }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to save service type'));
    }

    return {
      success: true,
      message: data.message || 'Service type saved successfully',
      serviceType: data.serviceType || serviceType,
      onboardingStatus: data.onboardingStatus || 'COMPLETED',
    };
  }
};
