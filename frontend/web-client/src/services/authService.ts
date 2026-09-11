import { RegisterFormState } from '../types';
import { getEmailValidationError } from '../utils/emailValidation';

const DEFAULT_API_PORT = '8080';
const PRODUCTION_API_BASE_URL = 'https://biography-backend-omu6.onrender.com';
const AUTH_TOKEN_STORAGE_KEY = 'token';
const AUTH_USER_STORAGE_KEY = 'authUser';
const KNOWN_AUTH_USERS_STORAGE_KEY = 'knownAuthUsers';
const LOCAL_BIOGRAPHY_WEBSITES_STORAGE_KEY = 'localBiographyWebsites';
const SELECTED_SERVICE_TYPE_STORAGE_KEY = 'selectedServiceType';
const SELECTED_SERVICE_TYPE_BY_USER_STORAGE_KEY = 'selectedServiceTypeByUser';
const AUTH_SESSION_CHANNEL_NAME = 'xinghuoji.auth-session';
const AUTH_SESSION_REQUEST_TYPE = 'xinghuoji:auth-session-request';
const AUTH_SESSION_RESPONSE_TYPE = 'xinghuoji:auth-session-response';
const AUTH_SESSION_REQUEST_TIMEOUT_MS = 1200;

type AuthSessionHandoffMessage =
  | {
      type: typeof AUTH_SESSION_REQUEST_TYPE;
      requestId: string;
    }
  | {
      type: typeof AUTH_SESSION_RESPONSE_TYPE;
      requestId: string;
      token: string;
      user?: AuthResponse['user'];
    };

