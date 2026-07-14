import { RegisterFormState } from '../types';
import { getEmailValidationError } from '../utils/emailValidation';

const DEFAULT_API_PORT = '8080';
const AUTH_TOKEN_STORAGE_KEY = 'token';
const AUTH_USER_STORAGE_KEY = 'authUser';
const KNOWN_AUTH_USERS_STORAGE_KEY = 'knownAuthUsers';
const LOCAL_BIOGRAPHY_WEBSITES_STORAGE_KEY = 'localBiographyWebsites';
const SELECTED_SERVICE_TYPE_STORAGE_KEY = 'selectedServiceType';
const SELECTED_SERVICE_TYPE_BY_USER_STORAGE_KEY = 'selectedServiceTypeByUser';

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

export interface DashboardResponse {
  success: boolean;
  message?: string;
  user?: AuthResponse['user'];
  serviceType?: ServiceType;
  onboardingStatus?: string;
}

export type SubjectType = 'SELF' | 'PARENT' | 'GRANDPARENT' | 'CHILD' | 'SPOUSE' | 'LOVED_ONE';

export interface BiographyWebsite {
  id: string;
  title: string;
  templateId: string;
  subjectType: SubjectType | string;
  status: string;
  subdomain?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBiographyWebsitePayload {
  title: string;
  templateId: string;
  subjectType: SubjectType;
}

interface LocalBiographyWebsitePayload {
  title?: string;
  templateId?: string;
  subjectType?: SubjectType | string;
  status?: string;
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

function normalizeServiceType(serviceType?: unknown): ServiceType | undefined {
  const normalizedServiceType = typeof serviceType === 'string' ? serviceType.toUpperCase() : '';
  return normalizedServiceType === 'DIY' || normalizedServiceType === 'PROFESSIONAL'
    ? normalizedServiceType
    : undefined;
}

function normalizeEmailAddress(email?: unknown) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function getCurrentStoredEmail() {
  const storedUserEmail = normalizeEmailAddress(readStoredUser()?.email);
  if (storedUserEmail) {
    return storedUserEmail;
  }

  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  return token ? normalizeEmailAddress(getSessionFromJwt(token)?.email) : '';
}

function readSelectedServiceTypesByUser(): Record<string, ServiceType> {
  const storedServiceTypes = localStorage.getItem(SELECTED_SERVICE_TYPE_BY_USER_STORAGE_KEY);
  if (!storedServiceTypes) {
    return {};
  }

  try {
    return Object.entries(JSON.parse(storedServiceTypes) as Record<string, unknown>).reduce<
      Record<string, ServiceType>
    >((serviceTypes, [email, serviceType]) => {
      const normalizedEmail = normalizeEmailAddress(email);
      const normalizedServiceType = normalizeServiceType(serviceType);

      if (normalizedEmail && normalizedServiceType) {
        serviceTypes[normalizedEmail] = normalizedServiceType;
      }

      return serviceTypes;
    }, {});
  } catch {
    localStorage.removeItem(SELECTED_SERVICE_TYPE_BY_USER_STORAGE_KEY);
    return {};
  }
}

function writeSelectedServiceTypesByUser(serviceTypes: Record<string, ServiceType>) {
  localStorage.setItem(SELECTED_SERVICE_TYPE_BY_USER_STORAGE_KEY, JSON.stringify(serviceTypes));
}

function storeSelectedServiceType(serviceType: ServiceType, email?: string) {
  const normalizedEmail = normalizeEmailAddress(email) || getCurrentStoredEmail();
  if (normalizedEmail) {
    writeSelectedServiceTypesByUser({
      ...readSelectedServiceTypesByUser(),
      [normalizedEmail]: serviceType,
    });
  }

  localStorage.setItem(SELECTED_SERVICE_TYPE_STORAGE_KEY, serviceType);
}

function readSelectedServiceType(email?: string): ServiceType | undefined {
  const requestedEmail = normalizeEmailAddress(email);
  const normalizedEmail = requestedEmail || getCurrentStoredEmail();
  const serviceTypesByUser = readSelectedServiceTypesByUser();

  if (normalizedEmail && serviceTypesByUser[normalizedEmail]) {
    return serviceTypesByUser[normalizedEmail];
  }

  if (requestedEmail) {
    return undefined;
  }

  return normalizeServiceType(localStorage.getItem(SELECTED_SERVICE_TYPE_STORAGE_KEY));
}

function clearAuthSession() {
  const selectedServiceType = readSelectedServiceType();
  if (selectedServiceType) {
    storeSelectedServiceType(selectedServiceType);
  }

  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  localStorage.removeItem(SELECTED_SERVICE_TYPE_STORAGE_KEY);
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

function joinNameParts(firstName?: unknown, lastName?: unknown) {
  return [
    typeof firstName === 'string' ? firstName.trim() : '',
    typeof lastName === 'string' ? lastName.trim() : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function getFullNameFromData(data: any) {
  return (
    (typeof data?.fullName === 'string' && data.fullName.trim()) ||
    (typeof data?.name === 'string' && data.name.trim()) ||
    joinNameParts(data?.firstName, data?.lastName) ||
    (typeof data?.user?.fullName === 'string' && data.user.fullName.trim()) ||
    (typeof data?.user?.name === 'string' && data.user.name.trim()) ||
    joinNameParts(data?.user?.firstName, data?.user?.lastName) ||
    (typeof data?.profile?.fullName === 'string' && data.profile.fullName.trim()) ||
    (typeof data?.profile?.name === 'string' && data.profile.name.trim()) ||
    joinNameParts(data?.profile?.firstName, data?.profile?.lastName) ||
    (typeof data?.userProfile?.fullName === 'string' && data.userProfile.fullName.trim()) ||
    (typeof data?.userProfile?.name === 'string' && data.userProfile.name.trim()) ||
    joinNameParts(data?.userProfile?.firstName, data?.userProfile?.lastName) ||
    ''
  );
}

function getEmailFromData(data: any) {
  return (
    (typeof data?.email === 'string' && data.email.trim()) ||
    (typeof data?.user?.email === 'string' && data.user.email.trim()) ||
    (typeof data?.profile?.email === 'string' && data.profile.email.trim()) ||
    (typeof data?.userProfile?.email === 'string' && data.userProfile.email.trim()) ||
    ''
  );
}

function getWebsiteId(data: any) {
  return String(data?.id || data?.websiteId || data?.biographyWebsiteId || data?.uuid || '');
}

function normalizeBiographyWebsite(data: any): BiographyWebsite {
  return {
    id: getWebsiteId(data),
    title: String(data?.title || 'Untitled Biography'),
    templateId: String(data?.templateId || ''),
    subjectType: String(data?.subjectType || 'SELF'),
    status: String(data?.status || 'DRAFT'),
    subdomain: typeof data?.subdomain === 'string' ? data.subdomain : undefined,
    createdAt: typeof data?.createdAt === 'string' ? data.createdAt : undefined,
    updatedAt: typeof data?.updatedAt === 'string' ? data.updatedAt : undefined,
  };
}

function getLocalBiographyWebsitesStorageKey() {
  const user = readStoredUser();
  const email = user?.email?.trim().toLowerCase() || 'anonymous';
  return `${LOCAL_BIOGRAPHY_WEBSITES_STORAGE_KEY}:${email}`;
}

function readLocalBiographyWebsites(): BiographyWebsite[] {
  const storedWebsites = localStorage.getItem(getLocalBiographyWebsitesStorageKey());
  if (!storedWebsites) {
    return [];
  }

  try {
    return (JSON.parse(storedWebsites) as any[])
      .map(normalizeBiographyWebsite)
      .filter((website) => Boolean(website.id));
  } catch {
    localStorage.removeItem(getLocalBiographyWebsitesStorageKey());
    return [];
  }
}

function writeLocalBiographyWebsites(websites: BiographyWebsite[]) {
  localStorage.setItem(getLocalBiographyWebsitesStorageKey(), JSON.stringify(websites));
}

function mergeBiographyWebsites(
  primaryWebsites: BiographyWebsite[],
  localWebsites: BiographyWebsite[]
) {
  const websitesById = new Map<string, BiographyWebsite>();

  primaryWebsites.forEach((website) => websitesById.set(website.id, website));
  localWebsites.forEach((website) => websitesById.set(website.id, website));

  return Array.from(websitesById.values()).sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });
}

function slugifyBiographyTitle(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'biography';
}

function createLocalBiographyWebsite(
  payload: LocalBiographyWebsitePayload,
  websiteId?: string
): BiographyWebsite {
  const websites = readLocalBiographyWebsites();
  const existingWebsite = websiteId
    ? websites.find((website) => website.id === websiteId)
    : undefined;
  const now = new Date().toISOString();
  const title = payload.title?.trim() || existingWebsite?.title || 'Untitled Biography';
  const id = existingWebsite?.id || websiteId || `local-${crypto.randomUUID()}`;

  const website: BiographyWebsite = {
    id,
    title,
    templateId: payload.templateId || existingWebsite?.templateId || 'life-journey',
    subjectType: payload.subjectType || existingWebsite?.subjectType || 'SELF',
    status: payload.status || existingWebsite?.status || 'DRAFT',
    subdomain: existingWebsite?.subdomain || slugifyBiographyTitle(title),
    createdAt: existingWebsite?.createdAt || now,
    updatedAt: now,
  };

  writeLocalBiographyWebsites([
    website,
    ...websites.filter((storedWebsite) => storedWebsite.id !== id),
  ]);

  return website;
}

function getLocalBiographyWebsite(websiteId: string) {
  return readLocalBiographyWebsites().find((website) => website.id === websiteId);
}

function getWebsiteFromResponse(data: any) {
  return data?.website || data?.biographyWebsite || data?.data || data;
}

function getWebsitesFromResponse(data: any) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.websites)) {
    return data.websites;
  }

  if (Array.isArray(data?.biographyWebsites)) {
    return data.biographyWebsites;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function getSessionFromJwt(token: string) {
  try {
    const [, payload] = token.split('.');
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalizedPayload));
    const email = typeof decoded.email === 'string' ? decoded.email : '';
    const expiresAt = typeof decoded.exp === 'number' ? decoded.exp * 1000 : 0;
    const fullName =
      typeof decoded.fullName === 'string'
        ? decoded.fullName.trim()
        : typeof decoded.name === 'string'
          ? decoded.name.trim()
          : joinNameParts(decoded.firstName, decoded.lastName);

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
    const fullName = getFullNameFromData(data) || tokenSession?.fullName || getKnownFullName(email);
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

    const savedServiceType = normalizeServiceType(data.serviceType) || serviceType;
    storeSelectedServiceType(savedServiceType);

    return {
      success: true,
      message: data.message || 'Service type saved successfully',
      serviceType: savedServiceType,
      onboardingStatus: data.onboardingStatus || 'COMPLETED',
    };
  },

  async getDashboard(): Promise<DashboardResponse> {
    const response = await fetch(apiUrl('/api/dashboard'), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to load dashboard'));
    }

    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const tokenSession = token ? getSessionFromJwt(token) : null;
    const email = getEmailFromData(data) || tokenSession?.email || '';
    const fullName = getFullNameFromData(data) || tokenSession?.fullName || getKnownFullName(email);

    const serviceType = normalizeServiceType(data.serviceType) || readSelectedServiceType(email);
    if (serviceType) {
      storeSelectedServiceType(serviceType, email);
    }

    return {
      success: true,
      message: data.message,
      user: email ? { fullName, email } : undefined,
      serviceType,
      onboardingStatus: data.onboardingStatus,
    };
  },

  async createBiographyWebsite(payload: CreateBiographyWebsitePayload): Promise<BiographyWebsite> {
    try {
      const response = await fetch(apiUrl('/api/websites'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to create biography website'));
      }

      return normalizeBiographyWebsite(getWebsiteFromResponse(data));
    } catch {
      return createLocalBiographyWebsite(payload);
    }
  },

  async getBiographyWebsites(): Promise<BiographyWebsite[]> {
    try {
      const response = await fetch(apiUrl('/api/websites'), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to load biography websites'));
      }

      return mergeBiographyWebsites(
        getWebsitesFromResponse(data).map(normalizeBiographyWebsite),
        readLocalBiographyWebsites()
      );
    } catch {
      return readLocalBiographyWebsites();
    }
  },

  async getBiographyWebsite(websiteId: string): Promise<BiographyWebsite> {
    const localWebsite = getLocalBiographyWebsite(websiteId);
    if (localWebsite) {
      return localWebsite;
    }

    try {
      const response = await fetch(apiUrl(`/api/websites/${encodeURIComponent(websiteId)}`), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to load biography website'));
      }

      return normalizeBiographyWebsite(getWebsiteFromResponse(data));
    } catch {
      throw new Error('Unable to load biography website');
    }
  }
};