function getApiBaseUrl() {
  const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${DEFAULT_API_PORT}`;
  }

  return PRODUCTION_API_BASE_URL;
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

function getAuthorizationHeaders(): HeadersInit {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function getMultipartAuthHeaders(): HeadersInit {
  return getAuthorizationHeaders();
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string | null;
  resetToken?: string | null;
  user?: {
    fullName?: string;
    email: string;
    profilePhoto?: string | null;
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
  statistics?: {
    totalWebsites: number;
    drafts: number;
    published: number;
  };
  actions?: {
    hasDraft: boolean;
    latestDraftId: string | null;
  };
}

export type SubjectType = 'SELF' | 'PARENT' | 'GRANDPARENT' | 'CHILD' | 'SPOUSE' | 'LOVED_ONE';

export interface BiographyWebsite {
  id: string;
  title: string;
  templateId: string;
  subjectType: SubjectType | string;
  status: string;
  thumbnailUrl?: string;
  thumbnailGeneratedAt?: string;
  subdomain?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBiographyWebsitePayload {
  title: string;
  templateId: string;
  subjectType: SubjectType;
}

export interface BiographyTemplate {
  templateId: string;
  name: string;
  description: string;
  thumbnailUrl?: string;
  layoutKey: string;
  category?: string;
  premium: boolean;
}

export interface BiographyWebsiteSection {
  id: string;
  key: string;
  title: string;
  description?: string;
  order?: number;
  sortOrder?: number;
  isVisible?: boolean;
  content?: unknown;
}

export interface BiographyContactMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  createdAt?: string;
  status?: string;
}

export type MediaUsageType =
  | 'HERO_PROFILE'
  | 'HERO_BACKGROUND'
  | 'PURSUIT'
  | 'TIMELINE'
  | 'GALLERY'
  | 'STORY';

export interface BiographyMediaAsset {
  mediaAssetId: string;
  websiteId: string;
  usageType: MediaUsageType | string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  bucketName?: string;
  storageKey?: string;
  accessUrl?: string | null;
  createdAt?: string;
}

export type AiWritingActionType = 'GENERATE' | 'REWRITE' | 'IMPROVE_GRAMMAR' | 'EXPAND';
export type AiWritingLanguage = 'ENGLISH';

export interface AiWritingBasePayload {
  websiteId: string;
  sectionId?: string | null;
  sourceText?: string | null;
  userInstruction?: string | null;
  tone?: string | null;
  language: AiWritingLanguage;
}

export interface AiWritingRequestPayload extends AiWritingBasePayload {
  actionType: AiWritingActionType;
}

export interface AiWritingResponse {
  requestId: string;
  outputId: string;
  actionType: AiWritingActionType | string;
  generatedText: string;
  language: string;
  englishWordCount?: number;
  chineseCharacterCount?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  createdAt?: string;
}

export interface CurrentMembership {
  membershipId: string;
  planId: string;
  planName: string;
  status: string;
  startAt?: string;
  expiresAt?: string;
  autoRenew: boolean;
}

export interface MembershipPlan {
  planId: string;
  name: string;
  standardPrice: number;
  currency: string;
  durationMonths: number;
  refundWindowDays: number;
  active: boolean;
}

export type PaymentMethod = 'WECHAT' | string;

export interface CreatePaymentPayload {
  planId: string;
  paymentMethod: PaymentMethod;
}

export interface PaymentResponse {
  paymentId: string;
  membershipId?: string;
  paymentReference?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentRemark?: string;
  status: string;
  paidAt?: string;
  verifiedAt?: string;
  createdAt?: string;
}

export interface CreateRefundPayload {
  paymentId: string;
  reason: string;
}

export interface RefundResponse {
  refundId: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason?: string;
  status: string;
  createdAt?: string;
  requestedAt?: string;
  processedAt?: string;
}

export type AdminPaymentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'FAILED' | 'REFUNDED' | string;
export type AdminRefundStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | string;

export interface AdminPaymentResponse extends PaymentResponse {
  userId?: string;
  userName?: string;
  userEmail?: string;
  biographyTitle?: string;
  websiteId?: string;
  planId?: string;
  planName?: string;
  proofOfPaymentUrl?: string;
}

export interface ConfirmAdminPaymentPayload {
  paidAt?: string;
}

export interface AdminRefundResponse extends RefundResponse {
  userId?: string;
  userName?: string;
  userEmail?: string;
  refundMethod?: string;
  externalRefundReference?: string;
}

export interface CompleteAdminRefundPayload {
  refundMethod: string;
  externalRefundReference?: string;
}

export interface AdminMembershipResponse extends CurrentMembership {
  userId?: string;
}

const AI_WRITING_ENDPOINTS: Record<AiWritingActionType, string> = {
  GENERATE: '/api/ai-writing/generate',
  REWRITE: '/api/ai-writing/generate',
  IMPROVE_GRAMMAR: '/api/ai-writing/generate',
  EXPAND: '/api/ai-writing/generate',
};

export interface UpdateSectionSettingsPayload {
  isVisible: boolean;
  sortOrder: number;
}

export interface CreateHeroSectionPayload {
  fullName: string;
  designation: string;
  tagline: string;
  shortDescription: string;
  profileImageId: string;
  backgroundImageId: string;
  sortOrder: number;
  isVisible: boolean;
}

export type UpdateHeroSectionPayload = CreateHeroSectionPayload;

export interface CreateChronicleSectionPayload {
  sectionLabel: string;
  sectionTitle: string;
  sectionDescription: string;
  journal: {
    cardLabel: string;
    storyTitle: string;
    storyContent: string;
    quote: string;
  };
  beliefs: {
    cardLabel: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
      sortOrder: number;
    }>;
  };
  sortOrder: number;
  isVisible: boolean;
}

export interface UpdateChronicleSectionPayload {
  sectionLabel: string;
  sectionTitle: string;
  sectionDescription: string;
  journal: CreateChronicleSectionPayload['journal'];
  beliefs: {
    cardLabel: string;
    items: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
      sortOrder: number;
    }>;
  };
  sortOrder: number;
  isVisible: boolean;
}

export interface CreatePursuitsSectionPayload {
  sectionLabel: string;
  items: Array<{
    imageId: string;
    icon: string;
    title: string;
    description: string;
    sortOrder: number;
  }>;
  sortOrder: number;
  isVisible: boolean;
}

export interface UpdatePursuitsSectionPayload {
  sectionLabel: string;
  items: Array<{
    id: string;
    imageId: string;
    icon: string;
    title: string;
    description: string;
    sortOrder: number;
  }>;
  sortOrder: number;
  isVisible: boolean;
}

export interface CreateTimelineSectionPayload {
  sectionLabel: string;
  sectionTitle: string;
  sectionDescription: string;
  timelineEvents: Array<{
    timePeriod: string;
    title: string;
    location: string;
    quote: string;
    imageId: string;
    imageAltText: string;
    imageCaption: string;
    sortOrder: number;
    highlights: Array<{
      highlightText: string;
      sortOrder: number;
    }>;
  }>;
  sortOrder: number;
  isVisible: boolean;
}

export interface UpdateTimelineSectionPayload {
  sectionLabel: string;
  sectionTitle: string;
  sectionDescription: string;
  timelineEvents: Array<{
    id: string;
    timePeriod: string;
    title: string;
    location: string;
    quote: string;
    imageId: string;
    imageAltText: string;
    imageCaption: string;
    sortOrder: number;
    highlights: Array<{
      id: string;
      highlightText: string;
      sortOrder: number;
    }>;
  }>;
  sortOrder: number;
  isVisible: boolean;
}

export interface CreateGallerySectionPayload {
  sectionLabel: string;
  sectionTitle: string;
  sectionDescription: string;
  items: Array<{
    mediaAssetId: string;
    thumbnailAssetId: string;
    mediaType: 'IMAGE' | 'VIDEO';
    category: string;
    recordLabel: string;
    displayYear: string;
    title: string;
    description: string;
    altText: string;
    sortOrder: number;
  }>;
  sortOrder: number;
  isVisible: boolean;
}

export interface UpdateGallerySectionPayload {
  sectionLabel: string;
  sectionTitle: string;
  sectionDescription: string;
  items: Array<{
    id: string;
    mediaAssetId: string;
    thumbnailAssetId: string;
    mediaType: 'IMAGE' | 'VIDEO';
    category: string;
    recordLabel: string;
    displayYear: string;
    title: string;
    description: string;
    altText: string;
    sortOrder: number;
  }>;
  sortOrder: number;
  isVisible: boolean;
}

export interface CreateContactSectionPayload {
  sectionLabel: string;
  sectionTitle: string;
  sectionDescription: string;
  contactInfo: {
    label: string;
    email: string;
  };
  socialLinks: Array<{
    platform: 'LINKEDIN' | 'INSTAGRAM' | 'X' | 'FACEBOOK';
    displayName: string;
    profileUrl: string;
    icon: string;
    sortOrder: number;
  }>;
  formSettings: {
    title: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    subjectPlaceholder: string;
    messagePlaceholder: string;
    submitButtonText: string;
    successMessage: string;
    errorMessage: string;
  };
  sortOrder: number;
  isVisible: boolean;
}

export interface UpdateContactSectionPayload {
  sectionLabel: string;
  sectionTitle: string;
  sectionDescription: string;
  contactInfo: CreateContactSectionPayload['contactInfo'];
  socialLinks: Array<{
    id: string;
    platform: 'LINKEDIN' | 'INSTAGRAM' | 'X' | 'FACEBOOK';
    displayName: string;
    profileUrl: string;
    icon: string;
    sortOrder: number;
  }>;
  formSettings: CreateContactSectionPayload['formSettings'];
  sortOrder: number;
  isVisible: boolean;
}

export interface CreatePublicContactMessagePayload {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
}

export interface UpdateContactMessageStatusPayload {
  status: string;
}

function getMessage(data: any, fallback: string) {
  return data?.error || data?.message || fallback;
}

async function parseResponseBody(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
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

function createAuthSessionRequestId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function startAuthSessionHandoffResponder() {
  if (typeof BroadcastChannel === 'undefined') {
    return () => undefined;
  }

  const channel = new BroadcastChannel(AUTH_SESSION_CHANNEL_NAME);

  channel.onmessage = (event: MessageEvent<AuthSessionHandoffMessage>) => {
    const message = event.data;

    if (message?.type !== AUTH_SESSION_REQUEST_TYPE || !message.requestId) {
      return;
    }

    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (!token) {
      return;
    }

    channel.postMessage({
      type: AUTH_SESSION_RESPONSE_TYPE,
      requestId: message.requestId,
      token,
      user: readStoredUser(),
    });
  };

  return () => channel.close();
}

function ensureAuthSessionFromOpenTabs() {
  if (localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)) {
    return Promise.resolve(true);
  }

  if (typeof BroadcastChannel === 'undefined') {
    return Promise.resolve(false);
  }

  return new Promise<boolean>((resolve) => {
    const requestId = createAuthSessionRequestId();
    const channel = new BroadcastChannel(AUTH_SESSION_CHANNEL_NAME);

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      channel.close();
    };

    const timeoutId = window.setTimeout(() => {
      cleanup();
      resolve(Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)));
    }, AUTH_SESSION_REQUEST_TIMEOUT_MS);

    channel.onmessage = (event: MessageEvent<AuthSessionHandoffMessage>) => {
      const message = event.data;

      if (
        message?.type !== AUTH_SESSION_RESPONSE_TYPE ||
        message.requestId !== requestId ||
        !message.token
      ) {
        return;
      }

      storeAuthSession(message.token, message.user);
      cleanup();
      resolve(true);
    };

    channel.postMessage({
      type: AUTH_SESSION_REQUEST_TYPE,
      requestId,
    });
  });
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

function getNumberFromData(value: unknown, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
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
    thumbnailUrl: typeof data?.thumbnailUrl === 'string' ? data.thumbnailUrl : undefined,
    thumbnailGeneratedAt: typeof data?.thumbnailGeneratedAt === 'string' ? data.thumbnailGeneratedAt : undefined,
    subdomain: typeof data?.subdomain === 'string' ? data.subdomain : undefined,
    createdAt: typeof data?.createdAt === 'string' ? data.createdAt : undefined,
    updatedAt: typeof data?.updatedAt === 'string' ? data.updatedAt : undefined,
  };
}

function normalizeBiographyTemplate(data: any): BiographyTemplate {
  return {
    templateId: String(data?.templateId || data?.id || ''),
    name: String(data?.name || data?.title || 'Untitled Template'),
    description: String(data?.description || ''),
    thumbnailUrl: typeof data?.thumbnailUrl === 'string' ? data.thumbnailUrl : undefined,
    layoutKey: String(data?.layoutKey || data?.templateId || data?.id || ''),
    category: typeof data?.category === 'string' ? data.category : undefined,
    premium: Boolean(data?.premium),
  };
}

function normalizeBiographyWebsiteSection(
  data: any,
  index: number,
  fallback?: Partial<BiographyWebsiteSection>
): BiographyWebsiteSection {
  const key = String(
    data?.key ||
      data?.sectionKey ||
      data?.sectionType ||
      data?.type ||
      data?.slug ||
      data?.name ||
      fallback?.key ||
      `section-${index + 1}`
  );
  const title = String(data?.title || data?.name || fallback?.title || key || `Section ${index + 1}`);
  const order = Number(data?.order ?? data?.sortOrder ?? data?.position ?? fallback?.order ?? index + 1);
  const sortOrder = Number(data?.sortOrder ?? data?.order ?? data?.position ?? fallback?.sortOrder ?? order);
  const isVisible =
    typeof data?.isVisible === 'boolean'
      ? data.isVisible
      : typeof data?.visible === 'boolean'
        ? data.visible
        : fallback?.isVisible;

  return {
    id: String(data?.sectionId || data?.id || data?.websiteSectionId || data?.uuid || fallback?.id || key),
    key,
    title,
    description: typeof data?.description === 'string' ? data.description : fallback?.description,
    order: Number.isFinite(order) ? order : index + 1,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : Number.isFinite(order) ? order : index + 1,
    isVisible,
    content: data?.content ?? data?.hero ?? fallback?.content ?? data,
  };
}

function normalizeBiographyContactMessage(data: any, index: number): BiographyContactMessage {
  return {
    id: String(data?.messageId || data?.contactMessageId || data?.id || data?.uuid || `message-${index + 1}`),
    senderName: String(data?.senderName || data?.name || data?.fullName || ''),
    senderEmail: String(data?.senderEmail || data?.email || ''),
    subject: String(data?.subject || ''),
    message: String(data?.message || data?.content || data?.body || ''),
    createdAt:
      typeof data?.createdAt === 'string'
        ? data.createdAt
        : typeof data?.submittedAt === 'string'
          ? data.submittedAt
          : undefined,
    status: typeof data?.status === 'string' ? data.status : undefined,
  };
}

function normalizeBiographyMediaAsset(data: any): BiographyMediaAsset {
  return {
    mediaAssetId: String(data?.mediaAssetId || data?.id || data?.assetId || ''),
    websiteId: String(data?.websiteId || ''),
    usageType: String(data?.usageType || ''),
    originalFilename: String(data?.originalFilename || data?.filename || data?.name || ''),
    mimeType: String(data?.mimeType || data?.contentType || ''),
    fileSize: Number(data?.fileSize || data?.size || 0),
    width: Number.isFinite(Number(data?.width)) ? Number(data.width) : undefined,
    height: Number.isFinite(Number(data?.height)) ? Number(data.height) : undefined,
    bucketName: typeof data?.bucketName === 'string' ? data.bucketName : undefined,
    storageKey: typeof data?.storageKey === 'string' ? data.storageKey : undefined,
    accessUrl:
      typeof data?.accessUrl === 'string'
        ? data.accessUrl
        : typeof data?.url === 'string'
          ? data.url
          : typeof data?.signedUrl === 'string'
            ? data.signedUrl
            : null,
    createdAt: typeof data?.createdAt === 'string' ? data.createdAt : undefined,
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

function isBackendBiographyWebsite(website: BiographyWebsite) {
  return Boolean(website.id && !website.id.startsWith('local-'));
}

function readCachedBackendBiographyWebsites() {
  return readLocalBiographyWebsites().filter(isBackendBiographyWebsite);
}

function removeLocalOnlyBiographyWebsites() {
  const backendWebsites = readCachedBackendBiographyWebsites();
  writeLocalBiographyWebsites(backendWebsites);
  return backendWebsites;
}

function cacheBiographyWebsite(website: BiographyWebsite) {
  if (!isBackendBiographyWebsite(website)) {
    return;
  }

  const websites = readCachedBackendBiographyWebsites();
  writeLocalBiographyWebsites([
    {
      ...website,
      updatedAt: website.updatedAt || new Date().toISOString(),
    },
    ...websites.filter((storedWebsite) => storedWebsite.id !== website.id),
  ]);
}

function mergeBiographyWebsites(
  primaryWebsites: BiographyWebsite[],
  localWebsites: BiographyWebsite[]
) {
  const websitesById = new Map<string, BiographyWebsite>();

  localWebsites.forEach((website) => websitesById.set(website.id, website));
  primaryWebsites.forEach((website) => websitesById.set(website.id, website));

  return Array.from(websitesById.values()).sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });
}

function getLocalBiographyWebsite(websiteId: string) {
  return readLocalBiographyWebsites().find((website) => website.id === websiteId);
}

function removeLocalBiographyWebsite(websiteId: string) {
  if (!websiteId || !websiteId.startsWith('local-')) {
    return false;
  }

  const websites = readLocalBiographyWebsites();
  const nextWebsites = websites.filter((website) => website.id !== websiteId);

  if (nextWebsites.length === websites.length) {
    return false;
  }

  writeLocalBiographyWebsites(nextWebsites);
  return true;
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

function getTemplatesFromResponse(data: any) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.templates)) {
    return data.templates;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function getSectionsFromResponse(data: any) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.sections)) {
    return data.sections;
  }

  if (Array.isArray(data?.websiteSections)) {
    return data.websiteSections;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.content?.sections)) {
    return data.content.sections;
  }

  return [];
}

function getContactMessagesFromResponse(data: any) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.contactMessages)) {
    return data.contactMessages;
  }

  if (Array.isArray(data?.messages)) {
    return data.messages;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.content?.contactMessages)) {
    return data.content.contactMessages;
  }

  return [];
}

function getMediaAssetsFromResponse(data: any) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.mediaAssets)) {
    return data.mediaAssets;
  }

  if (Array.isArray(data?.assets)) {
    return data.assets;
  }

  if (Array.isArray(data?.media)) {
    return data.media;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.content?.mediaAssets)) {
    return data.content.mediaAssets;
  }

  return [];
}

function getSectionFromResponse(data: any) {
  return data?.section || data?.websiteSection || data?.data || data;
}

function getMediaAssetFromResponse(data: any) {
  return data?.mediaAsset || data?.asset || data?.data || data;
}

function getAiWritingFromResponse(data: any) {
  return data?.aiWriting || data?.writing || data?.result || data?.output || data?.data || data;
}

function getMembershipFromResponse(data: any) {
  return data?.membership || data?.currentMembership || data?.data || data;
}

function getMembershipPlansFromResponse(data: any) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.plans)) {
    return data.plans;
  }

  if (Array.isArray(data?.membershipPlans)) {
    return data.membershipPlans;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function getPaymentFromResponse(data: any) {
  return data?.payment || data?.currentPayment || data?.data || data;
}

function getRefundFromResponse(data: any) {
  return data?.refund || data?.data || data;
}

function getAdminPaymentsFromResponse(data: any) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.payments)) {
    return data.payments;
  }

  if (Array.isArray(data?.adminPayments)) {
    return data.adminPayments;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function getAdminRefundsFromResponse(data: any) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.refunds)) {
    return data.refunds;
  }

  if (Array.isArray(data?.adminRefunds)) {
    return data.adminRefunds;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function normalizeAiWritingResponse(data: any): AiWritingResponse {
  return {
    requestId: String(data?.requestId || ''),
    outputId: String(data?.outputId || ''),
    actionType: String(data?.actionType || ''),
    generatedText: String(data?.generatedText || data?.text || data?.outputText || ''),
    language: String(data?.language || 'ENGLISH'),
    englishWordCount:
      data?.englishWordCount == null ? undefined : getNumberFromData(data.englishWordCount),
    chineseCharacterCount:
      data?.chineseCharacterCount == null ? undefined : getNumberFromData(data.chineseCharacterCount),
    inputTokens: data?.inputTokens == null ? undefined : getNumberFromData(data.inputTokens),
    outputTokens: data?.outputTokens == null ? undefined : getNumberFromData(data.outputTokens),
    totalTokens: data?.totalTokens == null ? undefined : getNumberFromData(data.totalTokens),
    createdAt: typeof data?.createdAt === 'string' ? data.createdAt : undefined,
  };
}

function normalizeCurrentMembership(data: any): CurrentMembership {
  return {
    membershipId: String(data?.membershipId || data?.id || ''),
    planId: String(data?.planId || ''),
    planName: String(data?.planName || data?.name || ''),
    status: String(data?.status || ''),
    startAt: typeof data?.startAt === 'string' ? data.startAt : undefined,
    expiresAt: typeof data?.expiresAt === 'string' ? data.expiresAt : undefined,
    autoRenew: Boolean(data?.autoRenew),
  };
}

function normalizeMembershipPlan(data: any): MembershipPlan {
  return {
    planId: String(data?.planId || data?.id || ''),
    name: String(data?.name || data?.planName || 'Membership Plan'),
    standardPrice: getNumberFromData(data?.standardPrice ?? data?.price),
    currency: String(data?.currency || ''),
    durationMonths: getNumberFromData(data?.durationMonths),
    refundWindowDays: getNumberFromData(data?.refundWindowDays),
    active: typeof data?.active === 'boolean' ? data.active : true,
  };
}

function normalizePaymentResponse(data: any): PaymentResponse {
  return {
    paymentId: String(data?.paymentId || data?.id || ''),
    membershipId:
      typeof data?.membershipId === 'string' && data.membershipId.trim()
        ? data.membershipId
        : undefined,
    paymentReference:
      typeof data?.paymentReference === 'string' && data.paymentReference.trim()
        ? data.paymentReference
        : undefined,
    amount: getNumberFromData(data?.amount),
    currency: String(data?.currency || ''),
    paymentMethod: String(data?.paymentMethod || ''),
    paymentRemark:
      typeof data?.paymentRemark === 'string' && data.paymentRemark.trim()
        ? data.paymentRemark
        : undefined,
    status: String(data?.status || ''),
    paidAt: typeof data?.paidAt === 'string' ? data.paidAt : undefined,
    verifiedAt: typeof data?.verifiedAt === 'string' ? data.verifiedAt : undefined,
    createdAt: typeof data?.createdAt === 'string' ? data.createdAt : undefined,
  };
}

function normalizeRefundResponse(data: any): RefundResponse {
  return {
    refundId: String(data?.refundId || data?.id || ''),
    paymentId: String(data?.paymentId || ''),
    amount: getNumberFromData(data?.amount),
    currency: String(data?.currency || ''),
    reason: typeof data?.reason === 'string' ? data.reason : undefined,
    status: String(data?.status || ''),
    createdAt: typeof data?.createdAt === 'string' ? data.createdAt : undefined,
    requestedAt: typeof data?.requestedAt === 'string' ? data.requestedAt : undefined,
    processedAt: typeof data?.processedAt === 'string' ? data.processedAt : undefined,
  };
}

function normalizeAdminPaymentResponse(data: any): AdminPaymentResponse {
  const payment = normalizePaymentResponse(data);
  const user = data?.user || data?.account || data?.member || {};
  const website = data?.website || data?.biographyWebsite || data?.biography || {};
  const plan = data?.plan || data?.membershipPlan || {};

  return {
    ...payment,
    paymentId: payment.paymentId || String(data?.paymentId || data?.id || ''),
    userId:
      typeof data?.userId === 'string' && data.userId.trim()
        ? data.userId
        : typeof user?.userId === 'string' && user.userId.trim()
          ? user.userId
          : typeof user?.id === 'string' && user.id.trim()
            ? user.id
            : undefined,
    userName:
      String(data?.userName || data?.customerName || getFullNameFromData(data) || getFullNameFromData(user) || '') ||
      undefined,
    userEmail:
      String(data?.userEmail || data?.email || getEmailFromData(data) || getEmailFromData(user) || '') ||
      undefined,
    biographyTitle:
      String(
        data?.biographyTitle ||
          data?.websiteTitle ||
          website?.title ||
          data?.title ||
          ''
      ) || undefined,
    websiteId:
      typeof data?.websiteId === 'string' && data.websiteId.trim()
        ? data.websiteId
        : typeof website?.websiteId === 'string' && website.websiteId.trim()
          ? website.websiteId
          : typeof website?.id === 'string' && website.id.trim()
            ? website.id
            : undefined,
    planId:
      typeof data?.planId === 'string' && data.planId.trim()
        ? data.planId
        : typeof plan?.planId === 'string' && plan.planId.trim()
          ? plan.planId
          : undefined,
    planName:
      String(
        data?.planName ||
          (typeof data?.plan === 'string' ? data.plan : '') ||
          plan?.name ||
          ''
      ) || undefined,
    proofOfPaymentUrl:
      typeof data?.proofOfPaymentUrl === 'string' && data.proofOfPaymentUrl.trim()
        ? data.proofOfPaymentUrl
        : typeof data?.proofUrl === 'string' && data.proofUrl.trim()
          ? data.proofUrl
          : undefined,
  };
}

function normalizeAdminRefundResponse(data: any): AdminRefundResponse {
  const refund = normalizeRefundResponse(data);
  const user = data?.user || data?.account || data?.member || data?.payment?.user || {};

  return {
    ...refund,
    refundId: refund.refundId || String(data?.refundId || data?.id || ''),
    paymentId: refund.paymentId || String(data?.paymentId || data?.payment?.paymentId || data?.payment?.id || ''),
    userId:
      typeof data?.userId === 'string' && data.userId.trim()
        ? data.userId
        : typeof user?.userId === 'string' && user.userId.trim()
          ? user.userId
          : typeof user?.id === 'string' && user.id.trim()
            ? user.id
            : undefined,
    userName:
      String(data?.userName || getFullNameFromData(data) || getFullNameFromData(user) || '') ||
      undefined,
    userEmail:
      String(data?.userEmail || data?.email || getEmailFromData(data) || getEmailFromData(user) || '') ||
      undefined,
    refundMethod:
      typeof data?.refundMethod === 'string' && data.refundMethod.trim()
        ? data.refundMethod
        : undefined,
    externalRefundReference:
      typeof data?.externalRefundReference === 'string' && data.externalRefundReference.trim()
        ? data.externalRefundReference
        : undefined,
  };
}

function normalizeAdminMembershipResponse(data: any): AdminMembershipResponse {
  const membership = normalizeCurrentMembership(getMembershipFromResponse(data));

  return {
    ...membership,
    userId:
      typeof data?.userId === 'string' && data.userId.trim()
        ? data.userId
        : typeof data?.user?.userId === 'string' && data.user.userId.trim()
          ? data.user.userId
          : typeof data?.user?.id === 'string' && data.user.id.trim()
            ? data.user.id
            : undefined,
  };
}

async function requestAiWriting(payload: AiWritingRequestPayload): Promise<AiWritingResponse> {
  const response = await fetch(apiUrl(AI_WRITING_ENDPOINTS[payload.actionType]), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      websiteId: payload.websiteId,
      sectionId: null,
      actionType: payload.actionType,
      sourceText: payload.sourceText ?? null,
      userInstruction: payload.userInstruction ?? null,
      tone: payload.tone ?? null,
      language: payload.language,
    }),
  });

  const text = await response.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(getMessage(data, 'Unable to process AI writing request'));
  }

  const aiWriting = normalizeAiWritingResponse(getAiWritingFromResponse(data));

  if (!aiWriting.generatedText.trim()) {
    throw new Error('AI writing endpoint returned empty text');
  }

  return aiWriting;
}

async function createBackendBiographyWebsiteRequest(
  payload: CreateBiographyWebsitePayload
): Promise<BiographyWebsite> {
  const response = await fetch(apiUrl('/api/websites'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(getMessage(data, 'Unable to create biography website'));
  }

  const website = normalizeBiographyWebsite(getWebsiteFromResponse(data));

  if (!website.id || website.id.startsWith('local-')) {
    throw new Error('Backend did not return a valid websiteId');
  }

  cacheBiographyWebsite(website);

  return website;
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
  startAuthSessionHandoffResponder(): () => void {
    return startAuthSessionHandoffResponder();
  },

  ensureAuthSessionFromOpenTabs(): Promise<boolean> {
    return ensureAuthSessionFromOpenTabs();
  },

  getSavedServiceType(email?: string): ServiceType | undefined {
    return readSelectedServiceType(email);
  },

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
    const profilePhoto =
      typeof data?.user?.profilePhoto === 'string' && data.user.profilePhoto.trim()
        ? data.user.profilePhoto.trim()
        : typeof data?.profilePhoto === 'string' && data.profilePhoto.trim()
          ? data.profilePhoto.trim()
          : null;

    const serviceType =
      normalizeServiceType(data.serviceType) ||
      normalizeServiceType(data?.user?.serviceType) ||
      readSelectedServiceType(email);
    if (serviceType) {
      storeSelectedServiceType(serviceType, email);
    }

    return {
      success: true,
      message: data.message,
      user: email ? { fullName, email, profilePhoto } : undefined,
      serviceType,
      onboardingStatus: data.onboardingStatus,
      statistics: data.statistics
        ? {
            totalWebsites: getNumberFromData(data.statistics.totalWebsites),
            drafts: getNumberFromData(data.statistics.drafts),
            published: getNumberFromData(data.statistics.published),
          }
        : undefined,
      actions: data.actions
        ? {
            hasDraft: Boolean(data.actions.hasDraft),
            latestDraftId:
              typeof data.actions.latestDraftId === 'string' && data.actions.latestDraftId.trim()
                ? data.actions.latestDraftId
                : null,
          }
        : undefined,
    };
  },

  async getCurrentMembership(): Promise<CurrentMembership | null> {
    const response = await fetch(apiUrl('/api/membership/current'), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (response.status === 204) {
      return null;
    }

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to load current membership'));
    }

    const membership = normalizeCurrentMembership(getMembershipFromResponse(data));
    return membership.membershipId ? membership : null;
  },

  async getMembershipPlans(): Promise<MembershipPlan[]> {
    const response = await fetch(apiUrl('/api/membership/plans'), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to load membership plans'));
    }

    return getMembershipPlansFromResponse(data)
      .map((plan: any) => normalizeMembershipPlan(plan))
      .filter((plan: MembershipPlan) => Boolean(plan.planId));
  },

  async createPayment(payload: CreatePaymentPayload): Promise<PaymentResponse> {
    const response = await fetch(apiUrl('/api/payments'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to create payment request'));
    }

    return normalizePaymentResponse(getPaymentFromResponse(data));
  },

  async getCurrentPayment(): Promise<PaymentResponse | null> {
    const response = await fetch(apiUrl('/api/payments/current'), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (response.status === 204 || response.status === 404) {
      return null;
    }

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to load current payment'));
    }

    const payment = normalizePaymentResponse(getPaymentFromResponse(data));
    return payment.paymentId ? payment : null;
  },

  async getPayment(paymentId: string): Promise<PaymentResponse> {
    const response = await fetch(apiUrl(`/api/payments/${encodeURIComponent(paymentId)}`), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to load payment'));
    }

    return normalizePaymentResponse(getPaymentFromResponse(data));
  },

  async createRefund(payload: CreateRefundPayload): Promise<RefundResponse> {
    const response = await fetch(apiUrl('/api/refunds'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to create refund request'));
    }

    return normalizeRefundResponse(getRefundFromResponse(data));
  },

  async getRefund(refundId: string): Promise<RefundResponse> {
    const response = await fetch(apiUrl(`/api/refunds/${encodeURIComponent(refundId)}`), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to load refund request'));
    }

    return normalizeRefundResponse(getRefundFromResponse(data));
  },

  async getAdminPayments(status?: AdminPaymentStatus): Promise<AdminPaymentResponse[]> {
    const path =
      status && status !== 'All'
        ? `/api/admin/payments?status=${encodeURIComponent(status)}`
        : '/api/admin/payments';
    const response = await fetch(apiUrl(path), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to load admin payments'));
    }

    return getAdminPaymentsFromResponse(data)
      .map((payment: any) => normalizeAdminPaymentResponse(payment))
      .filter((payment: AdminPaymentResponse) => Boolean(payment.paymentId));
  },

  async getAdminPayment(paymentId: string): Promise<AdminPaymentResponse> {
    const response = await fetch(apiUrl(`/api/admin/payments/${encodeURIComponent(paymentId)}`), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to load admin payment details'));
    }

    return normalizeAdminPaymentResponse(getPaymentFromResponse(data));
  },

  async confirmAdminPayment(
    paymentId: string,
    payload?: ConfirmAdminPaymentPayload
  ): Promise<AdminPaymentResponse> {
    const hasBody = Boolean(payload?.paidAt);
    const response = await fetch(
      apiUrl(`/api/admin/payments/${encodeURIComponent(paymentId)}/confirm`),
      {
        method: 'PATCH',
        headers: hasBody ? getAuthHeaders() : getAuthorizationHeaders(),
        body: hasBody ? JSON.stringify(payload) : undefined,
      }
    );

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to confirm payment'));
    }

    return normalizeAdminPaymentResponse(getPaymentFromResponse(data));
  },

  async rejectAdminPayment(paymentId: string): Promise<AdminPaymentResponse> {
    const response = await fetch(
      apiUrl(`/api/admin/payments/${encodeURIComponent(paymentId)}/reject`),
      {
        method: 'PATCH',
        headers: getAuthorizationHeaders(),
      }
    );

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to reject payment'));
    }

    return normalizeAdminPaymentResponse(getPaymentFromResponse(data));
  },

  async getAdminRefunds(status?: AdminRefundStatus): Promise<AdminRefundResponse[]> {
    const path =
      status && status !== 'All'
        ? `/api/admin/refunds?status=${encodeURIComponent(status)}`
        : '/api/admin/refunds';
    const response = await fetch(apiUrl(path), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to load admin refunds'));
    }

    return getAdminRefundsFromResponse(data)
      .map((refund: any) => normalizeAdminRefundResponse(refund))
      .filter((refund: AdminRefundResponse) => Boolean(refund.refundId));
  },

  async getAdminRefund(refundId: string): Promise<AdminRefundResponse> {
    const response = await fetch(apiUrl(`/api/admin/refunds/${encodeURIComponent(refundId)}`), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to load admin refund details'));
    }

    return normalizeAdminRefundResponse(getRefundFromResponse(data));
  },

  async approveAdminRefund(refundId: string): Promise<AdminRefundResponse> {
    const response = await fetch(
      apiUrl(`/api/admin/refunds/${encodeURIComponent(refundId)}/approve`),
      {
        method: 'PATCH',
        headers: getAuthorizationHeaders(),
      }
    );

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to approve refund'));
    }

    return normalizeAdminRefundResponse(getRefundFromResponse(data));
  },

  async rejectAdminRefund(refundId: string): Promise<AdminRefundResponse> {
    const response = await fetch(
      apiUrl(`/api/admin/refunds/${encodeURIComponent(refundId)}/reject`),
      {
        method: 'PATCH',
        headers: getAuthorizationHeaders(),
      }
    );

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to reject refund'));
    }

    return normalizeAdminRefundResponse(getRefundFromResponse(data));
  },

  async completeAdminRefund(
    refundId: string,
    payload: CompleteAdminRefundPayload
  ): Promise<AdminRefundResponse> {
    const response = await fetch(
      apiUrl(`/api/admin/refunds/${encodeURIComponent(refundId)}/complete`),
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to complete refund'));
    }

    return normalizeAdminRefundResponse(getRefundFromResponse(data));
  },

  async getAdminUserMembership(userId: string): Promise<AdminMembershipResponse | null> {
    const response = await fetch(
      apiUrl(`/api/admin/users/${encodeURIComponent(userId)}/membership`),
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 204 || response.status === 404) {
      return null;
    }

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(getMessage(data, 'Unable to load admin user membership'));
    }

    const membership = normalizeAdminMembershipResponse(data);
    return membership.membershipId ? membership : null;
  },

  async createAiWritingSuggestion(payload: AiWritingRequestPayload): Promise<AiWritingResponse> {
    return requestAiWriting(payload);
  },

  async generateAiWriting(payload: AiWritingBasePayload): Promise<AiWritingResponse> {
    return requestAiWriting({ ...payload, actionType: 'GENERATE' });
  },

  async rewriteAiWriting(payload: AiWritingBasePayload): Promise<AiWritingResponse> {
    return requestAiWriting({ ...payload, actionType: 'REWRITE' });
  },

  async improveAiWriting(payload: AiWritingBasePayload): Promise<AiWritingResponse> {
    return requestAiWriting({ ...payload, actionType: 'IMPROVE_GRAMMAR' });
  },

  async expandAiWriting(payload: AiWritingBasePayload): Promise<AiWritingResponse> {
    return requestAiWriting({ ...payload, actionType: 'EXPAND' });
  },

  async createBackendBiographyWebsite(payload: CreateBiographyWebsitePayload): Promise<BiographyWebsite> {
    return createBackendBiographyWebsiteRequest(payload);
  },

  async createBiographyWebsite(payload: CreateBiographyWebsitePayload): Promise<BiographyWebsite> {
    return createBackendBiographyWebsiteRequest(payload);
  },

  removeLocalBiographyWebsite(websiteId: string): boolean {
    return removeLocalBiographyWebsite(websiteId);
  },

  async getBiographyTemplates(): Promise<BiographyTemplate[]> {
    try {
      const response = await fetch(apiUrl('/api/templates'), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to load biography templates'));
      }

      return getTemplatesFromResponse(data).map(normalizeBiographyTemplate);
    } catch {
      return [];
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

      const backendWebsites = getWebsitesFromResponse(data)
        .map(normalizeBiographyWebsite)
        .filter(isBackendBiographyWebsite);
      const cachedBackendWebsites = removeLocalOnlyBiographyWebsites();

      return mergeBiographyWebsites(backendWebsites, cachedBackendWebsites);
    } catch {
      return readCachedBackendBiographyWebsites();
    }
  },

  async deleteBiographyWebsite(websiteId: string): Promise<void> {
    let response: Response;
    try {
      response = await fetch(apiUrl(`/api/websites/${encodeURIComponent(websiteId)}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch {
      throw new Error('Unable to reach the biography API. Check your connection and try again.');
    }
    if (response.status !== 204) {
      const data = await response.json().catch(() => null);
      throw new Error(response.status === 404
        ? 'Biography not found or you do not have permission to delete it.'
        : getMessage(data, 'Unable to delete biography. Please try again.'));
    }
    removeLocalBiographyWebsite(websiteId);
  },

  async getBiographyWebsite(websiteId: string): Promise<BiographyWebsite> {
    if (websiteId.startsWith('local-')) {
      throw new Error('This biography has not been saved to the backend yet');
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

      const website = normalizeBiographyWebsite(getWebsiteFromResponse(data));
      cacheBiographyWebsite(website);
      return website;
    } catch {
      const cachedWebsite = getLocalBiographyWebsite(websiteId);
      if (cachedWebsite && isBackendBiographyWebsite(cachedWebsite)) {
        return cachedWebsite;
      }

      throw new Error('Unable to load biography website');
    }
  },

  async getBiographyWebsiteSections(websiteId: string): Promise<BiographyWebsiteSection[]> {
    if (!websiteId || websiteId.startsWith('local-')) {
      return [];
    }

    try {
      const response = await fetch(apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/sections`), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to load biography sections'));
      }

      const sections: BiographyWebsiteSection[] = getSectionsFromResponse(data).map(
        normalizeBiographyWebsiteSection
      );

      return sections
        .sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0));
    } catch {
      return [];
    }
  },

  async getBiographyWebsiteContactMessages(websiteId: string): Promise<BiographyContactMessage[]> {
    if (!websiteId || websiteId.startsWith('local-')) {
      return [];
    }

    try {
      const response = await fetch(apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/contact-messages`), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to load contact messages'));
      }

      const messages: BiographyContactMessage[] = getContactMessagesFromResponse(data).map(
        normalizeBiographyContactMessage
      );

      return messages
        .filter((message) => Boolean(message.id))
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
    } catch {
      return [];
    }
  },

  async getBiographyWebsiteMedia(websiteId: string): Promise<BiographyMediaAsset[]> {
    if (!websiteId || websiteId.startsWith('local-')) {
      return [];
    }

    try {
      const response = await fetch(apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/media`), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to load media assets'));
      }

      const mediaAssets: BiographyMediaAsset[] = getMediaAssetsFromResponse(data).map(
        normalizeBiographyMediaAsset
      );

      return mediaAssets
        .filter((mediaAsset) => Boolean(mediaAsset.mediaAssetId))
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
    } catch {
      return [];
    }
  },

  async uploadBiographyWebsiteMedia(
    websiteId: string,
    file: File,
    usageType: MediaUsageType,
    throwOnError = false
  ): Promise<BiographyMediaAsset | null> {
    if (!websiteId || websiteId.startsWith('local-')) {
      return null;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('usageType', usageType);

      const response = await fetch(apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/media`), {
        method: 'POST',
        headers: getMultipartAuthHeaders(),
        body: formData,
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to upload media'));
      }

      const mediaAsset = normalizeBiographyMediaAsset(getMediaAssetFromResponse(data));
      return mediaAsset.mediaAssetId ? mediaAsset : null;
    } catch (error) {
      if (throwOnError) throw error;
      return null;
    }
  },

  async updateBiographyThumbnail(websiteId: string, thumbnailUrl: string): Promise<void> {
    const response = await fetch(apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/thumbnail`), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ thumbnailUrl }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(getMessage(data, 'Unable to save the biography thumbnail'));
    }
  },

  async getBiographyWebsiteMediaAccessUrl(websiteId: string, mediaAssetId: string): Promise<string | null> {
    if (!websiteId || !mediaAssetId || websiteId.startsWith('local-')) {
      return null;
    }

    try {
      const response = await fetch(
        apiUrl(
          `/api/websites/${encodeURIComponent(websiteId)}/media/${encodeURIComponent(mediaAssetId)}/access-url`
        ),
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to load media access URL'));
      }

      return typeof data?.accessUrl === 'string' && data.accessUrl ? data.accessUrl : null;
    } catch {
      return null;
    }
  },

  async deleteBiographyWebsiteMedia(websiteId: string, mediaAssetId: string): Promise<boolean> {
    if (!websiteId || !mediaAssetId || websiteId.startsWith('local-')) {
      return false;
    }

    try {
      const response = await fetch(
        apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/media/${encodeURIComponent(mediaAssetId)}`),
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = { message: text };
        }

        throw new Error(getMessage(data, 'Unable to delete media'));
      }

      return true;
    } catch {
      return false;
    }
  },

  async updateBiographyContactMessageStatus(
    websiteId: string,
    messageId: string,
    payload: UpdateContactMessageStatusPayload
  ): Promise<boolean> {
    if (!websiteId || !messageId || websiteId.startsWith('local-')) {
      return false;
    }

    try {
      const response = await fetch(
        apiUrl(
          `/api/websites/${encodeURIComponent(websiteId)}/contact-messages/${encodeURIComponent(messageId)}/status`
        ),
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = { message: text };
        }

        throw new Error(getMessage(data, 'Unable to update contact message status'));
      }

      return true;
    } catch {
      return false;
    }
  },

  async deleteBiographyContactMessage(websiteId: string, messageId: string): Promise<boolean> {
    if (!websiteId || !messageId || websiteId.startsWith('local-')) {
      return false;
    }

    try {
      const response = await fetch(
        apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/contact-messages/${encodeURIComponent(messageId)}`),
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = { message: text };
        }

        throw new Error(getMessage(data, 'Unable to delete contact message'));
      }

      return true;
    } catch {
      return false;
    }
  },

  async getBiographyWebsiteSection(
    websiteId: string,
    sectionId: string
  ): Promise<BiographyWebsiteSection | null> {
    if (!websiteId || !sectionId || websiteId.startsWith('local-')) {
      return null;
    }

    try {
      const response = await fetch(
        apiUrl(
          `/api/websites/${encodeURIComponent(websiteId)}/sections/${encodeURIComponent(sectionId)}`
        ),
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to load biography section'));
      }

      return normalizeBiographyWebsiteSection(getSectionFromResponse(data), 0);
    } catch {
      return null;
    }
  },

  async updateBiographyWebsiteSectionSettings(
    websiteId: string,
    sectionId: string,
    payload: UpdateSectionSettingsPayload
  ): Promise<BiographyWebsiteSection | null> {
    if (!websiteId || !sectionId || websiteId.startsWith('local-')) {
      return null;
    }

    try {
      const response = await fetch(
        apiUrl(
          `/api/websites/${encodeURIComponent(websiteId)}/sections/${encodeURIComponent(sectionId)}/settings`
        ),
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to update section settings'));
      }

      return data
        ? normalizeBiographyWebsiteSection(getSectionFromResponse(data), 0, {
            id: sectionId,
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
          })
        : {
            id: sectionId,
            key: sectionId,
            title: sectionId,
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
          };
    } catch {
      return null;
    }
  },

  async deleteBiographyWebsiteSection(websiteId: string, sectionId: string): Promise<boolean> {
    if (!websiteId || !sectionId || websiteId.startsWith('local-')) {
      return false;
    }

    try {
      const response = await fetch(
        apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/sections/${encodeURIComponent(sectionId)}`),
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = { message: text };
        }

        throw new Error(getMessage(data, 'Unable to delete biography section'));
      }

      return true;
    } catch {
      return false;
    }
  },

  async createHeroSection(
    websiteId: string,
    payload: CreateHeroSectionPayload
  ): Promise<BiographyWebsiteSection | null> {
    if (!websiteId || websiteId.startsWith('local-')) {
      return null;
    }

    try {
      const response = await fetch(apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/sections/hero`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to create hero section'));
      }

      return data
        ? normalizeBiographyWebsiteSection(getSectionFromResponse(data), 0, {
            key: 'hero',
            title: 'Hero',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          })
        : {
            id: 'hero',
            key: 'hero',
            title: 'Hero',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          };
    } catch {
      return null;
    }
  },

  async updateHeroSection(
    websiteId: string,
    sectionId: string,
    payload: UpdateHeroSectionPayload
  ): Promise<BiographyWebsiteSection | null> {
    if (!websiteId || !sectionId || websiteId.startsWith('local-')) {
      return null;
    }

    try {
      const response = await fetch(
        apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/sections/${encodeURIComponent(sectionId)}/hero`),
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to update hero section'));
      }

      return data
        ? normalizeBiographyWebsiteSection(getSectionFromResponse(data), 0, {
            id: sectionId,
            key: 'hero',
            title: 'Hero',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          })
        : {
            id: sectionId,
            key: 'hero',
            title: 'Hero',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          };
    } catch {
      return null;
    }
  },

  async createChronicleSection(
    websiteId: string,
    payload: CreateChronicleSectionPayload
  ): Promise<BiographyWebsiteSection | null> {
    if (!websiteId || websiteId.startsWith('local-')) {
      return null;
    }

    try {
      const response = await fetch(apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/sections/chronicle`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to create chronicle section'));
      }

      return data
        ? normalizeBiographyWebsiteSection(getSectionFromResponse(data), 1, {
            key: 'chronicle',
            title: payload.sectionTitle || 'Chronicle',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          })
        : {
            id: 'chronicle',
            key: 'chronicle',
            title: payload.sectionTitle || 'Chronicle',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          };
    } catch {
      return null;
    }
  },

  async updateChronicleSection(
    websiteId: string,
    sectionId: string,
    payload: UpdateChronicleSectionPayload
  ): Promise<BiographyWebsiteSection | null> {
    if (!websiteId || !sectionId || websiteId.startsWith('local-')) {
      return null;
    }

    try {
      const response = await fetch(
        apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/sections/${encodeURIComponent(sectionId)}/chronicle`),
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to update chronicle section'));
      }

      return data
        ? normalizeBiographyWebsiteSection(getSectionFromResponse(data), 1, {
            id: sectionId,
            key: 'chronicle',
            title: payload.sectionTitle || 'Chronicle',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          })
        : {
            id: sectionId,
            key: 'chronicle',
            title: payload.sectionTitle || 'Chronicle',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          };
    } catch {
      return null;
    }
  },

  async createPursuitsSection(
    websiteId: string,
    payload: CreatePursuitsSectionPayload
  ): Promise<BiographyWebsiteSection | null> {
    if (!websiteId || websiteId.startsWith('local-')) {
      return null;
    }

    try {
      const response = await fetch(apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/sections/pursuits`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to create pursuits section'));
      }

      return data
        ? normalizeBiographyWebsiteSection(getSectionFromResponse(data), 2, {
            key: 'pursuits',
            title: payload.sectionLabel || 'Pursuits',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          })
        : {
            id: 'pursuits',
            key: 'pursuits',
            title: payload.sectionLabel || 'Pursuits',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          };
    } catch {
      return null;
    }
  },

  async updatePursuitsSection(
    websiteId: string,
    sectionId: string,
    payload: UpdatePursuitsSectionPayload
  ): Promise<BiographyWebsiteSection | null> {
    if (!websiteId || !sectionId || websiteId.startsWith('local-')) {
      return null;
    }

    try {
      const response = await fetch(
        apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/sections/${encodeURIComponent(sectionId)}/pursuits`),
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to update pursuits section'));
      }

      return data
        ? normalizeBiographyWebsiteSection(getSectionFromResponse(data), 2, {
            id: sectionId,
            key: 'pursuits',
            title: payload.sectionLabel || 'Pursuits',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          })
        : {
            id: sectionId,
            key: 'pursuits',
            title: payload.sectionLabel || 'Pursuits',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          };
    } catch {
      return null;
    }
  },

  async createTimelineSection(
    websiteId: string,
    payload: CreateTimelineSectionPayload
  ): Promise<BiographyWebsiteSection | null> {
    if (!websiteId || websiteId.startsWith('local-')) {
      return null;
    }

    try {
      const response = await fetch(apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/sections/timeline`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to create timeline section'));
      }

      return data
        ? normalizeBiographyWebsiteSection(getSectionFromResponse(data), 3, {
            key: 'timeline',
            title: payload.sectionTitle || 'Timeline',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          })
        : {
            id: 'timeline',
            key: 'timeline',
            title: payload.sectionTitle || 'Timeline',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          };
    } catch {
      return null;
    }
  },

  async updateTimelineSection(
    websiteId: string,
    sectionId: string,
    payload: UpdateTimelineSectionPayload
  ): Promise<BiographyWebsiteSection | null> {
    if (!websiteId || !sectionId || websiteId.startsWith('local-')) {
      return null;
    }

    try {
      const response = await fetch(
        apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/sections/${encodeURIComponent(sectionId)}/timeline`),
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to update timeline section'));
      }

      return data
        ? normalizeBiographyWebsiteSection(getSectionFromResponse(data), 3, {
            id: sectionId,
            key: 'timeline',
            title: payload.sectionTitle || 'Timeline',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          })
        : {
            id: sectionId,
            key: 'timeline',
            title: payload.sectionTitle || 'Timeline',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          };
    } catch {
      return null;
    }
  },

  async createGallerySection(
    websiteId: string,
    payload: CreateGallerySectionPayload
  ): Promise<BiographyWebsiteSection | null> {
    if (!websiteId || websiteId.startsWith('local-')) {
      return null;
    }

    try {
      const response = await fetch(apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/sections/gallery`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to create gallery section'));
      }

      return data
        ? normalizeBiographyWebsiteSection(getSectionFromResponse(data), 4, {
            key: 'gallery',
            title: payload.sectionTitle || 'Gallery',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          })
        : {
            id: 'gallery',
            key: 'gallery',
            title: payload.sectionTitle || 'Gallery',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          };
    } catch {
      return null;
    }
  },

  async updateGallerySection(
    websiteId: string,
    sectionId: string,
    payload: UpdateGallerySectionPayload
  ): Promise<BiographyWebsiteSection | null> {
    if (!websiteId || !sectionId || websiteId.startsWith('local-')) {
      return null;
    }

    try {
      const response = await fetch(
        apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/sections/${encodeURIComponent(sectionId)}/gallery`),
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to update gallery section'));
      }

      return data
        ? normalizeBiographyWebsiteSection(getSectionFromResponse(data), 4, {
            id: sectionId,
            key: 'gallery',
            title: payload.sectionTitle || 'Gallery',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          })
        : {
            id: sectionId,
            key: 'gallery',
            title: payload.sectionTitle || 'Gallery',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          };
    } catch {
      return null;
    }
  },

  async createContactSection(
    websiteId: string,
    payload: CreateContactSectionPayload
  ): Promise<BiographyWebsiteSection | null> {
    if (!websiteId || websiteId.startsWith('local-')) {
      return null;
    }

    try {
      const response = await fetch(apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/sections/contact`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to create contact section'));
      }

      return data
        ? normalizeBiographyWebsiteSection(getSectionFromResponse(data), 6, {
            key: 'contact',
            title: payload.sectionTitle || 'Contact',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          })
        : {
            id: 'contact',
            key: 'contact',
            title: payload.sectionTitle || 'Contact',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          };
    } catch {
      return null;
    }
  },

  async updateContactSection(
    websiteId: string,
    sectionId: string,
    payload: UpdateContactSectionPayload
  ): Promise<BiographyWebsiteSection | null> {
    if (!websiteId || !sectionId || websiteId.startsWith('local-')) {
      return null;
    }

    try {
      const response = await fetch(
        apiUrl(`/api/websites/${encodeURIComponent(websiteId)}/sections/${encodeURIComponent(sectionId)}/contact`),
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(getMessage(data, 'Unable to update contact section'));
      }

      return data
        ? normalizeBiographyWebsiteSection(getSectionFromResponse(data), 6, {
            id: sectionId,
            key: 'contact',
            title: payload.sectionTitle || 'Contact',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          })
        : {
            id: sectionId,
            key: 'contact',
            title: payload.sectionTitle || 'Contact',
            isVisible: payload.isVisible,
            sortOrder: payload.sortOrder,
            order: payload.sortOrder,
            content: payload,
          };
    } catch {
      return null;
    }
  },

  async createPublicContactMessage(
    websiteId: string,
    payload: CreatePublicContactMessagePayload
  ): Promise<boolean> {
    if (!websiteId || websiteId.startsWith('local-')) {
      return false;
    }

    try {
      const response = await fetch(
        apiUrl(`/api/public/websites/${encodeURIComponent(websiteId)}/contact-messages`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = { message: text };
        }

        throw new Error(getMessage(data, 'Unable to send contact message'));
      }

      return true;
    } catch {
      return false;
    }
  }
};
