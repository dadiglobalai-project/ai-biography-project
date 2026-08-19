import React, { useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
  ExternalLink,
  FileText,
  Globe2,
  Home,
  Image as ImageIcon,
  Lock,
  Mail,
  MessageSquare,
  Monitor,
  MoreHorizontal,
  Palette,
  PencilLine,
  RotateCcw,
  Redo2,
  Save,
  Settings,
  Sparkles,
  Smartphone,
  Tablet,
  Trash2,
  Type,
  Undo2,
  UploadCloud,
  UserRound,
  WandSparkles,
  X,
} from 'lucide-react';
import BiographyTemplateRenderer from '../Templates/BiographyTemplateRenderer';
import {
  cloneTemplateData,
  loadDraft,
  removeDraft,
  removeTemplateDraft,
  saveDraft,
} from '../Templates/LifeJourney/draftStorage';
import { getBiographyTemplateRoute } from '../Templates/LifeJourney/templateRoutes';
import { getSectionCopy } from '../Templates/LifeJourney/sectionCopy';
import {
  collectMediaAssetIdsFromBackendSections,
  hydrateDraftFromBackendSections,
} from '../Templates/LifeJourney/backendSectionHydration';
import { authService } from '../services/authService';
import {
  getTemplatePreviewProgressKey,
  getWebsitePreviewProgressKey,
  markDiyPreviewedProgressKey,
} from '../utils/diyProgress';
import type {
  BiographyContactMessage,
  BiographyMediaAsset,
  BiographyTemplate,
  BiographyWebsite,
  BiographyWebsiteSection,
  CreateChronicleSectionPayload,
  CreateContactSectionPayload,
  CreateGallerySectionPayload,
  CreatePursuitsSectionPayload,
  CreateTimelineSectionPayload,
  MediaUsageType,
  SubjectType,
  UpdateChronicleSectionPayload,
  UpdateContactSectionPayload,
  UpdateGallerySectionPayload,
  UpdatePursuitsSectionPayload,
  UpdateTimelineSectionPayload,
} from '../services/authService';
import type {
  BiographyCategory,
  EditableImageTarget,
  EditableSectionCopyKey,
  CustomizerSettings,
  EditableTemplateSection,
  GalleryItem,
  HobbyItem,
  ImageDisplaySettings,
  MemoryStory,
  PersonalDetails,
  TextDisplaySettings,
  TimelineMilestone,
  ValueItem,
} from '../Templates/LifeJourney/types';

const BIOGRAPHY_LIST_REFRESH_KEY = 'xinghuoji.biographies.changed';
const SUBJECT_TYPES: SubjectType[] = ['SELF', 'PARENT', 'GRANDPARENT', 'CHILD', 'SPOUSE', 'LOVED_ONE'];
const SUBJECT_TYPE_LABELS: Record<SubjectType, string> = {
  SELF: 'Myself',
  PARENT: 'Parent',
  GRANDPARENT: 'Grandparent',
  CHILD: 'Child',
  SPOUSE: 'Spouse',
  LOVED_ONE: 'Loved One',
};
const AUTO_SAVE_DELAY_MS = 1500;
const IMAGE_UPLOAD_MAX_BYTES = 8 * 1024 * 1024;
const IMAGE_UPLOAD_MAX_DIMENSION = 1600;
const EMPTY_OMITTED_MEDIA_ASSET_IDS = new Set<string>();
const IMAGE_UPLOAD_ACCEPT = 'image/png,image/jpeg,image/webp';
const MOBILE_PREVIEW_SRC_DOC =
  '<!doctype html><html><head></head><body><div id="mobile-preview-root"></div></body></html>';

const normalizeTemplateLookupValue = (value?: string | null) =>
  typeof value === 'string'
    ? value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    : '';

const loadBackendSectionMediaAccessUrls = async (
  websiteId: string,
  sections: BiographyWebsiteSection[]
) => {
  const mediaAssetIds = collectMediaAssetIdsFromBackendSections(sections);
  const entries = await Promise.all(
    mediaAssetIds.map(async (mediaAssetId) => {
      const accessUrl = await authService.getBiographyWebsiteMediaAccessUrl(websiteId, mediaAssetId);
      return accessUrl ? ([mediaAssetId, accessUrl] as const) : null;
    })
  );

  return Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => Boolean(entry)));
};

type PreviewViewport = 'desktop' | 'tablet' | 'phone';
type FramedPreviewViewport = Exclude<PreviewViewport, 'desktop'>;
type EditorMode = 'edit' | 'preview';
type ContentEditorSection = Exclude<EditableTemplateSection, 'style'>;

const DEVICE_PREVIEW_CONFIG: Record<FramedPreviewViewport, { label: string; width: number; height: number }> = {
  tablet: { label: 'Tablet', width: 768, height: 900 },
  phone: { label: 'Phone', width: 390, height: 780 },
};

const PREVIEW_VIEWPORT_OPTIONS: Array<{
  value: PreviewViewport;
  label: string;
  icon: React.ElementType;
}> = [
  { value: 'desktop', label: 'Desktop', icon: Monitor },
  { value: 'tablet', label: 'Tablet', icon: Tablet },
  { value: 'phone', label: 'Phone', icon: Smartphone },
];

function DevicePreviewFrame({
  children,
  iframeRef,
  viewport,
}: {
  children: React.ReactNode;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  viewport: FramedPreviewViewport;
}) {
  const [mountNode, setMountNode] = React.useState<HTMLElement | null>(null);
  const config = DEVICE_PREVIEW_CONFIG[viewport];

  const syncFrameDocument = React.useCallback(() => {
    const frameDocument = iframeRef.current?.contentDocument;
    if (!frameDocument) {
      return;
    }

    let baseElement = frameDocument.head.querySelector('base');
    if (!baseElement) {
      baseElement = frameDocument.createElement('base');
      frameDocument.head.prepend(baseElement);
    }
    baseElement.href = `${window.location.origin}/`;
    baseElement.target = '_self';

    frameDocument.documentElement.className = document.documentElement.className;
    frameDocument.body.className = 'm-0 min-h-screen bg-white';
    frameDocument.body.style.margin = '0';

    frameDocument.head
      .querySelectorAll('[data-mobile-preview-style="true"]')
      .forEach((node) => node.remove());

    document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      const clone = node.cloneNode(true) as HTMLElement;
      clone.dataset.mobilePreviewStyle = 'true';
      frameDocument.head.appendChild(clone);
    });

    setMountNode(frameDocument.getElementById('mobile-preview-root'));
  }, [iframeRef]);

  React.useEffect(() => {
    syncFrameDocument();
  }, [syncFrameDocument]);

  return (
    <div
      className="mx-auto rounded-[2rem] border border-slate-300 bg-white shadow-2xl"
      style={{ width: config.width, maxWidth: '100%' }}
    >
      <iframe
        ref={iframeRef}
        title={`${config.label} template preview`}
        srcDoc={MOBILE_PREVIEW_SRC_DOC}
        onLoad={syncFrameDocument}
        className="block w-full rounded-[2rem] bg-white"
        style={{ height: config.height, maxHeight: 'calc(100vh - 170px)' }}
      />
      {mountNode ? createPortal(children, mountNode) : null}
    </div>
  );
}

type TextFieldConfig = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  section?: EditableTemplateSection;
};

type SelectFieldConfig = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  section?: EditableTemplateSection;
};

type PublishChecklistItem = {
  id: string;
  label: string;
  description: string;
  isComplete: boolean;
  required: boolean;
};

type AiWritingAction = 'generate' | 'rewrite' | 'improve' | 'expand';

type AiWritingTarget = {
  id: string;
  label: string;
  section: EditableTemplateSection;
  value: string;
  onReplace: (value: string) => void;
};

type PersonalTextFieldKey = Extract<
  {
    [K in keyof PersonalDetails]-?: PersonalDetails[K] extends string | undefined ? K : never;
  }[keyof PersonalDetails],
  string
>;

const IMAGE_SIZE_OPTIONS = [
  { value: 'compact', label: 'Compact' },
  { value: 'default', label: 'Default' },
  { value: 'tall', label: 'Tall' },
];

const IMAGE_FIT_OPTIONS = [
  { value: 'cover', label: 'Fill frame' },
  { value: 'contain', label: 'Show full image' },
];

const IMAGE_POSITION_OPTIONS = [
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
];

const TEXT_SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'default', label: 'Default' },
  { value: 'large', label: 'Large' },
];

const THEME_STYLE_PRESETS: Array<{
  value: CustomizerSettings['theme'];
  label: string;
  description: string;
  swatches: string[];
}> = [
  {
    value: 'cream',
    label: 'Classic Gold',
    description: 'Warm paper, dark text, gold accents.',
    swatches: ['#FAF6F0', '#1C1917', '#FED362'],
  },
  {
    value: 'sage',
    label: 'Sage Archive',
    description: 'Soft green, slate text, calm accents.',
    swatches: ['#F4F7F5', '#1E293B', '#047857'],
  },
  {
    value: 'charcoal',
    label: 'Charcoal Legacy',
    description: 'Dark canvas, light text, vivid accents.',
    swatches: ['#121214', '#F4F4F5', '#818CF8'],
  },
];

const FONT_STYLE_PRESETS: Array<{
  value: CustomizerSettings['fontPairing'];
  label: string;
  description: string;
  sampleClass: string;
}> = [
  {
    value: 'classic',
    label: 'Classic Serif',
    description: 'Traditional biography tone.',
    sampleClass: 'font-serif',
  },
  {
    value: 'modern',
    label: 'Modern Sans',
    description: 'Clean and direct reading.',
    sampleClass: 'font-sans',
  },
  {
    value: 'editorial',
    label: 'Editorial',
    description: 'Expressive magazine feel.',
    sampleClass: 'font-serif italic',
  },
];

const SPACING_STYLE_PRESETS: Array<{
  value: CustomizerSettings['spacing'];
  label: string;
  description: string;
}> = [
  {
    value: 'spacious',
    label: 'Spacious',
    description: 'More breathing room between sections.',
  },
  {
    value: 'compact',
    label: 'Compact',
    description: 'Tighter layout for faster scanning.',
  },
];

const AI_WRITING_ACTIONS: Array<{
  value: AiWritingAction;
  label: string;
  description: string;
}> = [
  {
    value: 'generate',
    label: 'Generate',
    description: 'Create a fresh draft for this field.',
  },
  {
    value: 'rewrite',
    label: 'Rewrite',
    description: 'Rephrase while keeping the same meaning.',
  },
  {
    value: 'improve',
    label: 'Improve',
    description: 'Clean up grammar, clarity, and flow.',
  },
  {
    value: 'expand',
    label: 'Expand',
    description: 'Add more meaningful detail.',
  },
];

const editorSections: Array<{
  key: EditableTemplateSection;
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    key: 'hero',
    label: 'Hero',
    description: 'Name, tagline, image, intro',
    icon: UserRound,
  },
  {
    key: 'about',
    label: 'Chronicle & Values',
    description: 'Biography summary and values',
    icon: BookOpen,
  },
  {
    key: 'pursuits',
    label: 'Specialized Pursuits',
    description: 'Hobbies and interest cards',
    icon: WandSparkles,
  },
  {
    key: 'timeline',
    label: 'Life Journey',
    description: 'Timeline and life chapters',
    icon: Clock3,
  },
  {
    key: 'gallery',
    label: 'Gallery',
    description: 'Images, media cards',
    icon: ImageIcon,
  },
  {
    key: 'stories',
    label: 'Stories',
    description: 'Memory story cards',
    icon: MessageSquare,
  },
  {
    key: 'contact',
    label: 'Contact',
    description: 'Email and social links',
    icon: Mail,
  },
  {
    key: 'style',
    label: 'Style',
    description: 'Theme, fonts, spacing',
    icon: Palette,
  },
];

const sidebarSectionItems: Array<{
  navKey: string;
  section: EditableTemplateSection;
  label: string;
  icon: React.ElementType;
}> = [
  { navKey: 'hero', section: 'hero', label: 'Hero', icon: Home },
  { navKey: 'chronicle', section: 'about', label: 'Chronicle & Values', icon: Sparkles },
  { navKey: 'pursuits', section: 'pursuits', label: 'Specialized Pursuits', icon: WandSparkles },
  { navKey: 'timeline', section: 'timeline', label: 'Life Journey', icon: Clock3 },
  { navKey: 'gallery', section: 'gallery', label: 'Media Gallery', icon: ImageIcon },
  { navKey: 'stories', section: 'stories', label: 'Memories & Stories', icon: FileText },
  { navKey: 'contact', section: 'contact', label: 'Contact', icon: Mail },
];

const BACKEND_SECTION_ALIASES: Record<ContentEditorSection, string[]> = {
  hero: ['hero', 'hero section'],
  about: ['about', 'about section', 'chronicle', 'chronicle section', 'chronicle overview', 'archival essence'],
  pursuits: ['pursuits', 'pursuit', 'specialized pursuits', 'hobbies', 'interests'],
  timeline: ['timeline', 'timeline section', 'life journey', 'life journey section'],
  gallery: ['gallery', 'gallery section'],
  stories: ['stories', 'story', 'memory', 'memories', 'memories stories', 'memories stories section'],
  contact: ['contact', 'contact section'],
};

const normalizeBackendSectionText = (value?: string) =>
  (value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const getBackendSectionForEditorSection = (
  section: EditableTemplateSection | null,
  sections: BiographyWebsiteSection[]
) => {
  if (!section || section === 'style') {
    return null;
  }

  const aliases = BACKEND_SECTION_ALIASES[section].map(normalizeBackendSectionText);

  return sections.find((backendSection) => {
    const values = [
      backendSection.id,
      backendSection.key,
      backendSection.title,
      backendSection.description,
    ]
      .map(normalizeBackendSectionText)
      .filter(Boolean);

    return values.some((value) =>
      aliases.some((alias) => value === alias || value.includes(alias) || alias.includes(value))
    );
  }) || null;
};

const getBackendSectionByAliases = (
  aliases: string[],
  sections: BiographyWebsiteSection[]
) => {
  const normalizedAliases = aliases.map(normalizeBackendSectionText);

  return sections.find((backendSection) => {
    const values = [
      backendSection.id,
      backendSection.key,
      backendSection.title,
      backendSection.description,
    ]
      .map(normalizeBackendSectionText)
      .filter(Boolean);

    return values.some((value) =>
      normalizedAliases.some((alias) => value === alias || value.includes(alias) || alias.includes(value))
    );
  }) || null;
};

const personalFieldsBySection: Record<
  Extract<EditableTemplateSection, 'hero' | 'about' | 'timeline' | 'contact'>,
  Array<{
    field: PersonalTextFieldKey;
    label: string;
    multiline?: boolean;
    rows?: number;
  }>
> = {
  hero: [
    { field: 'fullName', label: 'Full name' },
    { field: 'occupation', label: 'Occupation' },
    { field: 'tagline', label: 'Short tagline', multiline: true },
    { field: 'shortIntro', label: 'Short introduction', multiline: true, rows: 4 },
  ],
  about: [
    { field: 'bioFull', label: 'Biography summary', multiline: true, rows: 7 },
    { field: 'signatureQuote', label: 'Signature quote', multiline: true, rows: 4 },
  ],
  timeline: [],
  contact: [
    { field: 'contactEmail', label: 'Email' },
    { field: 'instagramHandle', label: 'Instagram' },
    { field: 'twitterHandle', label: 'Twitter / X' },
    { field: 'facebookLabel', label: 'Facebook' },
    { field: 'linkedinLabel', label: 'LinkedIn' },
  ],
};

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100';

const loadImageElement = (source: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to read image file'));
    image.src = source;
  });

const validateImageFile = (file: File) => {
  const allowedTypes = IMAGE_UPLOAD_ACCEPT.split(',');

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please upload a PNG, JPG, or WebP image');
  }

  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    throw new Error('Image must be 8 MB or smaller');
  }
};

const convertImageFileToDataUrl = async (file: File) => {
  validateImageFile(file);

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageElement(objectUrl);
    const scale = Math.min(
      1,
      IMAGE_UPLOAD_MAX_DIMENSION / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height)
    );
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
    canvas.height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Unable to prepare image file');
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.88);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const getBiographyTitle = (draft: BiographyCategory, templateTitle: string) => {
  const siteTitle = draft.settings.siteTitle?.trim();
  if (siteTitle) {
    return siteTitle;
  }

  const name = draft.personalDetails.fullName.trim();
  return name ? `${name}'s ${templateTitle}` : `${templateTitle} Biography`;
};

const getSubjectType = (subjectType?: string): SubjectType => {
  return SUBJECT_TYPES.includes(subjectType as SubjectType) ? (subjectType as SubjectType) : 'SELF';
};

const formatContactMessageDate = (date?: string) => {
  if (!date) {
    return 'No date';
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleString();
};

const formatMediaFileSize = (fileSize?: number) => {
  if (!fileSize || !Number.isFinite(fileSize)) {
    return 'Unknown size';
  }

  if (fileSize < 1024 * 1024) {
    return `${Math.max(1, Math.round(fileSize / 1024))} KB`;
  }

  return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
};

const stripRichText = (value?: string) =>
  (value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const hasText = (value?: string) => stripRichText(value).length > 0;

const hasValidEmail = (value?: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());

const getMediaLibraryStorageKey = (websiteId: string) =>
  `xinghuoji.website.${websiteId}.mediaLibrary`;

const readLocalMediaLibraryAssets = (websiteId: string): BiographyMediaAsset[] => {
  if (!websiteId) {
    return [];
  }

  try {
    const storedAssets = window.localStorage.getItem(getMediaLibraryStorageKey(websiteId));
    return storedAssets ? JSON.parse(storedAssets) : [];
  } catch {
    window.localStorage.removeItem(getMediaLibraryStorageKey(websiteId));
    return [];
  }
};

const writeLocalMediaLibraryAssets = (websiteId: string, assets: BiographyMediaAsset[]) => {
  if (!websiteId) {
    return;
  }

  window.localStorage.setItem(getMediaLibraryStorageKey(websiteId), JSON.stringify(assets));
};

const notifyBiographyListChanged = () => {
  window.localStorage.setItem(BIOGRAPHY_LIST_REFRESH_KEY, String(Date.now()));
};

const getImageTargetLabel = (target: EditableImageTarget | null) => {
  if (!target) {
    return 'Gallery';
  }

  switch (target.section) {
    case 'hero':
      return 'Hero profile image';
    case 'pursuits':
      return target.itemIndex != null
        ? `Pursuit image ${target.itemIndex + 1}`
        : 'Pursuit image';
    case 'timeline':
      return target.itemIndex != null
        ? `Life Journey image ${target.itemIndex + 1}`
        : 'Life Journey image';
    case 'gallery':
      return target.itemIndex != null
        ? `Gallery image ${target.itemIndex + 1}`
        : 'Gallery image';
    case 'stories':
      return target.itemIndex != null
        ? `Story image ${target.itemIndex + 1}`
        : 'Story image';
    default:
      return 'Image';
  }
};

export default function LifeJourneyEditPage() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const templateRoute = getBiographyTemplateRoute(templateId);
  const websiteId = searchParams.get('websiteId') || '';
  const backendTemplateId = searchParams.get('apiTemplateId') || '';
  const [draft, setDraft] = useState<BiographyCategory>(() =>
    loadDraft(templateRoute.id, templateRoute.categoryKey, websiteId)
  );
  const [website, setWebsite] = useState<BiographyWebsite | null>(null);
  const [saveMessage, setSaveMessage] = useState('Unsaved changes');
  const [isSaving, setIsSaving] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('edit');
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>('desktop');
  const [activeEditorSection, setActiveEditorSection] = useState<EditableTemplateSection | null>(null);
  const [activeSidebarItem, setActiveSidebarItem] = useState<string | null>(null);
  const [activeImageTarget, setActiveImageTarget] = useState<EditableImageTarget | null>(null);
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);
  const [isMobileAiWritingOpen, setIsMobileAiWritingOpen] = useState(false);
  const [isMobileMediaLibraryOpen, setIsMobileMediaLibraryOpen] = useState(false);
  const [isMobileToolbarMenuOpen, setIsMobileToolbarMenuOpen] = useState(false);
  const [isPublishChecklistOpen, setIsPublishChecklistOpen] = useState(false);
  const [aiWritingAction, setAiWritingAction] = useState<AiWritingAction>('generate');
  const [aiWritingTargetId, setAiWritingTargetId] = useState('');
  const [aiWritingInstructions, setAiWritingInstructions] = useState('');
  const [aiWritingResult, setAiWritingResult] = useState('');
  const [aiWritingMessage, setAiWritingMessage] = useState('');
  const [isGeneratingAiWriting, setIsGeneratingAiWriting] = useState(false);
  const [websiteSections, setWebsiteSections] = useState<BiographyWebsiteSection[]>([]);
  const [sectionLoadMessage, setSectionLoadMessage] = useState('');
  const [activeBackendSection, setActiveBackendSection] = useState<BiographyWebsiteSection | null>(null);
  const [sectionDetailMessage, setSectionDetailMessage] = useState('');
  const [isUpdatingSectionSettings, setIsUpdatingSectionSettings] = useState(false);
  const [pendingDeleteSectionId, setPendingDeleteSectionId] = useState<string | null>(null);
  const [isDeletingSection, setIsDeletingSection] = useState(false);
  const [isCreatingHeroSection, setIsCreatingHeroSection] = useState(false);
  const [isUpdatingHeroSection, setIsUpdatingHeroSection] = useState(false);
  const [isCreatingChronicleSection, setIsCreatingChronicleSection] = useState(false);
  const [isUpdatingChronicleSection, setIsUpdatingChronicleSection] = useState(false);
  const [isCreatingPursuitsSection, setIsCreatingPursuitsSection] = useState(false);
  const [isUpdatingPursuitsSection, setIsUpdatingPursuitsSection] = useState(false);
  const [isCreatingTimelineSection, setIsCreatingTimelineSection] = useState(false);
  const [isUpdatingTimelineSection, setIsUpdatingTimelineSection] = useState(false);
  const [isCreatingGallerySection, setIsCreatingGallerySection] = useState(false);
  const [isUpdatingGallerySection, setIsUpdatingGallerySection] = useState(false);
  const [isCreatingContactSection, setIsCreatingContactSection] = useState(false);
  const [isUpdatingContactSection, setIsUpdatingContactSection] = useState(false);
  const [contactMessages, setContactMessages] = useState<BiographyContactMessage[]>([]);
  const [contactMessagesMessage, setContactMessagesMessage] = useState('');
  const [isLoadingContactMessages, setIsLoadingContactMessages] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<BiographyMediaAsset[]>([]);
  const [mediaAssetsMessage, setMediaAssetsMessage] = useState('');
  const [recentlyUploadedMediaAssetIds, setRecentlyUploadedMediaAssetIds] = useState<string[]>([]);
  const [isLoadingMediaAssets, setIsLoadingMediaAssets] = useState(false);
  const [pendingDeleteMediaAssetId, setPendingDeleteMediaAssetId] = useState<string | null>(null);
  const [deletingMediaAssetId, setDeletingMediaAssetId] = useState<string | null>(null);
  const [updatingContactMessageId, setUpdatingContactMessageId] = useState<string | null>(null);
  const [pendingDeleteContactMessageId, setPendingDeleteContactMessageId] = useState<string | null>(null);
  const [deletingContactMessageId, setDeletingContactMessageId] = useState<string | null>(null);
  const mediaLibraryInputRef = React.useRef<HTMLInputElement | null>(null);
  const devicePreviewFrameRef = React.useRef<HTMLIFrameElement | null>(null);
  const hasMountedDraftRef = React.useRef(false);
  const activeWebsiteId = website?.id || websiteId;
  const isEditingMode = editorMode === 'edit';
  const previewModeLabel =
    previewViewport === 'desktop'
      ? 'Desktop width'
      : `${DEVICE_PREVIEW_CONFIG[previewViewport].label} width (${DEVICE_PREVIEW_CONFIG[previewViewport].width}px)`;
  const normalizedSaveMessage = saveMessage.toLowerCase();
  const mobileSaveStatus = isSaving
    ? 'Saving'
    : normalizedSaveMessage.includes('failed') || normalizedSaveMessage.includes('error')
      ? 'Save issue'
      : normalizedSaveMessage.includes('unsaved')
        ? 'Unsaved'
        : 'Saved';
  const selectedMobileEditorSection = activeEditorSection
    ? editorSections.find((section) => section.key === activeEditorSection)
    : null;
  const SelectedMobileEditorIcon = selectedMobileEditorSection?.icon || Sparkles;
  const matchingBackendSection = React.useMemo(
    () => getBackendSectionForEditorSection(activeEditorSection, websiteSections),
    [activeEditorSection, websiteSections]
  );
  const pursuitsBackendSection = React.useMemo(
    () => getBackendSectionByAliases(['pursuits', 'pursuit', 'specialized pursuits'], websiteSections),
    [websiteSections]
  );
  const activeBackendSectionMatchesEditor = Boolean(
    activeBackendSection &&
      activeEditorSection &&
      activeEditorSection !== 'style' &&
      getBackendSectionForEditorSection(activeEditorSection, [activeBackendSection])?.id === activeBackendSection.id
  );
  const currentBackendSection = activeBackendSectionMatchesEditor
    ? activeBackendSection
    : matchingBackendSection;
  const publishChecklistItems = React.useMemo<PublishChecklistItem[]>(() => {
    const sectionCopy = getSectionCopy(draft.sectionCopy);
    const showContactSection = draft.settings.showContactSection !== false;
    const allowContactMessages = draft.settings.allowContactMessages !== false;
    const hasTimelineContent = draft.timeline.some((milestone) =>
      hasText(milestone.year) && hasText(milestone.title) && hasText(milestone.description)
    );
    const hasGalleryContent = draft.gallery.some((item) =>
      hasText(item.title) && (hasText(item.imageUrl) || Boolean(item.mediaAssetId))
    );
    const hasStoryContent = draft.stories.some((story) =>
      hasText(story.title) && hasText(story.shortDescription)
    );
    const hasPersonalProfileImage =
      Boolean(draft.personalDetails.profileImageAssetId) || hasText(draft.personalDetails.profileImageUrl);

    return [
      {
        id: 'saved-website',
        label: 'Saved in My Biographies',
        description: activeWebsiteId
          ? 'This draft has a biography website record.'
          : 'Save the draft first so it appears in My Biographies.',
        isComplete: Boolean(activeWebsiteId),
        required: true,
      },
      {
        id: 'site-title',
        label: 'Biography title',
        description: 'Used in the dashboard and browser title.',
        isComplete: hasText(getBiographyTitle(draft, templateRoute.title)),
        required: true,
      },
      {
        id: 'full-name',
        label: 'Full name',
        description: 'The Hero section needs the biography subject name.',
        isComplete: hasText(draft.personalDetails.fullName),
        required: true,
      },
      {
        id: 'tagline',
        label: 'Short tagline',
        description: 'A short line helps the Hero section explain the person quickly.',
        isComplete: hasText(draft.personalDetails.tagline),
        required: true,
      },
      {
        id: 'introduction',
        label: 'Short introduction',
        description: 'The Hero section should include an opening introduction.',
        isComplete: hasText(draft.personalDetails.shortIntro),
        required: true,
      },
      {
        id: 'biography-summary',
        label: 'Biography summary',
        description: 'The About section should include the main biography story.',
        isComplete: hasText(draft.personalDetails.bioFull),
        required: true,
      },
      {
        id: 'timeline',
        label: 'Life Journey timeline',
        description: 'At least one timeline milestone needs a year, title, and description.',
        isComplete: hasTimelineContent,
        required: true,
      },
      {
        id: 'section-copy',
        label: 'Section descriptions',
        description: 'Main section descriptions should not be empty.',
        isComplete:
          hasText(sectionCopy.about.description) &&
          hasText(sectionCopy.timeline.description) &&
          hasText(sectionCopy.gallery.description) &&
          hasText(sectionCopy.stories.description),
        required: true,
      },
      {
        id: 'contact-email',
        label: 'Contact email',
        description: showContactSection && allowContactMessages
          ? 'Required when the public contact form is enabled.'
          : 'Skipped because contact messages are disabled.',
        isComplete:
          !showContactSection ||
          !allowContactMessages ||
          hasValidEmail(draft.personalDetails.contactEmail),
        required: true,
      },
      {
        id: 'profile-image',
        label: 'Personal profile image',
        description: 'Recommended so the published biography does not rely on sample imagery.',
        isComplete: hasPersonalProfileImage,
        required: false,
      },
      {
        id: 'gallery',
        label: 'Gallery media',
        description: 'Recommended so visitors can see supporting images or memories.',
        isComplete: hasGalleryContent,
        required: false,
      },
      {
        id: 'stories',
        label: 'Memory stories',
        description: 'Recommended for a richer biography experience.',
        isComplete: hasStoryContent,
        required: false,
      },
    ];
  }, [activeWebsiteId, draft, templateRoute.title]);
  const requiredPublishItems = publishChecklistItems.filter((item) => item.required);
  const recommendedPublishItems = publishChecklistItems.filter((item) => !item.required);
  const incompleteRequiredPublishItems = requiredPublishItems.filter((item) => !item.isComplete);
  const isPublishReady = incompleteRequiredPublishItems.length === 0;

  const loadMediaAssets = React.useCallback(async () => {
    if (!activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      const storageId = activeWebsiteId || templateRoute.id;
      const localAssets = readLocalMediaLibraryAssets(storageId);
      setMediaAssets(localAssets);
      setMediaAssetsMessage(
        localAssets.length > 0
          ? `Loaded ${localAssets.length} local media item${localAssets.length === 1 ? '' : 's'}`
          : 'No media in this library yet'
      );
      return;
    }

    setIsLoadingMediaAssets(true);
    setMediaAssetsMessage('Loading media assets...');

    const assets = await authService.getBiographyWebsiteMedia(activeWebsiteId);
    const assetsWithAccessUrls = await Promise.all(
      assets.map(async (asset) => {
        if (asset.accessUrl) {
          return asset;
        }

        const accessUrl = await authService.getBiographyWebsiteMediaAccessUrl(
          activeWebsiteId,
          asset.mediaAssetId
        );

        return accessUrl ? { ...asset, accessUrl } : asset;
      })
    );

    setIsLoadingMediaAssets(false);
    setMediaAssets(assetsWithAccessUrls);
    setPendingDeleteMediaAssetId(null);
    setRecentlyUploadedMediaAssetIds([]);
    setMediaAssetsMessage(
      assetsWithAccessUrls.length > 0
        ? `Loaded ${assetsWithAccessUrls.length} media asset${assetsWithAccessUrls.length === 1 ? '' : 's'}`
        : 'No media assets yet'
    );
  }, [activeWebsiteId, templateRoute.id]);

  const handleDeleteMediaAsset = async (mediaAssetId: string) => {
    if (!activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      if (pendingDeleteMediaAssetId !== mediaAssetId) {
        setPendingDeleteMediaAssetId(mediaAssetId);
        setMediaAssetsMessage('Click Delete again to remove this local media item');
        return;
      }

      const storageId = activeWebsiteId || templateRoute.id;
      const nextAssets = mediaAssets.filter((asset) => asset.mediaAssetId !== mediaAssetId);
      writeLocalMediaLibraryAssets(storageId, nextAssets);
      setMediaAssets(nextAssets);
      setRecentlyUploadedMediaAssetIds((currentIds) =>
        currentIds.filter((assetId) => assetId !== mediaAssetId)
      );
      setPendingDeleteMediaAssetId(null);
      setMediaAssetsMessage('Deleted local media item');
      return;
    }

    if (pendingDeleteMediaAssetId !== mediaAssetId) {
      setPendingDeleteMediaAssetId(mediaAssetId);
      setMediaAssetsMessage('Click Delete again to confirm. Used media must be removed from sections first');
      return;
    }

    setDeletingMediaAssetId(mediaAssetId);
    setMediaAssetsMessage('Deleting media asset...');

    const wasDeleted = await authService.deleteBiographyWebsiteMedia(activeWebsiteId, mediaAssetId);

    setDeletingMediaAssetId(null);
    setPendingDeleteMediaAssetId(null);

    if (!wasDeleted) {
      setMediaAssetsMessage('Unable to delete media. Remove it from biography sections first');
      return;
    }

    setMediaAssets((currentAssets) =>
      currentAssets.filter((asset) => asset.mediaAssetId !== mediaAssetId)
    );
    setRecentlyUploadedMediaAssetIds((currentIds) =>
      currentIds.filter((assetId) => assetId !== mediaAssetId)
    );
    setMediaAssetsMessage('Deleted media asset');
  };

  const handleUploadMediaLibraryFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = '';

    if (files.length === 0) {
      return;
    }

    const replacementTargetLabel = getImageTargetLabel(activeImageTarget);
    const isReplacementUpload = Boolean(activeImageTarget);
    setIsLoadingMediaAssets(true);
    setMediaAssetsMessage(`Uploading ${files.length} image${files.length === 1 ? '' : 's'}...`);

    try {
      if (activeWebsiteId && !activeWebsiteId.startsWith('local-')) {
        const uploadedAssets: BiographyMediaAsset[] = [];

        for (const file of files) {
          validateImageFile(file);
          const uploadedMedia = await authService.uploadBiographyWebsiteMedia(
            activeWebsiteId,
            file,
            'GALLERY'
          );

          if (uploadedMedia) {
            uploadedAssets.push(uploadedMedia);
          }
        }

        setMediaAssets((currentAssets) => [
          ...uploadedAssets,
          ...currentAssets.filter(
            (asset) => !uploadedAssets.some((uploadedAsset) => uploadedAsset.mediaAssetId === asset.mediaAssetId)
          ),
        ]);
        setRecentlyUploadedMediaAssetIds(uploadedAssets.map((asset) => asset.mediaAssetId));
        setMediaAssetsMessage(
          uploadedAssets.length > 0
            ? isReplacementUpload
              ? `Uploaded ${uploadedAssets.length} image${uploadedAssets.length === 1 ? '' : 's'}. Click Replace on a new image to update ${replacementTargetLabel}`
              : `Uploaded ${uploadedAssets.length} image${uploadedAssets.length === 1 ? '' : 's'} to media library`
            : 'No images were uploaded'
        );
        return;
      }

      const storageId = activeWebsiteId || templateRoute.id;
      const localAssets: BiographyMediaAsset[] = [];

      for (const file of files) {
        validateImageFile(file);
        const accessUrl = await convertImageFileToDataUrl(file);
        localAssets.push({
          mediaAssetId: `local-media-${crypto.randomUUID()}`,
          websiteId: storageId,
          usageType: 'GALLERY',
          originalFilename: file.name,
          mimeType: file.type,
          fileSize: file.size,
          accessUrl,
          createdAt: new Date().toISOString(),
        });
      }

      const nextAssets = [...localAssets, ...mediaAssets];
      writeLocalMediaLibraryAssets(storageId, nextAssets);
      setMediaAssets(nextAssets);
      setRecentlyUploadedMediaAssetIds(localAssets.map((asset) => asset.mediaAssetId));
      setMediaAssetsMessage(
        isReplacementUpload
          ? `Added ${localAssets.length} local image${localAssets.length === 1 ? '' : 's'}. Click Replace on a new image to update ${replacementTargetLabel}`
          : `Added ${localAssets.length} local image${localAssets.length === 1 ? '' : 's'} to media library`
      );
    } catch (err: any) {
      setMediaAssetsMessage(err?.message || 'Unable to upload image to media library');
    } finally {
      setIsLoadingMediaAssets(false);
    }
  };

  const handleUseMediaAsset = (asset: BiographyMediaAsset) => {
    const imageUrl = asset.accessUrl || '';

    if (!imageUrl) {
      setMediaAssetsMessage('This media item needs an access URL before it can be used');
      return;
    }

    const backendAssetId =
      activeWebsiteId && !activeWebsiteId.startsWith('local-') && !asset.mediaAssetId.startsWith('local-')
        ? asset.mediaAssetId
        : '';
    const fallbackSection: EditableImageTarget['section'] =
      activeEditorSection === 'hero' ||
      activeEditorSection === 'pursuits' ||
      activeEditorSection === 'timeline' ||
      activeEditorSection === 'gallery' ||
      activeEditorSection === 'stories'
        ? activeEditorSection
        : 'gallery';
    const imageTarget = activeImageTarget;
    const targetSection = imageTarget?.section || fallbackSection;
    const targetIndex = imageTarget?.itemIndex ?? 0;
    const targetLabel = getImageTargetLabel(imageTarget);
    const isTargetItem = (item: { id: string }, index: number) =>
      imageTarget?.itemId ? item.id === imageTarget.itemId : index === targetIndex;

    setDraft((currentDraft) => {
      if (targetSection === 'hero') {
        return {
          ...currentDraft,
          personalDetails: {
            ...currentDraft.personalDetails,
            profileImageUrl: imageUrl,
            profileImageAssetId: backendAssetId,
          },
        };
      }

      if (targetSection === 'pursuits' && currentDraft.hobbies.length > 0) {
        return {
          ...currentDraft,
          hobbies: currentDraft.hobbies.map((hobby, index) =>
            isTargetItem(hobby, index)
              ? {
                  ...hobby,
                  imageUrl,
                  imageAssetId: backendAssetId,
                }
              : hobby
          ),
        };
      }

      if (targetSection === 'timeline' && currentDraft.timeline.length > 0) {
        return {
          ...currentDraft,
          timeline: currentDraft.timeline.map((milestone, index) =>
            isTargetItem(milestone, index)
              ? {
                  ...milestone,
                  imageUrl,
                  imageAssetId: backendAssetId,
                }
              : milestone
          ),
        };
      }

      if (targetSection === 'stories' && currentDraft.stories.length > 0) {
        return {
          ...currentDraft,
          stories: currentDraft.stories.map((story, index) =>
            isTargetItem(story, index)
              ? {
                  ...story,
                  imageUrl,
                  imageAssetId: backendAssetId,
                }
              : story
          ),
        };
      }

      if (targetSection === 'gallery' && imageTarget && currentDraft.gallery.length > 0) {
        return {
          ...currentDraft,
          gallery: currentDraft.gallery.map((item, index) =>
            isTargetItem(item, index)
              ? {
                  ...item,
                  imageUrl,
                  mediaAssetId: backendAssetId,
                  thumbnailAssetId: backendAssetId,
                }
              : item
          ),
        };
      }

      const title = asset.originalFilename?.replace(/\.[^.]+$/, '') || 'Media Library Image';
      const nextGalleryItem: GalleryItem = {
        id: `gallery-${Date.now()}`,
        title,
        category: 'creative',
        imageUrl,
        mediaAssetId: backendAssetId,
        thumbnailAssetId: backendAssetId,
        caption: 'Added from Media Library.',
        year: String(new Date().getFullYear()),
      };

      return {
        ...currentDraft,
        gallery: [nextGalleryItem, ...currentDraft.gallery],
      };
    });

    setActiveEditorSection(targetSection);
    focusPreviewSection(targetSection);
    setActiveImageTarget(null);
    setIsMobileMediaLibraryOpen(false);
    setSaveMessage(
      imageTarget
        ? `${targetLabel} updated from Media Library`
        : targetSection === 'gallery'
          ? 'Image added to Gallery from Media Library'
          : `Image applied to ${targetSection} section`
    );
  };

  const loadContactMessages = React.useCallback(async () => {
    if (!activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setContactMessages([]);
      setContactMessagesMessage('Messages will load after this biography is saved');
      return;
    }

    setIsLoadingContactMessages(true);
    setContactMessagesMessage('Loading contact messages...');

    const messages = await authService.getBiographyWebsiteContactMessages(activeWebsiteId);

    setIsLoadingContactMessages(false);
    setContactMessages(messages);
    setContactMessagesMessage(
      messages.length > 0
        ? `Loaded ${messages.length} contact message${messages.length === 1 ? '' : 's'}`
        : 'No contact messages yet'
    );
  }, [activeWebsiteId]);

  const handleMarkContactMessageRead = async (messageId: string) => {
    if (!activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setContactMessagesMessage('Message status can be updated after this biography is saved');
      return;
    }

    setUpdatingContactMessageId(messageId);
    setContactMessagesMessage('Updating message status...');

    const wasUpdated = await authService.updateBiographyContactMessageStatus(activeWebsiteId, messageId, {
      status: 'READ',
    });

    setUpdatingContactMessageId(null);

    if (!wasUpdated) {
      setContactMessagesMessage('Unable to update message status');
      return;
    }

    setContactMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId ? { ...message, status: 'READ' } : message
      )
    );
    setContactMessagesMessage('Marked message as read');
  };

  const handleDeleteContactMessage = async (messageId: string) => {
    if (!activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setContactMessagesMessage('Messages can be deleted after this biography is saved');
      return;
    }

    if (pendingDeleteContactMessageId !== messageId) {
      setPendingDeleteContactMessageId(messageId);
      setContactMessagesMessage('Click Delete again to confirm');
      return;
    }

    setDeletingContactMessageId(messageId);
    setContactMessagesMessage('Deleting contact message...');

    const wasDeleted = await authService.deleteBiographyContactMessage(activeWebsiteId, messageId);

    setDeletingContactMessageId(null);
    setPendingDeleteContactMessageId(null);

    if (!wasDeleted) {
      setContactMessagesMessage('Unable to delete contact message');
      return;
    }

    setContactMessages((currentMessages) =>
      currentMessages.filter((message) => message.id !== messageId)
    );
    setContactMessagesMessage('Deleted contact message');
  };

  const shouldUseMobileEditor = () => window.matchMedia('(max-width: 1023px)').matches;

  const focusPreviewSection = (section: EditableTemplateSection) => {
    setActiveEditorSection(section);
    window.requestAnimationFrame(() => {
      const previewDocument =
        previewViewport === 'desktop'
          ? document
          : devicePreviewFrameRef.current?.contentDocument;
      const previewSection = previewDocument?.getElementById(`${section}-section`);
      previewSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const handleEditSectionChange = (section: EditableTemplateSection) => {
    if (!isEditingMode) {
      return;
    }

    setActiveEditorSection(section);
    setActiveSidebarItem(null);
    setPendingDeleteSectionId(null);
    if (shouldUseMobileEditor()) {
      setIsMobileEditorOpen(false);
      setIsMobileAiWritingOpen(false);
      setIsMobileMediaLibraryOpen(false);
    }
  };

  const handleOpenStyleEditor = () => {
    if (!isEditingMode) {
      return;
    }

    setActiveEditorSection('style');
    setActiveSidebarItem('style');
    setPendingDeleteSectionId(null);
    if (shouldUseMobileEditor()) {
      setIsMobileAiWritingOpen(false);
      setIsMobileMediaLibraryOpen(false);
      setIsMobileEditorOpen(true);
    }
  };

  const handleOpenGeneralSettings = () => {
    if (!isEditingMode) {
      return;
    }

    setActiveEditorSection(null);
    setActiveSidebarItem('general-settings');
    setPendingDeleteSectionId(null);
  };

  const handleSidebarSectionSelect = (navKey: string, section: EditableTemplateSection) => {
    if (!isEditingMode) {
      return;
    }

    focusPreviewSection(section);
    setActiveSidebarItem(navKey);
    setPendingDeleteSectionId(null);
    if (shouldUseMobileEditor()) {
      setIsMobileAiWritingOpen(false);
      setIsMobileMediaLibraryOpen(false);
      setIsMobileEditorOpen(true);
    }
  };

  const handleOpenMediaLibrary = () => {
    setActiveImageTarget(null);
    setActiveSidebarItem('media-library');
    setPendingDeleteMediaAssetId(null);
    setIsMobileEditorOpen(false);
    setIsMobileAiWritingOpen(false);
    if (shouldUseMobileEditor()) {
      setIsMobileMediaLibraryOpen(true);
    }
    void loadMediaAssets();
  };

  const handleImageChangeRequest = (target: EditableImageTarget) => {
    if (!isEditingMode) {
      return;
    }

    setActiveImageTarget(target);
    setActiveEditorSection(target.section);
    setActiveSidebarItem(shouldUseMobileEditor() ? null : 'media-library');
    setPendingDeleteMediaAssetId(null);
    setMediaAssetsMessage(`Choose or upload an image for ${getImageTargetLabel(target)}`);
    setIsMobileEditorOpen(false);
    setIsMobileAiWritingOpen(false);

    if (shouldUseMobileEditor()) {
      setIsMobileMediaLibraryOpen(true);
    }

    void loadMediaAssets();
  };

  const handleOpenAiWriting = () => {
    if (!isEditingMode) {
      return;
    }

    const targetSection =
      !activeEditorSection || activeEditorSection === 'style'
        ? 'hero'
        : activeEditorSection;
    const target = getAiWritingTargets().find((item) => item.section === targetSection);

    setActiveEditorSection(targetSection);
    if (target) {
      setAiWritingTargetId(target.id);
    }

    setAiWritingMessage('');
    setAiWritingResult('');

    if (shouldUseMobileEditor()) {
      setActiveSidebarItem(null);
      setIsMobileEditorOpen(false);
      setIsMobileMediaLibraryOpen(false);
      setIsMobileAiWritingOpen(true);
      return;
    }

    setActiveSidebarItem('ai-writing');
  };

  const handleDraftChange: React.Dispatch<React.SetStateAction<BiographyCategory>> = (nextDraft) => {
    if (!isEditingMode) {
      return;
    }

    setDraft((current) =>
      typeof nextDraft === 'function'
        ? (nextDraft as (current: BiographyCategory) => BiographyCategory)(current)
        : nextDraft
    );
    setSaveMessage('Unsaved changes');
  };

  React.useEffect(() => {
    document.title = `Edit ${templateRoute.title} | Xinghuoji`;
  }, [templateRoute.title]);

  React.useEffect(() => {
    authService.ensureAuthSessionFromOpenTabs().catch(() => undefined);
  }, []);

  React.useEffect(() => {
    if (!hasMountedDraftRef.current) {
      hasMountedDraftRef.current = true;
      return;
    }

    const autosaveTimer = window.setTimeout(() => {
      saveDraft(templateRoute.id, draft, activeWebsiteId);
      setSaveMessage((currentMessage) => {
        if (currentMessage !== 'Unsaved changes') {
          return currentMessage;
        }

        return activeWebsiteId
          ? 'Autosaved locally'
          : 'Autosaved locally. Click Save to add to My Biographies';
      });
    }, AUTO_SAVE_DELAY_MS);

    return () => window.clearTimeout(autosaveTimer);
  }, [activeWebsiteId, draft, templateRoute.id]);

  const handleEnterPreviewMode = () => {
    saveDraft(templateRoute.id, draft, activeWebsiteId);
    markDiyPreviewedProgressKey(
      activeWebsiteId
        ? getWebsitePreviewProgressKey(activeWebsiteId)
        : getTemplatePreviewProgressKey(templateRoute.id)
    );
    setEditorMode('preview');
    setActiveEditorSection(null);
    setActiveSidebarItem(null);
    setIsMobileEditorOpen(false);
    setIsMobileAiWritingOpen(false);
    setIsMobileMediaLibraryOpen(false);
    setPendingDeleteSectionId(null);
  };

  const handleEnterEditMode = () => {
    setEditorMode('edit');
  };

  React.useEffect(() => {
    if (!websiteId) {
      setWebsiteSections([]);
      setSectionLoadMessage('Sections will load after this biography is saved');
      return;
    }

    let active = true;

    const loadWebsite = async () => {
      try {
        const loadedWebsite = await authService.getBiographyWebsite(websiteId);
        if (!active) {
          return;
        }

        setWebsite(loadedWebsite);
        setSaveMessage('Loaded from My Biographies');
      } catch (err: any) {
        if (active) {
          setSaveMessage(err?.message || 'Unable to load biography record');
        }
      }
    };

    loadWebsite();

    return () => {
      active = false;
    };
  }, [websiteId]);

  React.useEffect(() => {
    if (!activeWebsiteId) {
      setWebsiteSections([]);
      setSectionLoadMessage('Sections will load after this biography is saved');
      return;
    }

    if (activeWebsiteId.startsWith('local-')) {
      setWebsiteSections([]);
      setSectionLoadMessage('Local draft sections are using the template defaults');
      return;
    }

    let active = true;
    setSectionLoadMessage('Loading backend sections...');

    const loadWebsiteSections = async () => {
      const sections = await authService.getBiographyWebsiteSections(activeWebsiteId);
      if (!active) {
        return;
      }

      const detailedSections = await Promise.all(
        sections.map(async (section) => {
          const sectionDetail = await authService.getBiographyWebsiteSection(activeWebsiteId, section.id);
          return sectionDetail || section;
        })
      );

      if (!active) {
        return;
      }

      const mediaAccessUrls = await loadBackendSectionMediaAccessUrls(activeWebsiteId, detailedSections);

      if (!active) {
        return;
      }

      setWebsiteSections(detailedSections);
      if (detailedSections.length > 0) {
        setDraft((currentDraft) => {
          const hydratedDraft = hydrateDraftFromBackendSections(currentDraft, detailedSections, mediaAccessUrls);
          saveDraft(templateRoute.id, hydratedDraft, activeWebsiteId);
          return hydratedDraft;
        });
      }
      setSectionLoadMessage(
        detailedSections.length > 0
          ? `Loaded ${detailedSections.length} backend section${detailedSections.length === 1 ? '' : 's'} and hydrated editor content`
          : 'No backend sections returned yet'
      );
    };

    loadWebsiteSections();

    return () => {
      active = false;
    };
  }, [activeWebsiteId, templateRoute.id]);

  React.useEffect(() => {
    loadMediaAssets();
  }, [loadMediaAssets]);

  React.useEffect(() => {
    if (!activeEditorSection || activeEditorSection === 'style') {
      setActiveBackendSection(null);
      setSectionDetailMessage('');
      return;
    }

    if (!activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setActiveBackendSection(null);
      setSectionDetailMessage('Backend section details will load after this biography is saved');
      return;
    }

    if (!matchingBackendSection) {
      setActiveBackendSection(null);
      setSectionDetailMessage(
        websiteSections.length > 0
          ? 'No matching backend section detail found for this editor section yet'
          : ''
      );
      return;
    }

    let active = true;
    setSectionDetailMessage(`Loading ${matchingBackendSection.title} section detail...`);

    const loadSectionDetail = async () => {
      const section = await authService.getBiographyWebsiteSection(
        activeWebsiteId,
        matchingBackendSection.id
      );
      if (!active) {
        return;
      }

      setActiveBackendSection(section || matchingBackendSection);
      setSectionDetailMessage(
        section
          ? `Loaded ${section.title} detail from backend`
          : `Using ${matchingBackendSection.title} summary from section list`
      );
    };

    loadSectionDetail();

    return () => {
      active = false;
    };
  }, [activeEditorSection, activeWebsiteId, matchingBackendSection, websiteSections.length]);

  React.useEffect(() => {
    if (activeEditorSection !== 'contact') {
      setContactMessagesMessage('');
      return;
    }

    loadContactMessages();
  }, [activeEditorSection, loadContactMessages]);

  const handleUpdateSectionSettings = async (updates: Partial<Pick<BiographyWebsiteSection, 'isVisible' | 'sortOrder'>>) => {
    const section = currentBackendSection;

    if (!section || !activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setSectionDetailMessage('Backend section settings are available after this biography is saved');
      return;
    }

    const nextSettings = {
      isVisible: updates.isVisible ?? section.isVisible ?? true,
      sortOrder: updates.sortOrder ?? section.sortOrder ?? section.order ?? 1,
    };

    setIsUpdatingSectionSettings(true);
    setSectionDetailMessage(`Updating ${section.title} settings...`);

    const updatedSection = await authService.updateBiographyWebsiteSectionSettings(
      activeWebsiteId,
      section.id,
      nextSettings
    );

    setIsUpdatingSectionSettings(false);

    if (!updatedSection) {
      setSectionDetailMessage(`Unable to update ${section.title} settings`);
      return;
    }

    const mergedSection: BiographyWebsiteSection = {
      ...section,
      ...updatedSection,
      id: section.id,
      key: updatedSection.key && updatedSection.key !== section.id ? updatedSection.key : section.key,
      title:
        updatedSection.title && updatedSection.title !== section.id
          ? updatedSection.title
          : section.title,
      isVisible: nextSettings.isVisible,
      sortOrder: nextSettings.sortOrder,
      order: nextSettings.sortOrder,
    };

    setActiveBackendSection(mergedSection);
    setWebsiteSections((currentSections) =>
      currentSections
        .map((item) => (item.id === mergedSection.id ? { ...item, ...mergedSection } : item))
        .sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
    );
    setSectionDetailMessage(`Updated ${mergedSection.title} settings`);
  };

  const handleDeleteBackendSection = async () => {
    const section = currentBackendSection;

    if (!section || !activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setSectionDetailMessage('Backend section delete is available after this biography is saved');
      return;
    }

    if (pendingDeleteSectionId !== section.id) {
      setPendingDeleteSectionId(section.id);
      return;
    }

    setIsDeletingSection(true);
    setSectionDetailMessage(`Deleting ${section.title} section...`);

    const wasDeleted = await authService.deleteBiographyWebsiteSection(activeWebsiteId, section.id);

    setIsDeletingSection(false);
    setPendingDeleteSectionId(null);

    if (!wasDeleted) {
      setSectionDetailMessage(`Unable to delete ${section.title} section`);
      return;
    }

    setWebsiteSections((currentSections) => currentSections.filter((item) => item.id !== section.id));
    setActiveBackendSection(null);
    setActiveEditorSection(null);
    setSectionLoadMessage(`Deleted ${section.title} from backend sections`);
  };

  const getBackendSectionValue = (section: BiographyWebsiteSection | null | undefined, key: string) => {
    const sectionRecord = section as unknown as Record<string, unknown>;
    const contentRecord =
      section?.content && typeof section.content === 'object'
        ? (section.content as Record<string, unknown>)
        : null;
    const value = contentRecord?.[key] ?? sectionRecord?.[key];

    return typeof value === 'string' ? value : '';
  };

  const getBackendBeliefItems = (section?: BiographyWebsiteSection | null) => {
    const sectionRecord = section as unknown as Record<string, unknown>;
    const contentRecord =
      section?.content && typeof section.content === 'object'
        ? (section.content as Record<string, unknown>)
        : null;
    const beliefs =
      (contentRecord?.beliefs && typeof contentRecord.beliefs === 'object'
        ? (contentRecord.beliefs as Record<string, unknown>)
        : null) ||
      (sectionRecord?.beliefs && typeof sectionRecord.beliefs === 'object'
        ? (sectionRecord.beliefs as Record<string, unknown>)
        : null);

    return Array.isArray(beliefs?.items)
      ? (beliefs.items as Array<Record<string, unknown>>)
      : [];
  };

  const getBackendBeliefItemId = (
    section: BiographyWebsiteSection | null | undefined,
    index: number,
    title: string
  ) => {
    const existingItems = getBackendBeliefItems(section);
    const existingByIndex = existingItems[index];
    const normalizedTitle = normalizeBackendSectionText(title);
    const existingByTitle = existingItems.find((item) => {
      const itemTitle = typeof item.title === 'string' ? item.title : '';
      return normalizeBackendSectionText(itemTitle) === normalizedTitle;
    });
    const id = existingByIndex?.id ?? existingByIndex?.beliefId ?? existingByTitle?.id ?? existingByTitle?.beliefId;

    return typeof id === 'string' ? id : '';
  };

  const getBackendPursuitItems = (section?: BiographyWebsiteSection | null) => {
    const sectionRecord = section as unknown as Record<string, unknown>;
    const contentRecord =
      section?.content && typeof section.content === 'object'
        ? (section.content as Record<string, unknown>)
        : null;
    const pursuits =
      (contentRecord?.pursuits && typeof contentRecord.pursuits === 'object'
        ? (contentRecord.pursuits as Record<string, unknown>)
        : null) ||
      (sectionRecord?.pursuits && typeof sectionRecord.pursuits === 'object'
        ? (sectionRecord.pursuits as Record<string, unknown>)
        : null);

    if (Array.isArray(contentRecord?.items)) {
      return contentRecord.items as Array<Record<string, unknown>>;
    }

    if (Array.isArray(sectionRecord?.items)) {
      return sectionRecord.items as Array<Record<string, unknown>>;
    }

    return Array.isArray(pursuits?.items)
      ? (pursuits.items as Array<Record<string, unknown>>)
      : [];
  };

  const getBackendPursuitItemValue = (
    section: BiographyWebsiteSection | null | undefined,
    index: number,
    title: string,
    key: 'id' | 'imageId'
  ) => {
    const existingItems = getBackendPursuitItems(section);
    const existingByIndex = existingItems[index];
    const normalizedTitle = normalizeBackendSectionText(title);
    const existingByTitle = existingItems.find((item) => {
      const itemTitle = typeof item.title === 'string' ? item.title : '';
      return normalizeBackendSectionText(itemTitle) === normalizedTitle;
    });
    const fallbackKey = key === 'id' ? 'pursuitId' : 'image_id';
    const value =
      existingByIndex?.[key] ??
      existingByIndex?.[fallbackKey] ??
      existingByTitle?.[key] ??
      existingByTitle?.[fallbackKey];

    return typeof value === 'string' ? value : '';
  };

  const getBackendTimelineEvents = (section?: BiographyWebsiteSection | null) => {
    const sectionRecord = section as unknown as Record<string, unknown>;
    const contentRecord =
      section?.content && typeof section.content === 'object'
        ? (section.content as Record<string, unknown>)
        : null;
    const timeline =
      (contentRecord?.timeline && typeof contentRecord.timeline === 'object'
        ? (contentRecord.timeline as Record<string, unknown>)
        : null) ||
      (sectionRecord?.timeline && typeof sectionRecord.timeline === 'object'
        ? (sectionRecord.timeline as Record<string, unknown>)
        : null);

    if (Array.isArray(contentRecord?.timelineEvents)) {
      return contentRecord.timelineEvents as Array<Record<string, unknown>>;
    }

    if (Array.isArray(sectionRecord?.timelineEvents)) {
      return sectionRecord.timelineEvents as Array<Record<string, unknown>>;
    }

    if (Array.isArray(contentRecord?.events)) {
      return contentRecord.events as Array<Record<string, unknown>>;
    }

    if (Array.isArray(sectionRecord?.events)) {
      return sectionRecord.events as Array<Record<string, unknown>>;
    }

    if (Array.isArray(timeline?.timelineEvents)) {
      return timeline.timelineEvents as Array<Record<string, unknown>>;
    }

    return Array.isArray(timeline?.events)
      ? (timeline.events as Array<Record<string, unknown>>)
      : [];
  };

  const getMatchingBackendTimelineEvent = (
    section: BiographyWebsiteSection | null | undefined,
    index: number,
    title: string,
    timePeriod: string
  ) => {
    const existingEvents = getBackendTimelineEvents(section);
    const existingByIndex = existingEvents[index];
    const normalizedTitle = normalizeBackendSectionText(title);
    const normalizedTimePeriod = normalizeBackendSectionText(timePeriod);

    return (
      existingByIndex ||
      existingEvents.find((event) => {
        const eventTitle = typeof event.title === 'string' ? event.title : '';
        const eventTimePeriod =
          typeof event.timePeriod === 'string'
            ? event.timePeriod
            : typeof event.year === 'string'
              ? event.year
              : '';

        return (
          normalizeBackendSectionText(eventTitle) === normalizedTitle ||
          normalizeBackendSectionText(eventTimePeriod) === normalizedTimePeriod
        );
      }) ||
      null
    );
  };

  const getBackendTimelineEventValue = (
    section: BiographyWebsiteSection | null | undefined,
    index: number,
    title: string,
    timePeriod: string,
    key: 'id' | 'imageId'
  ) => {
    const existingEvent = getMatchingBackendTimelineEvent(section, index, title, timePeriod);
    const fallbackKeys = key === 'id' ? ['timelineEventId', 'eventId'] : ['image_id'];
    const value =
      existingEvent?.[key] ??
      fallbackKeys.map((fallbackKey) => existingEvent?.[fallbackKey]).find((candidate) => candidate);

    return typeof value === 'string' ? value : '';
  };

  const getBackendTimelineHighlights = (event?: Record<string, unknown> | null) => {
    if (!event) {
      return [];
    }

    if (Array.isArray(event.highlights)) {
      return event.highlights as Array<Record<string, unknown>>;
    }

    return Array.isArray(event.timelineHighlights)
      ? (event.timelineHighlights as Array<Record<string, unknown>>)
      : [];
  };

  const getBackendTimelineHighlightId = (
    section: BiographyWebsiteSection | null | undefined,
    eventIndex: number,
    eventTitle: string,
    timePeriod: string,
    highlightIndex: number,
    highlightText: string
  ) => {
    const existingEvent = getMatchingBackendTimelineEvent(section, eventIndex, eventTitle, timePeriod);
    const existingHighlights = getBackendTimelineHighlights(existingEvent);
    const existingByIndex = existingHighlights[highlightIndex];
    const normalizedHighlight = normalizeBackendSectionText(highlightText);
    const existingByText = existingHighlights.find((highlight) => {
      const text =
        typeof highlight.highlightText === 'string'
          ? highlight.highlightText
          : typeof highlight.text === 'string'
            ? highlight.text
            : '';
      return normalizeBackendSectionText(text) === normalizedHighlight;
    });
    const id =
      existingByIndex?.id ??
      existingByIndex?.timelineHighlightId ??
      existingByIndex?.highlightId ??
      existingByText?.id ??
      existingByText?.timelineHighlightId ??
      existingByText?.highlightId;

    return typeof id === 'string' ? id : '';
  };

  const getStringRecordValue = (value: unknown) => {
    if (typeof value === 'string') {
      return value;
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      return typeof record.id === 'string' ? record.id : '';
    }

    return '';
  };

  const getBackendGalleryItems = (section?: BiographyWebsiteSection | null) => {
    const sectionRecord = section as unknown as Record<string, unknown>;
    const contentRecord =
      section?.content && typeof section.content === 'object'
        ? (section.content as Record<string, unknown>)
        : null;
    const gallery =
      (contentRecord?.gallery && typeof contentRecord.gallery === 'object'
        ? (contentRecord.gallery as Record<string, unknown>)
        : null) ||
      (sectionRecord?.gallery && typeof sectionRecord.gallery === 'object'
        ? (sectionRecord.gallery as Record<string, unknown>)
        : null);

    if (Array.isArray(contentRecord?.items)) {
      return contentRecord.items as Array<Record<string, unknown>>;
    }

    if (Array.isArray(sectionRecord?.items)) {
      return sectionRecord.items as Array<Record<string, unknown>>;
    }

    if (Array.isArray(contentRecord?.galleryItems)) {
      return contentRecord.galleryItems as Array<Record<string, unknown>>;
    }

    if (Array.isArray(sectionRecord?.galleryItems)) {
      return sectionRecord.galleryItems as Array<Record<string, unknown>>;
    }

    if (Array.isArray(gallery?.items)) {
      return gallery.items as Array<Record<string, unknown>>;
    }

    return Array.isArray(gallery?.galleryItems)
      ? (gallery.galleryItems as Array<Record<string, unknown>>)
      : [];
  };

  const getMatchingBackendGalleryItem = (
    section: BiographyWebsiteSection | null | undefined,
    index: number,
    title: string,
    displayYear: string
  ) => {
    const existingItems = getBackendGalleryItems(section);
    const existingByIndex = existingItems[index];
    const normalizedTitle = normalizeBackendSectionText(title);
    const normalizedYear = normalizeBackendSectionText(displayYear);

    return (
      existingByIndex ||
      existingItems.find((item) => {
        const itemTitle = typeof item.title === 'string' ? item.title : '';
        const itemYear =
          typeof item.displayYear === 'string'
            ? item.displayYear
            : typeof item.year === 'string'
              ? item.year
              : '';

        return (
          normalizeBackendSectionText(itemTitle) === normalizedTitle ||
          normalizeBackendSectionText(itemYear) === normalizedYear
        );
      }) ||
      null
    );
  };

  const getBackendGalleryItemValue = (
    section: BiographyWebsiteSection | null | undefined,
    index: number,
    title: string,
    displayYear: string,
    key: 'id' | 'mediaAssetId' | 'thumbnailAssetId'
  ) => {
    const existingItem = getMatchingBackendGalleryItem(section, index, title, displayYear);
    const fallbackKeys =
      key === 'id'
        ? ['galleryItemId', 'itemId', 'mediaItemId']
        : key === 'mediaAssetId'
          ? ['media_asset_id', 'assetId', 'mediaId', 'mediaAsset']
          : ['thumbnail_asset_id', 'thumbnailId', 'thumbnailAsset'];
    const value =
      getStringRecordValue(existingItem?.[key]) ||
      fallbackKeys
        .map((fallbackKey) => getStringRecordValue(existingItem?.[fallbackKey]))
        .find(Boolean);

    return value || '';
  };

  const getBackendContactSocialLinks = (section?: BiographyWebsiteSection | null) => {
    const sectionRecord = section as unknown as Record<string, unknown>;
    const contentRecord =
      section?.content && typeof section.content === 'object'
        ? (section.content as Record<string, unknown>)
        : null;
    const contact =
      (contentRecord?.contact && typeof contentRecord.contact === 'object'
        ? (contentRecord.contact as Record<string, unknown>)
        : null) ||
      (sectionRecord?.contact && typeof sectionRecord.contact === 'object'
        ? (sectionRecord.contact as Record<string, unknown>)
        : null);

    if (Array.isArray(contentRecord?.socialLinks)) {
      return contentRecord.socialLinks as Array<Record<string, unknown>>;
    }

    if (Array.isArray(sectionRecord?.socialLinks)) {
      return sectionRecord.socialLinks as Array<Record<string, unknown>>;
    }

    if (Array.isArray(contentRecord?.links)) {
      return contentRecord.links as Array<Record<string, unknown>>;
    }

    if (Array.isArray(sectionRecord?.links)) {
      return sectionRecord.links as Array<Record<string, unknown>>;
    }

    if (Array.isArray(contact?.socialLinks)) {
      return contact.socialLinks as Array<Record<string, unknown>>;
    }

    return Array.isArray(contact?.links)
      ? (contact.links as Array<Record<string, unknown>>)
      : [];
  };

  const getBackendSocialLinkId = (
    section: BiographyWebsiteSection | null | undefined,
    index: number,
    platform: CreateContactSectionPayload['socialLinks'][number]['platform'],
    displayName: string
  ) => {
    const existingLinks = getBackendContactSocialLinks(section);
    const existingByIndex = existingLinks[index];
    const normalizedPlatform = normalizeBackendSectionText(platform);
    const normalizedDisplayName = normalizeBackendSectionText(displayName);
    const existingByIdentity = existingLinks.find((link) => {
      const linkPlatform = typeof link.platform === 'string' ? link.platform : '';
      const linkDisplayName =
        typeof link.displayName === 'string'
          ? link.displayName
          : typeof link.name === 'string'
            ? link.name
            : '';

      return (
        normalizeBackendSectionText(linkPlatform) === normalizedPlatform ||
        normalizeBackendSectionText(linkDisplayName) === normalizedDisplayName
      );
    });
    const id =
      existingByIndex?.id ??
      existingByIndex?.socialLinkId ??
      existingByIndex?.linkId ??
      existingByIdentity?.id ??
      existingByIdentity?.socialLinkId ??
      existingByIdentity?.linkId;

    return typeof id === 'string' ? id : '';
  };

  const getPayloadMediaAssetId = (
    mediaAssetId?: string,
    omittedMediaAssetIds: ReadonlySet<string> = EMPTY_OMITTED_MEDIA_ASSET_IDS
  ) => (mediaAssetId && omittedMediaAssetIds.has(mediaAssetId) ? '' : mediaAssetId);

  const buildHeroSectionPayload = (
    section?: BiographyWebsiteSection | null,
    omittedMediaAssetIds: ReadonlySet<string> = EMPTY_OMITTED_MEDIA_ASSET_IDS
  ) => ({
    fullName: draft.personalDetails.fullName || '',
    designation: draft.personalDetails.occupation || '',
    tagline: draft.personalDetails.tagline || '',
    shortDescription: draft.personalDetails.shortIntro || '',
    profileImageId:
      getPayloadMediaAssetId(
        draft.personalDetails.profileImageAssetId ?? getBackendSectionValue(section, 'profileImageId'),
        omittedMediaAssetIds
      ) ?? '',
    backgroundImageId:
      getPayloadMediaAssetId(
        draft.personalDetails.backgroundImageAssetId ?? getBackendSectionValue(section, 'backgroundImageId'),
        omittedMediaAssetIds
      ) ?? '',
    sortOrder: section?.sortOrder ?? section?.order ?? 1,
    isVisible: section?.isVisible ?? true,
  });

  const buildChronicleSectionPayload = (
    section?: BiographyWebsiteSection | null
  ): CreateChronicleSectionPayload => {
    const aboutCopy = getSectionCopy(draft.sectionCopy).about;

    return {
      sectionLabel: '02 / THE ARCHIVAL ESSENCE',
      sectionTitle: aboutCopy.title || '',
      sectionDescription: aboutCopy.description || '',
      journal: {
        cardLabel: 'BIOGRAPHY JOURNAL',
        storyTitle: 'The Journey of My Hands',
        storyContent: draft.personalDetails.bioFull || '',
        quote: draft.personalDetails.signatureQuote || '',
      },
      beliefs: {
        cardLabel: 'CORE BELIEFS & STANDARDS',
        items: draft.values.map((value, index) => ({
          icon: value.icon || '',
          title: value.title || '',
          description: value.description || '',
          sortOrder: index + 1,
        })),
      },
      sortOrder: section?.sortOrder ?? section?.order ?? 2,
      isVisible: section?.isVisible ?? true,
    };
  };

  const buildUpdateChronicleSectionPayload = (
    section: BiographyWebsiteSection
  ): UpdateChronicleSectionPayload => {
    const payload = buildChronicleSectionPayload(section);

    return {
      ...payload,
      beliefs: {
        ...payload.beliefs,
        items: payload.beliefs.items.map((item, index) => ({
          id: getBackendBeliefItemId(section, index, item.title),
          ...item,
        })),
      },
    };
  };

  const buildPursuitsSectionPayload = (
    omittedMediaAssetIds: ReadonlySet<string> = EMPTY_OMITTED_MEDIA_ASSET_IDS
  ): CreatePursuitsSectionPayload => ({
    sectionLabel: 'SPECIALIZED PURSUITS',
    items: draft.hobbies.map((hobby, index) => ({
      imageId: getPayloadMediaAssetId(hobby.imageAssetId, omittedMediaAssetIds) || '',
      icon: hobby.icon || '',
      title: hobby.title || '',
      description: hobby.description || '',
      sortOrder: index + 1,
    })),
    sortOrder: 3,
    isVisible: true,
  });

  const buildUpdatePursuitsSectionPayload = (
    section: BiographyWebsiteSection,
    omittedMediaAssetIds: ReadonlySet<string> = EMPTY_OMITTED_MEDIA_ASSET_IDS
  ): UpdatePursuitsSectionPayload => ({
    sectionLabel: 'SPECIALIZED PURSUITS',
    items: draft.hobbies.map((hobby, index) => ({
      id: getBackendPursuitItemValue(section, index, hobby.title || '', 'id'),
      imageId:
        getPayloadMediaAssetId(
          hobby.imageAssetId ?? getBackendPursuitItemValue(section, index, hobby.title || '', 'imageId'),
          omittedMediaAssetIds
        ) || '',
      icon: hobby.icon || '',
      title: hobby.title || '',
      description: hobby.description || '',
      sortOrder: index + 1,
    })),
    sortOrder: section.sortOrder ?? section.order ?? 3,
    isVisible: section.isVisible ?? true,
  });

  const buildTimelineSectionPayload = (
    omittedMediaAssetIds: ReadonlySet<string> = EMPTY_OMITTED_MEDIA_ASSET_IDS
  ): CreateTimelineSectionPayload => {
    const timelineCopy = getSectionCopy(draft.sectionCopy).timeline;

    return {
      sectionLabel: '03 / CHRONOLOGY OF ERAS',
      sectionTitle: timelineCopy.title || '',
      sectionDescription: timelineCopy.description || '',
      timelineEvents: draft.timeline.map((milestone, index) => ({
        timePeriod: milestone.year || '',
        title: milestone.title || '',
        location: milestone.location || '',
        quote: milestone.description || '',
        imageId: getPayloadMediaAssetId(milestone.imageAssetId, omittedMediaAssetIds) || '',
        imageAltText: milestone.title || '',
        imageCaption: milestone.imageCaption || '',
        sortOrder: index + 1,
        highlights: milestone.details.map((detail, detailIndex) => ({
          highlightText: detail || '',
          sortOrder: detailIndex + 1,
        })),
      })),
      sortOrder: 4,
      isVisible: true,
    };
  };

  const buildUpdateTimelineSectionPayload = (
    section: BiographyWebsiteSection,
    omittedMediaAssetIds: ReadonlySet<string> = EMPTY_OMITTED_MEDIA_ASSET_IDS
  ): UpdateTimelineSectionPayload => {
    const payload = buildTimelineSectionPayload(omittedMediaAssetIds);

    return {
      ...payload,
      timelineEvents: payload.timelineEvents.map((event, eventIndex) => ({
        id: getBackendTimelineEventValue(
          section,
          eventIndex,
          event.title,
          event.timePeriod,
          'id'
        ),
        ...event,
        imageId:
          getPayloadMediaAssetId(
            event.imageId ??
              getBackendTimelineEventValue(
                section,
                eventIndex,
                event.title,
                event.timePeriod,
                'imageId'
              ),
            omittedMediaAssetIds
          ) || '',
        highlights: event.highlights.map((highlight, highlightIndex) => ({
          id: getBackendTimelineHighlightId(
            section,
            eventIndex,
            event.title,
            event.timePeriod,
            highlightIndex,
            highlight.highlightText
          ),
          ...highlight,
        })),
      })),
      sortOrder: section.sortOrder ?? section.order ?? 4,
      isVisible: section.isVisible ?? true,
    };
  };

  const buildGallerySectionPayload = (
    omittedMediaAssetIds: ReadonlySet<string> = EMPTY_OMITTED_MEDIA_ASSET_IDS
  ): CreateGallerySectionPayload => {
    const galleryCopy = getSectionCopy(draft.sectionCopy).gallery;

    return {
      sectionLabel: '04 / MULTIMEDIA ARCHIVES',
      sectionTitle: galleryCopy.title || '',
      sectionDescription: galleryCopy.description || '',
      items: draft.gallery.map((item, index) => ({
        mediaAssetId: getPayloadMediaAssetId(item.mediaAssetId, omittedMediaAssetIds) || '',
        thumbnailAssetId:
          getPayloadMediaAssetId(item.thumbnailAssetId || item.mediaAssetId, omittedMediaAssetIds) || '',
        mediaType: 'IMAGE',
        category: item.category || '',
        recordLabel: `${(item.category || 'media').toUpperCase()} RECORD`,
        displayYear: item.year || '',
        title: item.title || '',
        description: item.caption || '',
        altText: item.title || '',
        sortOrder: index + 1,
      })),
      sortOrder: 5,
      isVisible: true,
    };
  };

  const buildUpdateGallerySectionPayload = (
    section: BiographyWebsiteSection,
    omittedMediaAssetIds: ReadonlySet<string> = EMPTY_OMITTED_MEDIA_ASSET_IDS
  ): UpdateGallerySectionPayload => {
    const payload = buildGallerySectionPayload(omittedMediaAssetIds);

    return {
      ...payload,
      items: payload.items.map((item, index) => ({
        id: getBackendGalleryItemValue(section, index, item.title, item.displayYear, 'id'),
        ...item,
        mediaAssetId:
          getPayloadMediaAssetId(
            item.mediaAssetId ??
              getBackendGalleryItemValue(
                section,
                index,
                item.title,
                item.displayYear,
                'mediaAssetId'
              ),
            omittedMediaAssetIds
          ) || '',
        thumbnailAssetId:
          getPayloadMediaAssetId(
            item.thumbnailAssetId ??
              item.mediaAssetId ??
              getBackendGalleryItemValue(
                section,
                index,
                item.title,
                item.displayYear,
                'thumbnailAssetId'
              ),
            omittedMediaAssetIds
          ) || '',
      })),
      sortOrder: section.sortOrder ?? section.order ?? 5,
      isVisible: section.isVisible ?? true,
    };
  };

  const buildSocialProfileUrl = (
    platform: CreateContactSectionPayload['socialLinks'][number]['platform'],
    displayName: string
  ) => {
    const value = displayName.trim();

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    if (!value.startsWith('@')) {
      return '';
    }

    const handle = value.replace(/^@+/, '').trim();
    if (!handle) {
      return '';
    }

    if (platform === 'INSTAGRAM') {
      return `https://www.instagram.com/${encodeURIComponent(handle)}`;
    }

    if (platform === 'X') {
      return `https://x.com/${encodeURIComponent(handle)}`;
    }

    return '';
  };

  const buildContactSectionPayload = (): CreateContactSectionPayload => {
    const contactCopy = getSectionCopy(draft.sectionCopy).contact;
    const contactEmail =
      draft.personalDetails.contactEmail || 'julian.vance@cannonbeachwood.org';
    const socialLinks: Array<{
      platform: CreateContactSectionPayload['socialLinks'][number]['platform'];
      displayName: string;
      icon: string;
    }> = [
      {
        platform: 'INSTAGRAM',
        displayName: draft.personalDetails.instagramHandle || '@JulianVanceWood',
        icon: 'instagram',
      },
      {
        platform: 'X',
        displayName: draft.personalDetails.twitterHandle || '@VanceShipwrights',
        icon: 'twitter',
      },
      {
        platform: 'FACEBOOK',
        displayName: draft.personalDetails.facebookLabel || 'Cabin Studio',
        icon: 'facebook',
      },
      {
        platform: 'LINKEDIN',
        displayName: draft.personalDetails.linkedinLabel || 'Julian Vance Forestry',
        icon: 'linkedin',
      },
    ];

    return {
      sectionLabel: '06 / REACH OUT',
      sectionTitle: contactCopy.title || '',
      sectionDescription: contactCopy.description || '',
      contactInfo: {
        label: 'CABIN MAILBOX',
        email: contactEmail,
      },
      socialLinks: draft.settings.showSocialLinks === false
        ? []
        : socialLinks
        .filter((link) => link.displayName.trim())
        .map((link, index) => ({
          ...link,
          profileUrl: buildSocialProfileUrl(link.platform, link.displayName),
          sortOrder: index + 1,
        })),
      formSettings: {
        title: 'Send a Message to the Cabin',
        namePlaceholder: 'e.g. Sarah Miller',
        emailPlaceholder: 'e.g. sarah@example.com',
        subjectPlaceholder: 'e.g. Heirloom Walnut Table Commission',
        messagePlaceholder: 'Type your message with clean hands...',
        submitButtonText: 'Send Message',
        successMessage:
          'Thank you for writing. Your message has been received at the shore cabin mailbox. Julian will respond as soon as his hands are clear of saw work.',
        errorMessage: 'Unable to send your message. Please try again.',
      },
      sortOrder: 7,
      isVisible: draft.settings.showContactSection !== false,
    };
  };

  const buildUpdateContactSectionPayload = (
    section: BiographyWebsiteSection
  ): UpdateContactSectionPayload => {
    const payload = buildContactSectionPayload();

    return {
      ...payload,
      socialLinks: payload.socialLinks.map((link, index) => ({
        id: getBackendSocialLinkId(section, index, link.platform, link.displayName),
        ...link,
      })),
      sortOrder: section.sortOrder ?? section.order ?? 7,
      isVisible: draft.settings.showContactSection !== false,
    };
  };

  const handleCreateHeroSection = async () => {
    if (!activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setSectionDetailMessage('Save this biography first before creating backend sections');
      return;
    }

    setIsCreatingHeroSection(true);
    setSectionDetailMessage('Creating Hero section in backend...');

    const heroSection = await authService.createHeroSection(activeWebsiteId, buildHeroSectionPayload());

    setIsCreatingHeroSection(false);

    if (!heroSection) {
      setSectionDetailMessage('Unable to create Hero section in backend');
      return;
    }

    const normalizedHeroSection: BiographyWebsiteSection = {
      ...heroSection,
      key: heroSection.key || 'hero',
      title: heroSection.title || 'Hero',
      sortOrder: heroSection.sortOrder ?? heroSection.order ?? 1,
      order: heroSection.order ?? heroSection.sortOrder ?? 1,
      isVisible: heroSection.isVisible ?? true,
    };

    setWebsiteSections((currentSections) =>
      [
        normalizedHeroSection,
        ...currentSections.filter((section) => section.id !== normalizedHeroSection.id),
      ].sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
    );
    setActiveBackendSection(normalizedHeroSection);
    setSectionLoadMessage('Hero section created in backend');
    setSectionDetailMessage('Created Hero section in backend');
  };

  const handleUpdateHeroSection = async () => {
    const section = currentBackendSection;

    if (!section || !activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setSectionDetailMessage('Create the Hero backend section before updating Hero content');
      return;
    }

    setIsUpdatingHeroSection(true);
    setSectionDetailMessage('Updating Hero content in backend...');

    const updatedHeroSection = await authService.updateHeroSection(
      activeWebsiteId,
      section.id,
      buildHeroSectionPayload(section)
    );

    setIsUpdatingHeroSection(false);

    if (!updatedHeroSection) {
      setSectionDetailMessage('Unable to update Hero content in backend');
      return;
    }

    const mergedHeroSection: BiographyWebsiteSection = {
      ...section,
      ...updatedHeroSection,
      id: section.id,
      key: updatedHeroSection.key && updatedHeroSection.key !== section.id ? updatedHeroSection.key : section.key,
      title:
        updatedHeroSection.title && updatedHeroSection.title !== section.id
          ? updatedHeroSection.title
          : section.title,
      isVisible: section.isVisible ?? true,
      sortOrder: section.sortOrder ?? section.order ?? 1,
      order: section.order ?? section.sortOrder ?? 1,
    };

    setActiveBackendSection(mergedHeroSection);
    setWebsiteSections((currentSections) =>
      currentSections
        .map((item) => (item.id === mergedHeroSection.id ? { ...item, ...mergedHeroSection } : item))
        .sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
    );
    setSectionDetailMessage('Updated Hero content in backend');
  };

  const handleCreateChronicleSection = async () => {
    if (!activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setSectionDetailMessage('Save this biography first before creating backend sections');
      return;
    }

    setIsCreatingChronicleSection(true);
    setSectionDetailMessage('Creating Chronicle section in backend...');

    const chronicleSection = await authService.createChronicleSection(
      activeWebsiteId,
      buildChronicleSectionPayload()
    );

    setIsCreatingChronicleSection(false);

    if (!chronicleSection) {
      setSectionDetailMessage('Unable to create Chronicle section in backend');
      return;
    }

    const normalizedChronicleSection: BiographyWebsiteSection = {
      ...chronicleSection,
      key: chronicleSection.key || 'chronicle',
      title: chronicleSection.title || 'Chronicle',
      sortOrder: chronicleSection.sortOrder ?? chronicleSection.order ?? 2,
      order: chronicleSection.order ?? chronicleSection.sortOrder ?? 2,
      isVisible: chronicleSection.isVisible ?? true,
    };

    setWebsiteSections((currentSections) =>
      [
        normalizedChronicleSection,
        ...currentSections.filter((section) => section.id !== normalizedChronicleSection.id),
      ].sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
    );
    setActiveBackendSection(normalizedChronicleSection);
    setSectionLoadMessage('Chronicle section created in backend');
    setSectionDetailMessage('Created Chronicle section in backend');
  };

  const handleUpdateChronicleSection = async () => {
    const section = currentBackendSection;

    if (!section || !activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setSectionDetailMessage('Create the Chronicle backend section before updating Chronicle content');
      return;
    }

    setIsUpdatingChronicleSection(true);
    setSectionDetailMessage('Updating Chronicle content in backend...');

    const updatedChronicleSection = await authService.updateChronicleSection(
      activeWebsiteId,
      section.id,
      buildUpdateChronicleSectionPayload(section)
    );

    setIsUpdatingChronicleSection(false);

    if (!updatedChronicleSection) {
      setSectionDetailMessage('Unable to update Chronicle content in backend');
      return;
    }

    const mergedChronicleSection: BiographyWebsiteSection = {
      ...section,
      ...updatedChronicleSection,
      id: section.id,
      key:
        updatedChronicleSection.key && updatedChronicleSection.key !== section.id
          ? updatedChronicleSection.key
          : section.key,
      title:
        updatedChronicleSection.title && updatedChronicleSection.title !== section.id
          ? updatedChronicleSection.title
          : section.title,
      isVisible: section.isVisible ?? true,
      sortOrder: section.sortOrder ?? section.order ?? 2,
      order: section.order ?? section.sortOrder ?? 2,
    };

    setActiveBackendSection(mergedChronicleSection);
    setWebsiteSections((currentSections) =>
      currentSections
        .map((item) =>
          item.id === mergedChronicleSection.id ? { ...item, ...mergedChronicleSection } : item
        )
        .sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
    );
    setSectionDetailMessage('Updated Chronicle content in backend');
  };

  const handleCreatePursuitsSection = async () => {
    if (!activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setSectionDetailMessage('Save this biography first before creating backend sections');
      return;
    }

    setIsCreatingPursuitsSection(true);
    setSectionDetailMessage('Creating Pursuits section in backend...');

    const pursuitsSection = await authService.createPursuitsSection(
      activeWebsiteId,
      buildPursuitsSectionPayload()
    );

    setIsCreatingPursuitsSection(false);

    if (!pursuitsSection) {
      setSectionDetailMessage('Unable to create Pursuits section in backend');
      return;
    }

    const normalizedPursuitsSection: BiographyWebsiteSection = {
      ...pursuitsSection,
      key: pursuitsSection.key || 'pursuits',
      title: pursuitsSection.title || 'Pursuits',
      sortOrder: pursuitsSection.sortOrder ?? pursuitsSection.order ?? 3,
      order: pursuitsSection.order ?? pursuitsSection.sortOrder ?? 3,
      isVisible: pursuitsSection.isVisible ?? true,
    };

    setWebsiteSections((currentSections) =>
      [
        normalizedPursuitsSection,
        ...currentSections.filter((section) => section.id !== normalizedPursuitsSection.id),
      ].sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
    );
    setSectionLoadMessage('Pursuits section created in backend');
    setSectionDetailMessage('Created Pursuits section in backend');
  };

  const handleUpdatePursuitsSection = async () => {
    if (!pursuitsBackendSection || !activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setSectionDetailMessage('Create the Pursuits backend section before updating Pursuits content');
      return;
    }

    setIsUpdatingPursuitsSection(true);
    setSectionDetailMessage('Loading Pursuits item IDs...');

    const detailedPursuitsSection =
      await authService.getBiographyWebsiteSection(activeWebsiteId, pursuitsBackendSection.id);
    const section = detailedPursuitsSection || pursuitsBackendSection;

    setSectionDetailMessage('Updating Pursuits content in backend...');

    const updatedPursuitsSection = await authService.updatePursuitsSection(
      activeWebsiteId,
      section.id,
      buildUpdatePursuitsSectionPayload(section)
    );

    setIsUpdatingPursuitsSection(false);

    if (!updatedPursuitsSection) {
      setSectionDetailMessage('Unable to update Pursuits content in backend');
      return;
    }

    const mergedPursuitsSection: BiographyWebsiteSection = {
      ...section,
      ...updatedPursuitsSection,
      id: section.id,
      key:
        updatedPursuitsSection.key && updatedPursuitsSection.key !== section.id
          ? updatedPursuitsSection.key
          : section.key,
      title:
        updatedPursuitsSection.title && updatedPursuitsSection.title !== section.id
          ? updatedPursuitsSection.title
          : section.title,
      isVisible: section.isVisible ?? true,
      sortOrder: section.sortOrder ?? section.order ?? 3,
      order: section.order ?? section.sortOrder ?? 3,
    };

    setWebsiteSections((currentSections) =>
      currentSections
        .map((item) =>
          item.id === mergedPursuitsSection.id ? { ...item, ...mergedPursuitsSection } : item
        )
        .sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
    );
    setSectionDetailMessage('Updated Pursuits content in backend');
  };

  const handleCreateTimelineSection = async () => {
    if (!activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setSectionDetailMessage('Save this biography first before creating backend sections');
      return;
    }

    setIsCreatingTimelineSection(true);
    setSectionDetailMessage('Creating Timeline section in backend...');

    const timelineSection = await authService.createTimelineSection(
      activeWebsiteId,
      buildTimelineSectionPayload()
    );

    setIsCreatingTimelineSection(false);

    if (!timelineSection) {
      setSectionDetailMessage('Unable to create Timeline section in backend');
      return;
    }

    const normalizedTimelineSection: BiographyWebsiteSection = {
      ...timelineSection,
      key: timelineSection.key || 'timeline',
      title: timelineSection.title || 'Timeline',
      sortOrder: timelineSection.sortOrder ?? timelineSection.order ?? 4,
      order: timelineSection.order ?? timelineSection.sortOrder ?? 4,
      isVisible: timelineSection.isVisible ?? true,
    };

    setWebsiteSections((currentSections) =>
      [
        normalizedTimelineSection,
        ...currentSections.filter((section) => section.id !== normalizedTimelineSection.id),
      ].sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
    );
    setActiveBackendSection(normalizedTimelineSection);
    setSectionLoadMessage('Timeline section created in backend');
    setSectionDetailMessage('Created Timeline section in backend');
  };

  const handleUpdateTimelineSection = async () => {
    const timelineSection = currentBackendSection;

    if (!timelineSection || !activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setSectionDetailMessage('Create the Timeline backend section before updating Timeline content');
      return;
    }

    setIsUpdatingTimelineSection(true);
    setSectionDetailMessage('Loading Timeline event IDs...');

    const detailedTimelineSection =
      await authService.getBiographyWebsiteSection(activeWebsiteId, timelineSection.id);
    const section = detailedTimelineSection || timelineSection;

    setSectionDetailMessage('Updating Timeline content in backend...');

    const updatedTimelineSection = await authService.updateTimelineSection(
      activeWebsiteId,
      section.id,
      buildUpdateTimelineSectionPayload(section)
    );

    setIsUpdatingTimelineSection(false);

    if (!updatedTimelineSection) {
      setSectionDetailMessage('Unable to update Timeline content in backend');
      return;
    }

    const mergedTimelineSection: BiographyWebsiteSection = {
      ...section,
      ...updatedTimelineSection,
      id: section.id,
      key:
        updatedTimelineSection.key && updatedTimelineSection.key !== section.id
          ? updatedTimelineSection.key
          : section.key,
      title:
        updatedTimelineSection.title && updatedTimelineSection.title !== section.id
          ? updatedTimelineSection.title
          : section.title,
      isVisible: section.isVisible ?? true,
      sortOrder: section.sortOrder ?? section.order ?? 4,
      order: section.order ?? section.sortOrder ?? 4,
    };

    setActiveBackendSection(mergedTimelineSection);
    setWebsiteSections((currentSections) =>
      currentSections
        .map((item) =>
          item.id === mergedTimelineSection.id ? { ...item, ...mergedTimelineSection } : item
        )
        .sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
    );
    setSectionDetailMessage('Updated Timeline content in backend');
  };

  const handleCreateGallerySection = async () => {
    if (!activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setSectionDetailMessage('Save this biography first before creating backend sections');
      return;
    }

    setIsCreatingGallerySection(true);
    setSectionDetailMessage('Creating Gallery section in backend...');

    const gallerySection = await authService.createGallerySection(
      activeWebsiteId,
      buildGallerySectionPayload()
    );

    setIsCreatingGallerySection(false);

    if (!gallerySection) {
      setSectionDetailMessage('Unable to create Gallery section in backend');
      return;
    }

    const normalizedGallerySection: BiographyWebsiteSection = {
      ...gallerySection,
      key: gallerySection.key || 'gallery',
      title: gallerySection.title || 'Gallery',
      sortOrder: gallerySection.sortOrder ?? gallerySection.order ?? 5,
      order: gallerySection.order ?? gallerySection.sortOrder ?? 5,
      isVisible: gallerySection.isVisible ?? true,
    };

    setWebsiteSections((currentSections) =>
      [
        normalizedGallerySection,
        ...currentSections.filter((section) => section.id !== normalizedGallerySection.id),
      ].sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
    );
    setActiveBackendSection(normalizedGallerySection);
    setSectionLoadMessage('Gallery section created in backend');
    setSectionDetailMessage('Created Gallery section in backend');
  };

  const handleUpdateGallerySection = async () => {
    const gallerySection = currentBackendSection;

    if (!gallerySection || !activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setSectionDetailMessage('Create the Gallery backend section before updating Gallery content');
      return;
    }

    setIsUpdatingGallerySection(true);
    setSectionDetailMessage('Loading Gallery item IDs...');

    const detailedGallerySection =
      await authService.getBiographyWebsiteSection(activeWebsiteId, gallerySection.id);
    const section = detailedGallerySection || gallerySection;

    setSectionDetailMessage('Updating Gallery content in backend...');

    const updatedGallerySection = await authService.updateGallerySection(
      activeWebsiteId,
      section.id,
      buildUpdateGallerySectionPayload(section)
    );

    setIsUpdatingGallerySection(false);

    if (!updatedGallerySection) {
      setSectionDetailMessage('Unable to update Gallery content in backend');
      return;
    }

    const mergedGallerySection: BiographyWebsiteSection = {
      ...section,
      ...updatedGallerySection,
      id: section.id,
      key:
        updatedGallerySection.key && updatedGallerySection.key !== section.id
          ? updatedGallerySection.key
          : section.key,
      title:
        updatedGallerySection.title && updatedGallerySection.title !== section.id
          ? updatedGallerySection.title
          : section.title,
      isVisible: section.isVisible ?? true,
      sortOrder: section.sortOrder ?? section.order ?? 5,
      order: section.order ?? section.sortOrder ?? 5,
    };

    setActiveBackendSection(mergedGallerySection);
    setWebsiteSections((currentSections) =>
      currentSections
        .map((item) =>
          item.id === mergedGallerySection.id ? { ...item, ...mergedGallerySection } : item
        )
        .sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
    );
    setSectionDetailMessage('Updated Gallery content in backend');
  };

  const handleCreateContactSection = async () => {
    if (!activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setSectionDetailMessage('Save this biography first before creating backend sections');
      return;
    }

    setIsCreatingContactSection(true);
    setSectionDetailMessage('Creating Contact section in backend...');

    const contactSection = await authService.createContactSection(
      activeWebsiteId,
      buildContactSectionPayload()
    );

    setIsCreatingContactSection(false);

    if (!contactSection) {
      setSectionDetailMessage('Unable to create Contact section in backend');
      return;
    }

    const normalizedContactSection: BiographyWebsiteSection = {
      ...contactSection,
      key: contactSection.key || 'contact',
      title: contactSection.title || 'Contact',
      sortOrder: contactSection.sortOrder ?? contactSection.order ?? 7,
      order: contactSection.order ?? contactSection.sortOrder ?? 7,
      isVisible: contactSection.isVisible ?? (draft.settings.showContactSection !== false),
    };

    setWebsiteSections((currentSections) =>
      [
        normalizedContactSection,
        ...currentSections.filter((section) => section.id !== normalizedContactSection.id),
      ].sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
    );
    setActiveBackendSection(normalizedContactSection);
    setSectionLoadMessage('Contact section created in backend');
    setSectionDetailMessage('Created Contact section in backend');
  };

  const handleUpdateContactSection = async () => {
    const contactSection = currentBackendSection;

    if (!contactSection || !activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setSectionDetailMessage('Create the Contact backend section before updating Contact content');
      return;
    }

    setIsUpdatingContactSection(true);
    setSectionDetailMessage('Loading Contact social link IDs...');

    const detailedContactSection =
      await authService.getBiographyWebsiteSection(activeWebsiteId, contactSection.id);
    const section = detailedContactSection || contactSection;

    setSectionDetailMessage('Updating Contact content in backend...');

    const updatedContactSection = await authService.updateContactSection(
      activeWebsiteId,
      section.id,
      buildUpdateContactSectionPayload(section)
    );

    setIsUpdatingContactSection(false);

    if (!updatedContactSection) {
      setSectionDetailMessage('Unable to update Contact content in backend');
      return;
    }

    const mergedContactSection: BiographyWebsiteSection = {
      ...section,
      ...updatedContactSection,
      id: section.id,
      key:
        updatedContactSection.key && updatedContactSection.key !== section.id
          ? updatedContactSection.key
          : section.key,
      title:
        updatedContactSection.title && updatedContactSection.title !== section.id
          ? updatedContactSection.title
          : section.title,
      isVisible: updatedContactSection.isVisible ?? (draft.settings.showContactSection !== false),
      sortOrder: section.sortOrder ?? section.order ?? 7,
      order: section.order ?? section.sortOrder ?? 7,
    };

    setActiveBackendSection(mergedContactSection);
    setWebsiteSections((currentSections) =>
      currentSections
        .map((item) =>
          item.id === mergedContactSection.id ? { ...item, ...mergedContactSection } : item
        )
        .sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
    );
    setSectionDetailMessage('Updated Contact content in backend');
  };

  const sortBackendSections = (sections: BiographyWebsiteSection[]) =>
    [...sections].sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0));

  const mergeBackendSection = (
    sections: BiographyWebsiteSection[],
    section: BiographyWebsiteSection
  ) => sortBackendSections([
    section,
    ...sections.filter((item) => item.id !== section.id),
  ]);

  const normalizeSyncedSection = (
    savedSection: BiographyWebsiteSection,
    fallback: Pick<BiographyWebsiteSection, 'key' | 'title' | 'sortOrder' | 'order' | 'isVisible'>,
    existingSection?: BiographyWebsiteSection | null
  ): BiographyWebsiteSection => ({
    ...existingSection,
    ...savedSection,
    id: savedSection.id || existingSection?.id || fallback.key,
    key:
      savedSection.key && savedSection.key !== savedSection.id
        ? savedSection.key
        : existingSection?.key || fallback.key,
    title:
      savedSection.title && savedSection.title !== savedSection.id
        ? savedSection.title
        : existingSection?.title || fallback.title,
    sortOrder: savedSection.sortOrder ?? savedSection.order ?? existingSection?.sortOrder ?? fallback.sortOrder,
    order: savedSection.order ?? savedSection.sortOrder ?? existingSection?.order ?? fallback.order,
    isVisible: savedSection.isVisible ?? existingSection?.isVisible ?? fallback.isVisible,
  });

  const loadDetailedBackendSections = async (targetWebsiteId: string) => {
    const sections = await authService.getBiographyWebsiteSections(targetWebsiteId);

    return Promise.all(
      sections.map(async (section) => {
        const sectionDetail = await authService.getBiographyWebsiteSection(targetWebsiteId, section.id);
        return sectionDetail || section;
      })
    );
  };

  const syncBiographySectionsToBackend = async (
    targetWebsiteId: string,
    omittedMediaAssetIds: ReadonlySet<string> = EMPTY_OMITTED_MEDIA_ASSET_IDS
  ) => {
    if (!targetWebsiteId || targetWebsiteId.startsWith('local-')) {
      return [];
    }

    setSectionDetailMessage('Saving biography sections to backend...');

    let latestSections = await loadDetailedBackendSections(targetWebsiteId);
    const syncedSections: BiographyWebsiteSection[] = [];

    const syncSection = async (
      label: string,
      fallback: Pick<BiographyWebsiteSection, 'key' | 'title' | 'sortOrder' | 'order' | 'isVisible'>,
      findSection: (sections: BiographyWebsiteSection[]) => BiographyWebsiteSection | null,
      createSection: () => Promise<BiographyWebsiteSection | null>,
      updateSection: (section: BiographyWebsiteSection) => Promise<BiographyWebsiteSection | null>
    ) => {
      const existingSection = findSection(latestSections);
      const savedSection = existingSection
        ? await updateSection(existingSection)
        : await createSection();

      if (!savedSection) {
        throw new Error(`Unable to save ${label} section to backend`);
      }

      const normalizedSection = normalizeSyncedSection(savedSection, fallback, existingSection);
      latestSections = mergeBackendSection(latestSections, normalizedSection);
      syncedSections.push(normalizedSection);
      return normalizedSection;
    };

    await syncSection(
      'Hero',
      { key: 'hero', title: 'Hero', sortOrder: 1, order: 1, isVisible: true },
      (sections) => getBackendSectionForEditorSection('hero', sections),
      () => authService.createHeroSection(targetWebsiteId, buildHeroSectionPayload(null, omittedMediaAssetIds)),
      async (section) => {
        const detailedSection = await authService.getBiographyWebsiteSection(targetWebsiteId, section.id);
        const sectionToUpdate = detailedSection || section;
        return authService.updateHeroSection(
          targetWebsiteId,
          sectionToUpdate.id,
          buildHeroSectionPayload(sectionToUpdate, omittedMediaAssetIds)
        );
      }
    );

    await syncSection(
      'Chronicle',
      { key: 'chronicle', title: 'Chronicle', sortOrder: 2, order: 2, isVisible: true },
      (sections) => getBackendSectionForEditorSection('about', sections),
      () => authService.createChronicleSection(targetWebsiteId, buildChronicleSectionPayload()),
      async (section) => {
        const detailedSection = await authService.getBiographyWebsiteSection(targetWebsiteId, section.id);
        const sectionToUpdate = detailedSection || section;
        return authService.updateChronicleSection(
          targetWebsiteId,
          sectionToUpdate.id,
          buildUpdateChronicleSectionPayload(sectionToUpdate)
        );
      }
    );

    await syncSection(
      'Pursuits',
      { key: 'pursuits', title: 'Pursuits', sortOrder: 3, order: 3, isVisible: true },
      (sections) => getBackendSectionByAliases(['pursuits', 'pursuit', 'specialized pursuits'], sections),
      () => authService.createPursuitsSection(targetWebsiteId, buildPursuitsSectionPayload(omittedMediaAssetIds)),
      async (section) => {
        const detailedSection = await authService.getBiographyWebsiteSection(targetWebsiteId, section.id);
        const sectionToUpdate = detailedSection || section;
        return authService.updatePursuitsSection(
          targetWebsiteId,
          sectionToUpdate.id,
          buildUpdatePursuitsSectionPayload(sectionToUpdate, omittedMediaAssetIds)
        );
      }
    );

    await syncSection(
      'Timeline',
      { key: 'timeline', title: 'Timeline', sortOrder: 4, order: 4, isVisible: true },
      (sections) => getBackendSectionForEditorSection('timeline', sections),
      () => authService.createTimelineSection(targetWebsiteId, buildTimelineSectionPayload(omittedMediaAssetIds)),
      async (section) => {
        const detailedSection = await authService.getBiographyWebsiteSection(targetWebsiteId, section.id);
        const sectionToUpdate = detailedSection || section;
        return authService.updateTimelineSection(
          targetWebsiteId,
          sectionToUpdate.id,
          buildUpdateTimelineSectionPayload(sectionToUpdate, omittedMediaAssetIds)
        );
      }
    );

    await syncSection(
      'Gallery',
      { key: 'gallery', title: 'Gallery', sortOrder: 5, order: 5, isVisible: true },
      (sections) => getBackendSectionForEditorSection('gallery', sections),
      () => authService.createGallerySection(targetWebsiteId, buildGallerySectionPayload(omittedMediaAssetIds)),
      async (section) => {
        const detailedSection = await authService.getBiographyWebsiteSection(targetWebsiteId, section.id);
        const sectionToUpdate = detailedSection || section;
        return authService.updateGallerySection(
          targetWebsiteId,
          sectionToUpdate.id,
          buildUpdateGallerySectionPayload(sectionToUpdate, omittedMediaAssetIds)
        );
      }
    );

    await syncSection(
      'Contact',
      {
        key: 'contact',
        title: 'Contact',
        sortOrder: 7,
        order: 7,
        isVisible: draft.settings.showContactSection !== false,
      },
      (sections) => getBackendSectionForEditorSection('contact', sections),
      () => authService.createContactSection(targetWebsiteId, buildContactSectionPayload()),
      async (section) => {
        const detailedSection = await authService.getBiographyWebsiteSection(targetWebsiteId, section.id);
        const sectionToUpdate = detailedSection || section;
        return authService.updateContactSection(
          targetWebsiteId,
          sectionToUpdate.id,
          buildUpdateContactSectionPayload(sectionToUpdate)
        );
      }
    );

    const nextSections = sortBackendSections(latestSections);
    setWebsiteSections(nextSections);
    setSectionLoadMessage(`Saved ${syncedSections.length} backend sections`);
    setSectionDetailMessage('Saved biography content to backend');
    return nextSections;
  };

  const updatePersonalDetail = (field: PersonalTextFieldKey, value: string) => {
    setDraft((current) => ({
      ...current,
      personalDetails: {
        ...current.personalDetails,
        [field]: value,
      },
    }));
    setSaveMessage('Unsaved changes');
  };

  const updateProfileImageSettings = (updates: ImageDisplaySettings) => {
    setDraft((current) => ({
      ...current,
      personalDetails: {
        ...current.personalDetails,
        profileImageSettings: {
          ...(current.personalDetails.profileImageSettings || {}),
          ...updates,
        },
      },
    }));
    setSaveMessage('Unsaved changes');
  };

  const updatePersonalTextSettings = (
    field:
      | 'taglineTextSettings'
      | 'shortIntroTextSettings'
      | 'bioTextSettings'
      | 'signatureQuoteTextSettings',
    updates: TextDisplaySettings
  ) => {
    setDraft((current) => ({
      ...current,
      personalDetails: {
        ...current.personalDetails,
        [field]: {
          ...(current.personalDetails[field] || {}),
          ...updates,
        },
      },
    }));
    setSaveMessage('Unsaved changes');
  };

  const updateValueItem = <K extends keyof ValueItem>(index: number, field: K, value: ValueItem[K]) => {
    setDraft((current) => ({
      ...current,
      values: current.values.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
    setSaveMessage('Unsaved changes');
  };

  const updateHobbyItem = <K extends keyof HobbyItem>(index: number, field: K, value: HobbyItem[K]) => {
    setDraft((current) => ({
      ...current,
      hobbies: current.hobbies.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
    setSaveMessage('Unsaved changes');
  };

  const updateTimelineItem = (index: number, updates: Partial<TimelineMilestone>) => {
    setDraft((current) => ({
      ...current,
      timeline: current.timeline.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      ),
    }));
    setSaveMessage('Unsaved changes');
  };

  const updateGalleryItem = (index: number, updates: Partial<GalleryItem>) => {
    setDraft((current) => ({
      ...current,
      gallery: current.gallery.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      ),
    }));
    setSaveMessage('Unsaved changes');
  };

  const updateStoryItem = <K extends keyof MemoryStory>(index: number, field: K, value: MemoryStory[K]) => {
    setDraft((current) => ({
      ...current,
      stories: current.stories.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
    setSaveMessage('Unsaved changes');
  };

  const updateSectionDescription = (section: EditableSectionCopyKey, value: string) => {
    setDraft((current) => {
      const sectionCopy = getSectionCopy(current.sectionCopy);

      return {
        ...current,
        sectionCopy: {
          ...current.sectionCopy,
          [section]: {
            title: sectionCopy[section].title,
            description: value,
            descriptionTextSettings: current.sectionCopy?.[section]?.descriptionTextSettings,
          },
        },
      };
    });
    setSaveMessage('Unsaved changes');
  };

  const updateSectionDescriptionTextSettings = (
    section: EditableSectionCopyKey,
    updates: TextDisplaySettings
  ) => {
    setDraft((current) => {
      const sectionCopy = getSectionCopy(current.sectionCopy);

      return {
        ...current,
        sectionCopy: {
          ...current.sectionCopy,
          [section]: {
            title: sectionCopy[section].title,
            description: sectionCopy[section].description,
            descriptionTextSettings: {
              ...(sectionCopy[section].descriptionTextSettings || {}),
              ...updates,
            },
          },
        },
      };
    });
    setSaveMessage('Unsaved changes');
  };

  const updateSettings = <K extends keyof CustomizerSettings>(
    field: K,
    value: CustomizerSettings[K],
  ) => {
    setDraft((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [field]: value,
      },
    }));
    setSaveMessage('Unsaved changes');
  };

  const getAiWritingTargets = (): AiWritingTarget[] => {
    const sectionCopy = getSectionCopy(draft.sectionCopy);
    const targets: AiWritingTarget[] = [
      {
        id: 'hero.tagline',
        label: 'Hero - Short tagline',
        section: 'hero',
        value: draft.personalDetails.tagline,
        onReplace: (value) => updatePersonalDetail('tagline', value),
      },
      {
        id: 'hero.shortIntro',
        label: 'Hero - Short introduction',
        section: 'hero',
        value: draft.personalDetails.shortIntro,
        onReplace: (value) => updatePersonalDetail('shortIntro', value),
      },
      {
        id: 'about.description',
        label: 'Chronicle & Values - Section description',
        section: 'about',
        value: sectionCopy.about.description,
        onReplace: (value) => updateSectionDescription('about', value),
      },
      {
        id: 'about.bioFull',
        label: 'Chronicle & Values - Biography summary',
        section: 'about',
        value: draft.personalDetails.bioFull,
        onReplace: (value) => updatePersonalDetail('bioFull', value),
      },
      {
        id: 'about.signatureQuote',
        label: 'Chronicle & Values - Signature quote',
        section: 'about',
        value: draft.personalDetails.signatureQuote,
        onReplace: (value) => updatePersonalDetail('signatureQuote', value),
      },
      ...draft.hobbies.map((item, index) => ({
        id: `pursuits.${item.id}.description`,
        label: `Specialized Pursuits - Interest ${index + 1} description`,
        section: 'pursuits' as EditableTemplateSection,
        value: item.description,
        onReplace: (value: string) => updateHobbyItem(index, 'description', value),
      })),
      {
        id: 'timeline.description',
        label: 'Life Journey - Section description',
        section: 'timeline',
        value: sectionCopy.timeline.description,
        onReplace: (value) => updateSectionDescription('timeline', value),
      },
      ...draft.timeline.map((milestone, index) => ({
        id: `timeline.${milestone.id}.description`,
        label: `Life Journey - Milestone ${index + 1} description`,
        section: 'timeline' as EditableTemplateSection,
        value: milestone.description,
        onReplace: (value: string) => updateTimelineItem(index, { description: value }),
      })),
      {
        id: 'gallery.description',
        label: 'Media Gallery - Section description',
        section: 'gallery',
        value: sectionCopy.gallery.description,
        onReplace: (value) => updateSectionDescription('gallery', value),
      },
      ...draft.gallery.map((item, index) => ({
        id: `gallery.${item.id}.caption`,
        label: `Media Gallery - Item ${index + 1} caption`,
        section: 'gallery' as EditableTemplateSection,
        value: item.caption,
        onReplace: (value: string) => updateGalleryItem(index, { caption: value }),
      })),
      {
        id: 'stories.description',
        label: 'Memories & Stories - Section description',
        section: 'stories',
        value: sectionCopy.stories.description,
        onReplace: (value) => updateSectionDescription('stories', value),
      },
      ...draft.stories.map((story, index) => ({
        id: `stories.${story.id}.shortDescription`,
        label: `Memories & Stories - Story ${index + 1} summary`,
        section: 'stories' as EditableTemplateSection,
        value: story.shortDescription,
        onReplace: (value: string) => updateStoryItem(index, 'shortDescription', value),
      })),
      {
        id: 'contact.description',
        label: 'Contact - Section description',
        section: 'contact',
        value: sectionCopy.contact.description,
        onReplace: (value) => updateSectionDescription('contact', value),
      },
    ];

    return targets;
  };

  const getSelectedAiWritingTarget = () => {
    const targets = getAiWritingTargets();
    return (
      targets.find((target) => target.id === aiWritingTargetId) ||
      targets.find((target) => activeEditorSection && target.section === activeEditorSection) ||
      targets[0] ||
      null
    );
  };

  const handleGenerateAiWriting = async () => {
    const target = getSelectedAiWritingTarget();

    if (!target) {
      setAiWritingMessage('No editable writing target found');
      return;
    }

    const sourceText = stripRichText(target.value).trim();
    const userInstruction = aiWritingInstructions.trim();

    if (!sourceText && aiWritingAction !== 'generate') {
      setAiWritingTargetId(target.id);
      setAiWritingResult('');
      setAiWritingMessage('Add some text to this field first, then use Rewrite, Improve, or Expand');
      return;
    }

    if (!sourceText && aiWritingAction === 'generate' && !userInstruction) {
      setAiWritingTargetId(target.id);
      setAiWritingResult('');
      setAiWritingMessage('Add instructions or select text before using Generate');
      return;
    }

    setAiWritingTargetId(target.id);
    setAiWritingResult('');

    if (!activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setAiWritingMessage('Save this biography to My Biographies before using backend AI writing.');
      return;
    }

    setIsGeneratingAiWriting(true);

    try {
      const payload = {
        websiteId: activeWebsiteId,
        sectionId: currentBackendSection?.id || null,
        sourceText: sourceText || null,
        userInstruction: userInstruction || null,
        tone: 'WARM',
        language: 'ENGLISH' as const,
      };
      const response =
        aiWritingAction === 'rewrite'
          ? await authService.rewriteAiWriting(payload)
          : aiWritingAction === 'improve'
            ? await authService.improveAiWriting(payload)
            : aiWritingAction === 'expand'
              ? await authService.expandAiWriting(payload)
              : await authService.generateAiWriting(payload);

      setAiWritingResult(response.generatedText);
      setAiWritingMessage(
        response.totalTokens
          ? `AI suggestion generated from backend (${response.totalTokens} tokens). Review before applying`
          : 'AI suggestion generated from backend. Review before applying'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI writing request failed';
      setAiWritingResult('');
      setAiWritingMessage(`${message}. No suggestion was generated.`);
    } finally {
      setIsGeneratingAiWriting(false);
    }
  };

  const handleApplyAiWriting = (mode: 'replace' | 'insert') => {
    const target = getSelectedAiWritingTarget();

    if (!target || !hasText(aiWritingResult)) {
      setAiWritingMessage('Generate a suggestion before applying');
      return;
    }

    const nextValue =
      mode === 'insert' && hasText(target.value)
        ? `${target.value.trim()}\n\n${aiWritingResult.trim()}`
        : aiWritingResult.trim();

    target.onReplace(nextValue);
    setAiWritingMessage(mode === 'insert' ? 'Suggestion inserted below' : 'Suggestion replaced the selected field');
  };

  const renderTextField = ({
    label,
    value,
    onChange,
    multiline = false,
    rows = 3,
    section = activeEditorSection ?? 'hero',
  }: TextFieldConfig) => (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onFocus={() => focusPreviewSection(section)}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onFocus={() => focusPreviewSection(section)}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
    </label>
  );

  const renderSelectField = ({
    label,
    value,
    options,
    onChange,
    section = activeEditorSection ?? 'hero',
  }: SelectFieldConfig) => (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <select
        value={value}
        onFocus={() => focusPreviewSection(section)}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );

  const renderImageUploadField = ({
    label,
    value,
    assetId,
    usageType,
    onChange,
    onAssetChange,
    section,
  }: {
    label: string;
    value?: string;
    assetId?: string;
    usageType: MediaUsageType;
    onChange: (value: string) => void;
    onAssetChange?: (assetId: string) => void;
    section: EditableTemplateSection;
  }) => {
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files?.[0];
      event.currentTarget.value = '';

      if (!file) {
        return;
      }

      try {
        validateImageFile(file);
        focusPreviewSection(section);

        if (activeWebsiteId && !activeWebsiteId.startsWith('local-')) {
          setSaveMessage('Uploading image to media storage...');
          const uploadedMedia = await authService.uploadBiographyWebsiteMedia(
            activeWebsiteId,
            file,
            usageType
          );

          if (!uploadedMedia?.accessUrl) {
            setSaveMessage('Unable to upload image to media storage');
            return;
          }

          onChange(uploadedMedia.accessUrl);
          onAssetChange?.(uploadedMedia.mediaAssetId);
          setMediaAssets((currentAssets) => [
            uploadedMedia,
            ...currentAssets.filter((asset) => asset.mediaAssetId !== uploadedMedia.mediaAssetId),
          ]);
          setMediaAssetsMessage('Media asset uploaded and added to the list');
          setSaveMessage('Image uploaded to media storage');
          return;
        }

        const imageDataUrl = await convertImageFileToDataUrl(file);
        onChange(imageDataUrl);
        onAssetChange?.('');
        setSaveMessage('Image uploaded locally. Save the biography before backend media upload');
      } catch (err: any) {
        setSaveMessage(err?.message || 'Unable to upload image');
      }
    };

    return (
      <div className="space-y-3 rounded-xl border border-slate-100 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {value ? (
              <img src={value} alt={`${label} preview`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="text-xs font-bold text-slate-700">{label}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                PNG, JPG, or WebP up to 8 MB.
                {activeWebsiteId && !activeWebsiteId.startsWith('local-')
                  ? ' Uploads to media storage.'
                  : ' Save first to upload to media storage.'}
              </p>
              {assetId && (
                <p className="mt-1 truncate text-[10px] font-mono text-emerald-600">
                  Media ID: {assetId}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-black px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-900">
                Upload Image
                <input
                  type="file"
                  accept={IMAGE_UPLOAD_ACCEPT}
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              {value && (
                <button
                  type="button"
                  onClick={async () => {
                    const removedAssetId = assetId;
                    focusPreviewSection(section);
                    flushSync(() => {
                      onChange('');
                      onAssetChange?.('');
                    });
                    setSaveMessage('Image removed');

                    if (activeWebsiteId && !activeWebsiteId.startsWith('local-') && removedAssetId) {
                      setSaveMessage('Removing image from database and media storage...');

                      try {
                        await syncBiographySectionsToBackend(activeWebsiteId, new Set([removedAssetId]));

                        const wasDeleted = await authService.deleteBiographyWebsiteMedia(
                          activeWebsiteId,
                          removedAssetId
                        );

                        if (wasDeleted) {
                          setMediaAssets((currentAssets) =>
                            currentAssets.filter((asset) => asset.mediaAssetId !== removedAssetId)
                          );
                          setMediaAssetsMessage('Deleted media asset');
                          setSaveMessage('Image removed from page and media storage');
                          return;
                        }

                        setMediaAssetsMessage('Unable to delete media. Remove it from other sections first');
                        setSaveMessage('Image removed from page. Media asset could not be deleted');
                      } catch (err: any) {
                        setSaveMessage(err?.message || 'Image removed from page, but media deletion failed');
                      }
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-600 transition hover:border-rose-300 hover:text-rose-600"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderImageDisplayFields = ({
    section,
    settings,
    onChange,
  }: {
    section: EditableTemplateSection;
    settings?: ImageDisplaySettings;
    onChange: (settings: ImageDisplaySettings) => void;
  }) => {
    const currentSettings: Required<ImageDisplaySettings> = {
      size: settings?.size || 'default',
      fit: settings?.fit || 'cover',
      position: settings?.position || 'center',
    };

    const updateImageSettings = (updates: ImageDisplaySettings) => {
      onChange({
        ...currentSettings,
        ...updates,
      });
    };

    return (
      <div className="space-y-3 rounded-xl border border-slate-100 bg-white p-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
            Image Display
          </h4>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            Size changes the image frame, so nearby content moves with it.
          </p>
        </div>
        {renderSelectField({
          label: 'Image size',
          value: currentSettings.size,
          options: IMAGE_SIZE_OPTIONS,
          section,
          onChange: (value) => updateImageSettings({ size: value as ImageDisplaySettings['size'] }),
        })}
        {renderSelectField({
          label: 'Image fit',
          value: currentSettings.fit,
          options: IMAGE_FIT_OPTIONS,
          section,
          onChange: (value) => updateImageSettings({ fit: value as ImageDisplaySettings['fit'] }),
        })}
        {renderSelectField({
          label: 'Image position',
          value: currentSettings.position,
          options: IMAGE_POSITION_OPTIONS,
          section,
          onChange: (value) => updateImageSettings({ position: value as ImageDisplaySettings['position'] }),
        })}
      </div>
    );
  };

  const renderTextDisplayFields = ({
    title = 'Text Display',
    section,
    settings,
    onChange,
  }: {
    title?: string;
    section: EditableTemplateSection;
    settings?: TextDisplaySettings;
    onChange: (settings: TextDisplaySettings) => void;
  }) => {
    const currentSettings: Required<TextDisplaySettings> = {
      size: settings?.size || 'default',
    };

    return (
      <div className="space-y-3 rounded-xl border border-slate-100 bg-white p-4">
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
          {title}
        </h4>
        {renderSelectField({
          label: 'Text size',
          value: currentSettings.size,
          options: TEXT_SIZE_OPTIONS,
          section,
          onChange: (value) => onChange({ size: value as TextDisplaySettings['size'] }),
        })}
      </div>
    );
  };

  const renderPersonalFields = (
    section: Extract<EditableTemplateSection, 'hero' | 'about' | 'timeline' | 'contact'>
  ) => {
    const fields = personalFieldsBySection[section];
    if (fields.length === 0) {
      return null;
    }

    return (
      <div className="space-y-4">
        {fields.map((item) =>
          renderTextField({
            label: item.label,
            value: String(draft.personalDetails[item.field] || ''),
            multiline: item.multiline,
            rows: item.rows,
            section,
            onChange: (value) => updatePersonalDetail(item.field, value),
          })
        )}
      </div>
    );
  };

  const renderSectionCopyFields = (section: EditableSectionCopyKey) => {
    const sectionCopy = getSectionCopy(draft.sectionCopy)[section];

    return (
      <div className="space-y-4 rounded-xl border border-[#FED362]/40 bg-[#FED362]/10 p-4">
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500">Section title</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              <Lock className="h-3 w-3" />
              Fixed
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-950">{sectionCopy.title}</p>
        </div>
        {renderTextField({
          label: 'Section description',
          value: sectionCopy.description,
          multiline: true,
          rows: 3,
          section,
          onChange: (value) => updateSectionDescription(section, value),
        })}
        {renderTextDisplayFields({
          title: 'Section Description Text',
          section,
          settings: sectionCopy.descriptionTextSettings,
          onChange: (settings) => updateSectionDescriptionTextSettings(section, settings),
        })}
        <p className="text-[11px] leading-relaxed text-slate-500">
          This description appears below the fixed section title in the template.
        </p>
      </div>
    );
  };

  const renderSectionEditor = () => {
    switch (activeEditorSection) {
      case 'hero':
        return (
          <div className="space-y-6">
            {renderPersonalFields('hero')}
            {renderImageUploadField({
              label: 'Profile image',
              value: draft.personalDetails.profileImageUrl || '',
              assetId: draft.personalDetails.profileImageAssetId,
              usageType: 'HERO_PROFILE',
              section: 'hero',
              onChange: (value) => updatePersonalDetail('profileImageUrl', value),
              onAssetChange: (assetId) => updatePersonalDetail('profileImageAssetId', assetId),
            })}
            {renderTextDisplayFields({
              title: 'Tagline Text',
              section: 'hero',
              settings: draft.personalDetails.taglineTextSettings,
              onChange: (settings) => updatePersonalTextSettings('taglineTextSettings', settings),
            })}
            {renderTextDisplayFields({
              title: 'Introduction Text',
              section: 'hero',
              settings: draft.personalDetails.shortIntroTextSettings,
              onChange: (settings) => updatePersonalTextSettings('shortIntroTextSettings', settings),
            })}
            {renderImageDisplayFields({
              section: 'hero',
              settings: draft.personalDetails.profileImageSettings,
              onChange: updateProfileImageSettings,
            })}
          </div>
        );

      case 'about':
        return (
          <div className="space-y-6">
            {renderSectionCopyFields('about')}
            {renderPersonalFields('about')}
            {renderTextDisplayFields({
              title: 'Biography Summary Text',
              section: 'about',
              settings: draft.personalDetails.bioTextSettings,
              onChange: (settings) => updatePersonalTextSettings('bioTextSettings', settings),
            })}
            {renderTextDisplayFields({
              title: 'Signature Quote Text',
              section: 'about',
              settings: draft.personalDetails.signatureQuoteTextSettings,
              onChange: (settings) => updatePersonalTextSettings('signatureQuoteTextSettings', settings),
            })}

            <div className="space-y-3 border-t border-slate-100 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Personal Values
              </h3>
              {draft.values.map((item, index) => (
                <div key={item.id} className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  {renderTextField({
                    label: `Value ${index + 1} title`,
                    value: item.title,
                    section: 'about',
                    onChange: (value) => updateValueItem(index, 'title', value),
                  })}
                  {renderTextField({
                    label: `Value ${index + 1} description`,
                    value: item.description,
                    multiline: true,
                    section: 'about',
                    onChange: (value) => updateValueItem(index, 'description', value),
                  })}
                  {renderTextDisplayFields({
                    title: `Value ${index + 1} Text`,
                    section: 'about',
                    settings: item.textSettings,
                    onChange: (textSettings) => updateValueItem(index, 'textSettings', textSettings),
                  })}
                </div>
              ))}
            </div>
          </div>
        );

      case 'pursuits':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Hobbies / Interests
              </h3>
              {draft.hobbies.map((item, index) => (
                <div key={item.id} className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  {renderTextField({
                    label: `Interest ${index + 1} title`,
                    value: item.title,
                    section: 'pursuits',
                    onChange: (value) => updateHobbyItem(index, 'title', value),
                  })}
                  {renderTextField({
                    label: `Interest ${index + 1} description`,
                    value: item.description,
                    multiline: true,
                    section: 'pursuits',
                    onChange: (value) => updateHobbyItem(index, 'description', value),
                  })}
                  {renderTextDisplayFields({
                    title: `Interest ${index + 1} Text`,
                    section: 'pursuits',
                    settings: item.textSettings,
                    onChange: (textSettings) => updateHobbyItem(index, 'textSettings', textSettings),
                  })}
                  {renderImageUploadField({
                    label: `Interest ${index + 1} image`,
                    value: item.imageUrl,
                    assetId: item.imageAssetId,
                    usageType: 'PURSUIT',
                    section: 'pursuits',
                    onChange: (value) => updateHobbyItem(index, 'imageUrl', value),
                    onAssetChange: (assetId) => updateHobbyItem(index, 'imageAssetId', assetId),
                  })}
                  {renderImageDisplayFields({
                    section: 'pursuits',
                    settings: item.imageSettings,
                    onChange: (imageSettings) => updateHobbyItem(index, 'imageSettings', imageSettings),
                  })}
                </div>
              ))}
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-6">
            {renderSectionCopyFields('timeline')}

            <div className="space-y-3 border-t border-slate-100 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Timeline Layout
              </h3>
              {draft.timeline.map((item, index) => (
                <div key={item.id} className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  {renderTextField({
                    label: `Milestone ${index + 1} year`,
                    value: item.year,
                    section: 'timeline',
                    onChange: (value) => updateTimelineItem(index, { year: value }),
                  })}
                  {renderTextField({
                    label: `Milestone ${index + 1} title`,
                    value: item.title,
                    section: 'timeline',
                    onChange: (value) => updateTimelineItem(index, { title: value }),
                  })}
                  {renderTextField({
                    label: `Milestone ${index + 1} location`,
                    value: item.location,
                    section: 'timeline',
                    onChange: (value) => updateTimelineItem(index, { location: value }),
                  })}
                  {renderTextField({
                    label: `Milestone ${index + 1} description`,
                    value: item.description,
                    multiline: true,
                    section: 'timeline',
                    onChange: (value) => updateTimelineItem(index, { description: value }),
                  })}
                  {renderTextField({
                    label: `Milestone ${index + 1} details`,
                    value: item.details.join('\n'),
                    multiline: true,
                    rows: 4,
                    section: 'timeline',
                    onChange: (value) =>
                      updateTimelineItem(index, {
                        details: value.split('\n').map((detail) => detail.trim()).filter(Boolean),
                      }),
                  })}
                  {renderTextDisplayFields({
                    title: `Milestone ${index + 1} Text`,
                    section: 'timeline',
                    settings: item.textSettings,
                    onChange: (textSettings) => updateTimelineItem(index, { textSettings }),
                  })}
                  {renderImageUploadField({
                    label: `Milestone ${index + 1} image`,
                    value: item.imageUrl || '',
                    assetId: item.imageAssetId,
                    usageType: 'TIMELINE',
                    section: 'timeline',
                    onChange: (value) => updateTimelineItem(index, { imageUrl: value }),
                    onAssetChange: (assetId) => updateTimelineItem(index, { imageAssetId: assetId }),
                  })}
                  {renderTextField({
                    label: `Milestone ${index + 1} image caption`,
                    value: item.imageCaption || '',
                    multiline: true,
                    section: 'timeline',
                    onChange: (value) => updateTimelineItem(index, { imageCaption: value }),
                  })}
                  {renderImageDisplayFields({
                    section: 'timeline',
                    settings: item.imageSettings,
                    onChange: (imageSettings) => updateTimelineItem(index, { imageSettings }),
                  })}
                </div>
              ))}
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-4">
            {renderSectionCopyFields('gallery')}
            {draft.gallery.map((item, index) => (
              <div key={item.id} className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                {renderTextField({
                  label: `Gallery item ${index + 1} title`,
                  value: item.title,
                  section: 'gallery',
                  onChange: (value) => updateGalleryItem(index, { title: value }),
                })}
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-slate-500">Category</span>
                  <select
                    value={item.category}
                    onFocus={() => focusPreviewSection('gallery')}
                    onChange={(event) =>
                      updateGalleryItem(index, {
                        category: event.target.value as GalleryItem['category'],
                      })
                    }
                    className={inputClass}
                  >
                    <option value="family">Family</option>
                    <option value="career">Career</option>
                    <option value="travel">Travel</option>
                    <option value="creative">Creative</option>
                  </select>
                </label>
                {renderTextField({
                  label: `Gallery item ${index + 1} year`,
                  value: item.year || '',
                  section: 'gallery',
                  onChange: (value) => updateGalleryItem(index, { year: value }),
                })}
                {renderImageUploadField({
                  label: `Gallery item ${index + 1} image`,
                  value: item.imageUrl,
                  assetId: item.mediaAssetId,
                  usageType: 'GALLERY',
                  section: 'gallery',
                  onChange: (value) => updateGalleryItem(index, { imageUrl: value }),
                  onAssetChange: (assetId) =>
                    updateGalleryItem(index, { mediaAssetId: assetId, thumbnailAssetId: assetId }),
                })}
                {renderImageDisplayFields({
                  section: 'gallery',
                  settings: item.imageSettings,
                  onChange: (imageSettings) => updateGalleryItem(index, { imageSettings }),
                })}
                {renderTextField({
                  label: `Gallery item ${index + 1} caption`,
                  value: item.caption,
                  multiline: true,
                  section: 'gallery',
                  onChange: (value) => updateGalleryItem(index, { caption: value }),
                })}
                {renderTextDisplayFields({
                  title: `Gallery Item ${index + 1} Text`,
                  section: 'gallery',
                  settings: item.textSettings,
                  onChange: (textSettings) => updateGalleryItem(index, { textSettings }),
                })}
              </div>
            ))}
          </div>
        );

      case 'stories':
        return (
          <div className="space-y-4">
            {renderSectionCopyFields('stories')}
            {draft.stories.map((item, index) => (
              <div key={item.id} className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                {renderTextField({
                  label: `Story ${index + 1} title`,
                  value: item.title,
                  section: 'stories',
                  onChange: (value) => updateStoryItem(index, 'title', value),
                })}
                {renderTextField({
                  label: `Story ${index + 1} date`,
                  value: item.date,
                  section: 'stories',
                  onChange: (value) => updateStoryItem(index, 'date', value),
                })}
                {renderTextField({
                  label: `Story ${index + 1} read time`,
                  value: item.readTime,
                  section: 'stories',
                  onChange: (value) => updateStoryItem(index, 'readTime', value),
                })}
                {renderTextField({
                  label: `Story ${index + 1} category`,
                  value: item.category,
                  section: 'stories',
                  onChange: (value) => updateStoryItem(index, 'category', value),
                })}
                {renderImageUploadField({
                  label: `Story ${index + 1} image`,
                  value: item.imageUrl,
                  assetId: item.imageAssetId,
                  usageType: 'STORY',
                  section: 'stories',
                  onChange: (value) => updateStoryItem(index, 'imageUrl', value),
                  onAssetChange: (assetId) => updateStoryItem(index, 'imageAssetId', assetId),
                })}
                {renderImageDisplayFields({
                  section: 'stories',
                  settings: item.imageSettings,
                  onChange: (imageSettings) => updateStoryItem(index, 'imageSettings', imageSettings),
                })}
                {renderTextField({
                  label: `Story ${index + 1} short description`,
                  value: item.shortDescription,
                  multiline: true,
                  section: 'stories',
                  onChange: (value) => updateStoryItem(index, 'shortDescription', value),
                })}
                {renderTextDisplayFields({
                  title: `Story ${index + 1} Text`,
                  section: 'stories',
                  settings: item.textSettings,
                  onChange: (textSettings) => updateStoryItem(index, 'textSettings', textSettings),
                })}
              </div>
            ))}
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            {renderSectionCopyFields('contact')}
            {renderPersonalFields('contact')}
          </div>
        );

      case 'style':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Theme Preset
              </span>
              <div className="space-y-2">
                {THEME_STYLE_PRESETS.map((preset) => {
                  const isSelected = draft.settings.theme === preset.value;

                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onFocus={() => focusPreviewSection('style')}
                      onClick={() => {
                        focusPreviewSection('style');
                        updateSettings('theme', preset.value);
                      }}
                      aria-pressed={isSelected}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? 'border-[#FED362] bg-amber-50/70 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/30'
                      }`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span className="block text-sm font-bold text-slate-950">
                            {preset.label}
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                            {preset.description}
                          </span>
                        </span>
                        {isSelected && <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-600" />}
                      </span>
                      <span className="mt-3 flex gap-1.5">
                        {preset.swatches.map((swatch) => (
                          <span
                            key={swatch}
                            className="h-6 w-6 rounded-full border border-white shadow ring-1 ring-slate-200"
                            style={{ backgroundColor: swatch }}
                          />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Typography
              </span>
              <div className="grid grid-cols-1 gap-2">
                {FONT_STYLE_PRESETS.map((preset) => {
                  const isSelected = draft.settings.fontPairing === preset.value;

                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onFocus={() => focusPreviewSection('style')}
                      onClick={() => {
                        focusPreviewSection('style');
                        updateSettings('fontPairing', preset.value);
                      }}
                      aria-pressed={isSelected}
                      className={`rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? 'border-[#FED362] bg-amber-50/70 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/30'
                      }`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span className={`block text-lg font-semibold text-slate-950 ${preset.sampleClass}`}>
                            Aa
                          </span>
                          <span className="mt-1 block text-sm font-bold text-slate-950">
                            {preset.label}
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                            {preset.description}
                          </span>
                        </span>
                        {isSelected && <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-600" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Spacing
              </span>
              <div className="grid grid-cols-1 gap-2">
                {SPACING_STYLE_PRESETS.map((preset) => {
                  const isSelected = draft.settings.spacing === preset.value;

                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onFocus={() => focusPreviewSection('style')}
                      onClick={() => {
                        focusPreviewSection('style');
                        updateSettings('spacing', preset.value);
                      }}
                      aria-pressed={isSelected}
                      className={`rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? 'border-[#FED362] bg-amber-50/70 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/30'
                      }`}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span>
                          <span className="block text-sm font-bold text-slate-950">
                            {preset.label}
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                            {preset.description}
                          </span>
                        </span>
                        <span className="flex h-10 w-12 shrink-0 flex-col justify-center gap-1 rounded-lg bg-slate-50 px-2">
                          <span className={`h-1 rounded-full bg-slate-300 ${preset.value === 'spacious' ? 'w-full' : 'w-8'}`} />
                          <span className={`h-1 rounded-full bg-slate-300 ${preset.value === 'spacious' ? 'w-9' : 'w-6'}`} />
                          <span className={`h-1 rounded-full bg-slate-300 ${preset.value === 'spacious' ? 'w-11' : 'w-7'}`} />
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const resolveBackendTemplateIdForSave = async () => {
    const routeAliases = new Set(
      [templateRoute.id, templateRoute.title, templateRoute.categoryKey]
        .map(normalizeTemplateLookupValue)
        .filter(Boolean)
    );
    const directTemplateId = backendTemplateId.trim();

    if (directTemplateId && !routeAliases.has(normalizeTemplateLookupValue(directTemplateId))) {
      return directTemplateId;
    }

    setSaveMessage('Finding backend template record...');

    const backendTemplates = await authService.getBiographyTemplates();
    const matchedTemplate = backendTemplates.find((template: BiographyTemplate) => {
      const candidates = [
        template.templateId,
        template.layoutKey,
        template.name,
        template.category,
      ].map(normalizeTemplateLookupValue);

      return candidates.some((candidate) => candidate && routeAliases.has(candidate));
    });

    if (!matchedTemplate?.templateId) {
      throw new Error(
        `Unable to find the backend template record for ${templateRoute.title}. Please open the template from the dashboard after templates load, or ask backend to seed this template.`
      );
    }

    return matchedTemplate.templateId;
  };

  const handleSave = async (): Promise<string | null> => {
    saveDraft(templateRoute.id, draft, activeWebsiteId);

    setIsSaving(true);
    setSaveMessage('Saving...');

    try {
      const hasActiveSession = await authService.ensureAuthSessionFromOpenTabs();

      if (!hasActiveSession) {
        throw new Error('No active session found for this editor tab. Open the editor from the dashboard again or log in.');
      }

      if (activeWebsiteId && !activeWebsiteId.startsWith('local-')) {
        setSaveMessage('Saving biography content to database...');
        await syncBiographySectionsToBackend(activeWebsiteId);
        saveDraft(templateRoute.id, draft, activeWebsiteId);
        notifyBiographyListChanged();
        setSaveMessage('Saved to database and My Biographies');
        return activeWebsiteId;
      }

      const previousLocalWebsiteId = activeWebsiteId?.startsWith('local-') ? activeWebsiteId : '';

      setSaveMessage(
        previousLocalWebsiteId
          ? 'Creating backend biography record from local draft...'
          : 'Creating biography record in database...'
      );

      const resolvedBackendTemplateId = await resolveBackendTemplateIdForSave();
      const savedWebsite = await authService.createBackendBiographyWebsite({
        title: getBiographyTitle(draft, templateRoute.title),
        templateId: resolvedBackendTemplateId,
        subjectType: getSubjectType(draft.settings.subjectType || searchParams.get('subjectType') || website?.subjectType),
      });

      setWebsite(savedWebsite);
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set('websiteId', savedWebsite.id);
      nextSearchParams.set('apiTemplateId', resolvedBackendTemplateId);
      setSearchParams(nextSearchParams, { replace: true });

      saveDraft(templateRoute.id, draft, savedWebsite.id);
      removeTemplateDraft(templateRoute.id);

      if (previousLocalWebsiteId) {
        removeDraft(templateRoute.id, previousLocalWebsiteId);
        authService.removeLocalBiographyWebsite(previousLocalWebsiteId);
      }

      setSaveMessage('Created biography. Saving content to database...');
      await syncBiographySectionsToBackend(savedWebsite.id);
      saveDraft(templateRoute.id, draft, savedWebsite.id);

      notifyBiographyListChanged();
      setSaveMessage('Saved to database and My Biographies');
      return savedWebsite.id;
    } catch (err: any) {
      setSaveMessage(err?.message || 'Unable to save biography to database');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenPublishChecklist = () => {
    setIsPublishChecklistOpen(true);
  };

  const handleProceedToPayment = async () => {
    if (!isPublishReady) {
      return;
    }

    const savedWebsiteId = await handleSave();
    const paymentWebsiteId = savedWebsiteId || activeWebsiteId || website?.id || '';
    const editorUrl = new URL(`/diy-dashboard/templates/${templateRoute.id}/edit`, window.location.origin);
    const paymentUrl = new URL('/payment', window.location.origin);

    if (paymentWebsiteId) {
      editorUrl.searchParams.set('websiteId', paymentWebsiteId);
      paymentUrl.searchParams.set('websiteId', paymentWebsiteId);
    }

    if (backendTemplateId) {
      editorUrl.searchParams.set('apiTemplateId', backendTemplateId);
    }

    paymentUrl.searchParams.set('templateId', templateRoute.id);
    paymentUrl.searchParams.set('title', getBiographyTitle(draft, templateRoute.title));
    paymentUrl.searchParams.set('returnTo', `${editorUrl.pathname}${editorUrl.search}`);

    setIsPublishChecklistOpen(false);
    setSaveMessage('Draft saved. Continue payment to publish');
    navigate(`${paymentUrl.pathname}${paymentUrl.search}`);
  };

  const handleReset = () => {
    const originalDraft = cloneTemplateData(templateRoute.categoryKey);
    removeDraft(templateRoute.id, activeWebsiteId);
    setDraft(originalDraft);
    setSaveMessage('Reset to original');
  };

  const renderEditorPanel = (variant: 'desktop' | 'mobile' = 'desktop') => {
    const selectedSection = activeEditorSection
      ? editorSections.find((section) => section.key === activeEditorSection)
      : null;
    const Icon = selectedSection?.icon || Sparkles;

    return (
      <section className="space-y-5">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-[#B18625]" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {variant === 'mobile' && selectedSection ? selectedSection.label : 'Section Editor'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {variant === 'mobile'
                  ? selectedSection
                    ? 'Edit this section, then tap Done to return to the preview.'
                    : 'Close this panel, then tap a biography section to select it.'
                  : 'Click any section in the live preview to edit it here.'}
              </p>
            </div>
          </div>
          {variant === 'mobile' && (
            <button
              type="button"
              onClick={() => setIsMobileEditorOpen(false)}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
              aria-label="Close editor"
            >
              Done
            </button>
          )}
        </div>

        {sectionLoadMessage && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
            <p className="font-bold text-slate-800">{sectionLoadMessage}</p>
            {websiteSections.length > 0 && (
              <p className="mt-1 line-clamp-2">
                {websiteSections.map((section) => section.title).join(', ')}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-700">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <ImageIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                  Media Assets
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Uploaded image metadata for this biography.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadMediaAssets}
              disabled={isLoadingMediaAssets || !activeWebsiteId || activeWebsiteId.startsWith('local-')}
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingMediaAssets ? 'Loading' : 'Refresh'}
            </button>
          </div>

          {mediaAssetsMessage && (
            <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600">
              {mediaAssetsMessage}
            </p>
          )}

          {mediaAssets.length > 0 && (
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {mediaAssets.slice(0, 8).map((asset) => (
                <article
                  key={asset.mediaAssetId}
                  className="space-y-1.5 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {asset.originalFilename || 'Untitled media'}
                      </p>
                      <p className="truncate text-[10px] font-mono text-slate-500">
                        {asset.mediaAssetId}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">
                        {asset.usageType || 'MEDIA'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteMediaAsset(asset.mediaAssetId)}
                        disabled={deletingMediaAssetId === asset.mediaAssetId}
                        className="inline-flex items-center gap-1 rounded-md border border-rose-100 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={`Delete ${asset.originalFilename || 'media asset'}`}
                      >
                        <Trash2 className="h-3 w-3" />
                        {deletingMediaAssetId === asset.mediaAssetId
                          ? 'Deleting'
                          : pendingDeleteMediaAssetId === asset.mediaAssetId
                            ? 'Confirm'
                            : 'Delete'}
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {asset.mimeType || 'Unknown type'} - {formatMediaFileSize(asset.fileSize)}
                    {asset.width && asset.height ? ` - ${asset.width}x${asset.height}` : ''}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    accessUrl is not returned by list media. Use the access-url endpoint before rendering old assets.
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>

        {activeEditorSection && selectedSection ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-xl border border-[#FED362] bg-[#FED362]/15 px-3 py-3 text-left text-slate-950 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#FED362] bg-white text-[#B18625]">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold uppercase tracking-wide">
                  {selectedSection.label}
                </span>
                <span className="block truncate text-[11px] text-slate-500">
                  {selectedSection.description}
                </span>
              </span>
            </div>

            {sectionDetailMessage && (
              <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 px-3 py-3 text-xs text-slate-700">
                <p className="font-bold text-slate-900">{sectionDetailMessage}</p>
                {activeBackendSection && (
                  <div className="mt-1 space-y-1">
                    <p>
                      <span className="font-semibold">Section ID:</span> {activeBackendSection.id}
                    </p>
                    {activeBackendSection.description && (
                      <p className="line-clamp-2">{activeBackendSection.description}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentBackendSection && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-700">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                    Backend Settings
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Controls section visibility and display order from the backend.
                  </p>
                </div>

                <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="font-semibold text-slate-800">Visible</span>
                  <input
                    type="checkbox"
                    checked={currentBackendSection.isVisible ?? true}
                    disabled={isUpdatingSectionSettings}
                    onChange={(event) =>
                      handleUpdateSectionSettings({ isVisible: event.currentTarget.checked })
                    }
                    className="h-4 w-4 accent-[#B18625]"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="font-semibold text-slate-800">Sort order</span>
                  <input
                    key={`${currentBackendSection.id}-${currentBackendSection.sortOrder ?? currentBackendSection.order ?? 1}`}
                    type="number"
                    min={1}
                    defaultValue={currentBackendSection.sortOrder ?? currentBackendSection.order ?? 1}
                    disabled={isUpdatingSectionSettings}
                    onBlur={(event) => {
                      const nextSortOrder = Number(event.currentTarget.value);
                      const currentSortOrder =
                        currentBackendSection.sortOrder ?? currentBackendSection.order ?? 1;

                      if (Number.isFinite(nextSortOrder) && nextSortOrder !== currentSortOrder) {
                        handleUpdateSectionSettings({ sortOrder: nextSortOrder });
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.currentTarget.blur();
                      }
                    }}
                    className={inputClass}
                  />
                </label>

                {activeEditorSection === 'hero' && (
                  <button
                    type="button"
                    onClick={handleUpdateHeroSection}
                    disabled={
                      isUpdatingHeroSection ||
                      isUpdatingSectionSettings ||
                      isDeletingSection ||
                      isCreatingHeroSection
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isUpdatingHeroSection ? 'Updating Hero' : 'Update Hero Content'}
                  </button>
                )}

                {activeEditorSection === 'about' && (
                  <button
                    type="button"
                    onClick={handleUpdateChronicleSection}
                    disabled={
                      isUpdatingChronicleSection ||
                      isUpdatingSectionSettings ||
                      isDeletingSection ||
                      isCreatingChronicleSection
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isUpdatingChronicleSection ? 'Updating Chronicle' : 'Update Chronicle Content'}
                  </button>
                )}

                {activeEditorSection === 'pursuits' && (
                  <button
                    type="button"
                    onClick={handleUpdatePursuitsSection}
                    disabled={
                      isUpdatingPursuitsSection ||
                      isUpdatingSectionSettings ||
                      isDeletingSection ||
                      isCreatingPursuitsSection
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isUpdatingPursuitsSection ? 'Updating Pursuits' : 'Update Pursuits Content'}
                  </button>
                )}

                {activeEditorSection === 'timeline' && (
                  <button
                    type="button"
                    onClick={handleUpdateTimelineSection}
                    disabled={
                      isUpdatingTimelineSection ||
                      isUpdatingSectionSettings ||
                      isDeletingSection ||
                      isCreatingTimelineSection
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isUpdatingTimelineSection ? 'Updating Timeline' : 'Update Timeline Content'}
                  </button>
                )}

                {activeEditorSection === 'gallery' && (
                  <button
                    type="button"
                    onClick={handleUpdateGallerySection}
                    disabled={
                      isUpdatingGallerySection ||
                      isUpdatingSectionSettings ||
                      isDeletingSection ||
                      isCreatingGallerySection
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isUpdatingGallerySection ? 'Updating Gallery' : 'Update Gallery Content'}
                  </button>
                )}

                {activeEditorSection === 'contact' && (
                  <button
                    type="button"
                    onClick={handleUpdateContactSection}
                    disabled={
                      isUpdatingContactSection ||
                      isUpdatingSectionSettings ||
                      isDeletingSection ||
                      isCreatingContactSection
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isUpdatingContactSection ? 'Updating Contact' : 'Update Contact Content'}
                  </button>
                )}

                <div className="border-t border-slate-100 pt-3">
                  {pendingDeleteSectionId === currentBackendSection.id ? (
                    <div className="space-y-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-3">
                      <p className="text-[11px] font-semibold text-rose-700">
                        Confirm backend section deletion.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPendingDeleteSectionId(null)}
                          disabled={isDeletingSection}
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-600 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteBackendSection}
                          disabled={isDeletingSection}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {isDeletingSection ? 'Deleting' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDeleteBackendSection}
                      disabled={isUpdatingSectionSettings || isDeletingSection}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Section
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeEditorSection === 'contact' && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Mail className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                        Contact Messages
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Messages submitted through the public contact form.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={loadContactMessages}
                    disabled={isLoadingContactMessages || !activeWebsiteId || activeWebsiteId.startsWith('local-')}
                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoadingContactMessages ? 'Loading' : 'Refresh'}
                  </button>
                </div>

                {contactMessagesMessage && (
                  <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600">
                    {contactMessagesMessage}
                  </p>
                )}

                {contactMessages.length > 0 && (
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {contactMessages.map((message) => (
                      <article
                        key={message.id}
                        className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-900">
                              {message.senderName || 'Unnamed sender'}
                            </p>
                            <p className="truncate text-[11px] text-slate-500">
                              {message.senderEmail || 'No email'}
                            </p>
                          </div>
                          <div className="shrink-0 space-y-1 text-right">
                            <span className="block text-[10px] font-semibold text-slate-400">
                              {formatContactMessageDate(message.createdAt)}
                            </span>
                            {message.status && (
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                                message.status.toUpperCase() === 'READ'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}>
                                {message.status}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                            <MessageSquare className="h-3.5 w-3.5 text-[#B18625]" />
                            {message.subject || 'No subject'}
                          </p>
                          <p className="line-clamp-4 whitespace-pre-line text-[11px] leading-relaxed text-slate-600">
                            {message.message}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {message.status?.toUpperCase() !== 'READ' && (
                            <button
                              type="button"
                              onClick={() => handleMarkContactMessageRead(message.id)}
                              disabled={
                                updatingContactMessageId === message.id ||
                                deletingContactMessageId === message.id
                              }
                              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-600 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {updatingContactMessageId === message.id ? 'Updating' : 'Mark Read'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteContactMessage(message.id)}
                            disabled={
                              deletingContactMessageId === message.id ||
                              updatingContactMessageId === message.id
                            }
                            className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              pendingDeleteContactMessageId === message.id
                                ? 'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'border-rose-200 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50'
                            } ${
                              message.status?.toUpperCase() === 'READ' ? 'sm:col-span-2' : ''
                            }`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {deletingContactMessageId === message.id
                              ? 'Deleting'
                              : pendingDeleteContactMessageId === message.id
                                ? 'Confirm Delete'
                                : 'Delete'}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeEditorSection === 'hero' && !currentBackendSection && (
              <div className="space-y-3 rounded-xl border border-[#FED362]/70 bg-[#FFF7DC] px-3 py-3 text-xs text-slate-700">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                    Backend Hero Section
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Create the Hero section record using the current hero content.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateHeroSection}
                  disabled={isCreatingHeroSection || !activeWebsiteId || activeWebsiteId.startsWith('local-')}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-black px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingHeroSection ? 'Creating Hero' : 'Create Hero Section'}
                </button>
                {(!activeWebsiteId || activeWebsiteId.startsWith('local-')) && (
                  <p className="text-[11px] text-slate-500">
                    Save the biography first so the backend has a website ID.
                  </p>
                )}
              </div>
            )}

            {activeEditorSection === 'about' && !currentBackendSection && (
              <div className="space-y-3 rounded-xl border border-[#FED362]/70 bg-[#FFF7DC] px-3 py-3 text-xs text-slate-700">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                    Backend Chronicle Section
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Create the Chronicle section record using the current About content.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateChronicleSection}
                  disabled={isCreatingChronicleSection || !activeWebsiteId || activeWebsiteId.startsWith('local-')}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-black px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingChronicleSection ? 'Creating Chronicle' : 'Create Chronicle Section'}
                </button>
                {(!activeWebsiteId || activeWebsiteId.startsWith('local-')) && (
                  <p className="text-[11px] text-slate-500">
                    Save the biography first so the backend has a website ID.
                  </p>
                )}
              </div>
            )}

            {activeEditorSection === 'pursuits' && !currentBackendSection && (
              <div className="space-y-3 rounded-xl border border-[#FED362]/70 bg-[#FFF7DC] px-3 py-3 text-xs text-slate-700">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                    Backend Pursuits Section
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Create the Pursuits section record using the current Hobbies / Interests content.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCreatePursuitsSection}
                  disabled={isCreatingPursuitsSection || !activeWebsiteId || activeWebsiteId.startsWith('local-')}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-black px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingPursuitsSection ? 'Creating Pursuits' : 'Create Pursuits Section'}
                </button>
                {(!activeWebsiteId || activeWebsiteId.startsWith('local-')) && (
                  <p className="text-[11px] text-slate-500">
                    Save the biography first so the backend has a website ID.
                  </p>
                )}
              </div>
            )}

            {activeEditorSection === 'timeline' && !currentBackendSection && (
              <div className="space-y-3 rounded-xl border border-[#FED362]/70 bg-[#FFF7DC] px-3 py-3 text-xs text-slate-700">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                    Backend Timeline Section
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Create the Timeline section record using the current Life Journey milestones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateTimelineSection}
                  disabled={isCreatingTimelineSection || !activeWebsiteId || activeWebsiteId.startsWith('local-')}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-black px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingTimelineSection ? 'Creating Timeline' : 'Create Timeline Section'}
                </button>
                {(!activeWebsiteId || activeWebsiteId.startsWith('local-')) && (
                  <p className="text-[11px] text-slate-500">
                    Save the biography first so the backend has a website ID.
                  </p>
                )}
              </div>
            )}

            {activeEditorSection === 'gallery' && !currentBackendSection && (
              <div className="space-y-3 rounded-xl border border-[#FED362]/70 bg-[#FFF7DC] px-3 py-3 text-xs text-slate-700">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                    Backend Gallery Section
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Create the Gallery section record using the current media gallery items.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateGallerySection}
                  disabled={isCreatingGallerySection || !activeWebsiteId || activeWebsiteId.startsWith('local-')}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-black px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingGallerySection ? 'Creating Gallery' : 'Create Gallery Section'}
                </button>
                {(!activeWebsiteId || activeWebsiteId.startsWith('local-')) && (
                  <p className="text-[11px] text-slate-500">
                    Save the biography first so the backend has a website ID.
                  </p>
                )}
              </div>
            )}

            {activeEditorSection === 'contact' && !currentBackendSection && (
              <div className="space-y-3 rounded-xl border border-[#FED362]/70 bg-[#FFF7DC] px-3 py-3 text-xs text-slate-700">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                    Backend Contact Section
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Create the Contact section record using the current contact details and form settings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateContactSection}
                  disabled={isCreatingContactSection || !activeWebsiteId || activeWebsiteId.startsWith('local-')}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-black px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingContactSection ? 'Creating Contact' : 'Create Contact Section'}
                </button>
                {(!activeWebsiteId || activeWebsiteId.startsWith('local-')) && (
                  <p className="text-[11px] text-slate-500">
                    Save the biography first so the backend has a website ID.
                  </p>
                )}
              </div>
            )}

            <div className="border-t border-slate-100 pt-5">
              <div className="mb-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                  Editing
                </p>
                <h3 className="text-lg font-bold text-slate-950">
                  {selectedSection.label}
                </h3>
              </div>

              {renderSectionEditor()}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <Sparkles className="mx-auto h-5 w-5 text-[#B18625]" />
            <h3 className="mt-3 text-sm font-bold text-slate-900">
              No Section Selected
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Click the Hero, Chronicle, Pursuits, Life Journey, Gallery, Stories, or Contact area in the live preview.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleOpenStyleEditor}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:border-[#FED362] hover:text-slate-950"
        >
          <Palette className="h-4 w-4 text-[#B18625]" />
          Edit Template Style
        </button>
      </section>
    );
  };

  const renderSidebarNavigation = () => (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <div className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Sections
        </div>
        <nav className="space-y-1">
          {sidebarSectionItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSidebarItem
              ? activeSidebarItem === item.navKey
              : activeEditorSection === item.section;

            return (
              <button
                key={item.navKey}
                type="button"
                onClick={() => handleSidebarSectionSelect(item.navKey, item.section)}
                className={`group flex w-full items-center gap-3 rounded-lg border-l-2 px-4 py-3 text-left text-sm transition ${
                  isActive
                    ? 'border-orange-600 bg-orange-50 text-slate-950 shadow-sm'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-orange-700' : 'text-slate-500'}`} />
                <span className="truncate font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="my-5 h-px bg-slate-200" />
        <div className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Tools
        </div>
        <div className="space-y-1">
          <button
            type="button"
            onClick={handleOpenAiWriting}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition ${
              activeSidebarItem === 'ai-writing'
                ? 'bg-slate-100 text-slate-950'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
          >
            <Sparkles className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="truncate font-medium">AI Writing</span>
          </button>
          <button
            type="button"
            onClick={handleOpenMediaLibrary}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition ${
              activeSidebarItem === 'media-library'
                ? 'bg-slate-100 text-slate-950'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
          >
            <ImageIcon className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="truncate font-medium">Media Library</span>
          </button>
        </div>

        <div className="my-5 h-px bg-slate-200" />
        <div className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Settings
        </div>
        <div className="space-y-1">
          <button
            type="button"
            onClick={handleOpenStyleEditor}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition ${
              activeSidebarItem === 'style'
                ? 'bg-slate-100 text-slate-950'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
          >
            <Palette className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="truncate font-medium">Template Style</span>
          </button>
          <button
            type="button"
            onClick={handleOpenGeneralSettings}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition ${
              activeSidebarItem === 'general-settings'
                ? 'bg-slate-100 text-slate-950'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
          >
            <Settings className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="truncate font-medium">General Settings</span>
          </button>
        </div>
      </div>

      <div className="border-t border-slate-200 p-5">
        <button
          type="button"
          onClick={handleEnterPreviewMode}
          className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-indigo-800 transition hover:border-indigo-200 hover:bg-indigo-50"
        >
          <span>View Published Site</span>
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderTemplateStylePanel = () => (
    <section className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[#B18625]">
            <Palette className="h-5 w-5" />
          </span>
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
              Template Style
            </p>
            <h2 className="text-base font-bold text-slate-950">Design Presets</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveSidebarItem(null)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-900 hover:text-slate-900"
          aria-label="Close template style panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {renderSectionEditor()}
      </div>
    </section>
  );

  const renderAiWritingPanel = (variant: 'desktop' | 'mobile' = 'desktop') => {
    const targets = getAiWritingTargets();
    const selectedTarget = getSelectedAiWritingTarget();
    const selectedAction = AI_WRITING_ACTIONS.find((action) => action.value === aiWritingAction);
    const selectedTargetHasText = selectedTarget ? hasText(selectedTarget.value) : false;
    const hasAiWritingInstruction = hasText(aiWritingInstructions);
    const canRequestAiWriting =
      Boolean(selectedTarget) &&
      !isGeneratingAiWriting &&
      (aiWritingAction === 'generate'
        ? selectedTargetHasText || hasAiWritingInstruction
        : selectedTargetHasText);

    return (
      <section className={variant === 'mobile' ? 'bg-white' : 'flex h-full min-h-0 flex-col bg-white'}>
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                Tools
              </p>
              <h2 className="text-base font-bold text-slate-950">AI Writing Assistant</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {variant === 'mobile'
                  ? 'Generate, rewrite, improve, or expand the selected writing target.'
                  : 'Generate writing suggestions for the selected biography field.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (variant === 'mobile') {
                setIsMobileAiWritingOpen(false);
                return;
              }

              setActiveSidebarItem(null);
            }}
            className={
              variant === 'mobile'
                ? 'inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600 transition hover:border-slate-900 hover:text-slate-900'
                : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-900 hover:text-slate-900'
            }
            aria-label="Close AI writing assistant"
          >
            {variant === 'mobile' ? 'Done' : <X className="h-4 w-4" />}
          </button>
        </div>

        <div
          className={
            variant === 'mobile'
              ? 'space-y-5 px-5 py-5'
              : 'min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5'
          }
        >
          <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-500">Writing target</span>
              <select
                value={selectedTarget?.id || ''}
                onChange={(event) => {
                  setAiWritingTargetId(event.currentTarget.value);
                  setAiWritingResult('');
                  setAiWritingMessage('');
                }}
                className={inputClass}
              >
                {targets.map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.label}
                  </option>
                ))}
              </select>
            </label>

            {selectedTarget && (
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-500">Your content</span>
                <textarea
                  rows={6}
                  value={selectedTarget.value}
                  onChange={(event) => {
                    selectedTarget.onReplace(event.currentTarget.value);
                    setAiWritingResult('');
                    setAiWritingMessage('Content updated');
                  }}
                  className={`${inputClass} resize-y leading-relaxed`}
                />
              </label>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Writing action</p>
              {selectedAction && (
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {selectedAction.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {AI_WRITING_ACTIONS.map((action) => {
                const isActive = aiWritingAction === action.value;

                return (
                  <button
                    key={action.value}
                    type="button"
                    onClick={() => {
                      setAiWritingAction(action.value);
                      setAiWritingResult('');
                      setAiWritingMessage('');
                    }}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      isActive
                        ? 'border-[#FED362] bg-amber-50 text-slate-950 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-50/30'
                    }`}
                  >
                    <span className="block text-xs font-bold">{action.label}</span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-slate-500">
                      {action.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-500">Additional instructions</span>
            <textarea
              rows={3}
              value={aiWritingInstructions}
              onChange={(event) => setAiWritingInstructions(event.currentTarget.value)}
              className={`${inputClass} resize-y leading-relaxed`}
              placeholder="e.g. Make it warmer, more personal, or shorter."
            />
          </label>

          <button
            type="button"
            onClick={() => void handleGenerateAiWriting()}
            disabled={!canRequestAiWriting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <WandSparkles className="h-4 w-4" />
            {isGeneratingAiWriting ? 'Generating' : 'Create Suggestion'}
          </button>

          {aiWritingMessage && (
            <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              {aiWritingMessage}
            </p>
          )}

          {aiWritingResult && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">AI result</p>
                <span className="text-[10px] font-semibold text-slate-400">
                  Review before applying
                </span>
              </div>
              <textarea
                rows={7}
                value={aiWritingResult}
                onChange={(event) => setAiWritingResult(event.currentTarget.value)}
                className={`${inputClass} resize-y bg-indigo-50/30 leading-relaxed`}
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyAiWriting('replace')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-slate-800"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyAiWriting('insert')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:border-slate-900 hover:text-slate-950"
                >
                  Insert Below
                </button>
                <button
                  type="button"
                  onClick={() => void handleGenerateAiWriting()}
                  disabled={!canRequestAiWriting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:border-slate-900 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGeneratingAiWriting ? 'Generating' : 'Regenerate'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAiWritingResult('');
                    setAiWritingMessage('Suggestion discarded');
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-500 transition hover:border-rose-200 hover:text-rose-600"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
            Saved biographies use the backend AI Writing endpoint. Unsaved local drafts use a local fallback.
          </p>
        </div>
      </section>
    );
  };

  const renderSettingsToggle = ({
    label,
    description,
    checked,
    onChange,
    disabled = false,
  }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }) => (
    <label
      className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3 transition ${
        disabled
          ? 'border-slate-100 bg-slate-50 text-slate-400'
          : 'border-slate-200 bg-white text-slate-900 hover:border-amber-200'
      }`}
    >
      <span>
        <span className="block text-sm font-bold">{label}</span>
        <span className="mt-1 block text-xs leading-relaxed text-slate-500">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[#B18625] disabled:cursor-not-allowed"
      />
    </label>
  );

  const renderGeneralSettingsPanel = () => {
    const subjectType = getSubjectType(
      draft.settings.subjectType || searchParams.get('subjectType') || website?.subjectType
    );
    const canEditBackendIdentity = !activeWebsiteId || activeWebsiteId.startsWith('local-');
    const siteTitleValue = draft.settings.siteTitle ?? website?.title ?? getBiographyTitle(draft, templateRoute.title);
    const showContactSection = draft.settings.showContactSection !== false;
    const showSocialLinks = draft.settings.showSocialLinks !== false;
    const allowContactMessages = draft.settings.allowContactMessages !== false;

    return (
      <section className="flex h-full min-h-0 flex-col bg-white">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Settings className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                Website
              </p>
              <h2 className="text-base font-bold text-slate-950">General Settings</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveSidebarItem(null)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-900 hover:text-slate-900"
            aria-label="Close general settings panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                Identity
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Controls how this biography is identified in the dashboard.
              </p>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-500">Biography title</span>
              <input
                type="text"
                value={siteTitleValue}
                disabled={!canEditBackendIdentity}
                onChange={(event) => updateSettings('siteTitle', event.currentTarget.value)}
                className={inputClass}
                placeholder="e.g. My Life Story"
              />
              <span className="block text-[11px] leading-relaxed text-slate-500">
                {canEditBackendIdentity
                  ? 'Used when this biography is first saved to My Biographies.'
                  : 'Read-only for saved backend biographies until the website update endpoint is available.'}
              </span>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-500">Subject type</span>
              <select
                value={subjectType}
                disabled={!canEditBackendIdentity}
                onChange={(event) => updateSettings('subjectType', getSubjectType(event.currentTarget.value))}
                className={inputClass}
              >
                {SUBJECT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {SUBJECT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                Backend Info
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Metadata returned by the biography website endpoint.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <span className="block font-bold text-slate-500">Status</span>
                <span className="mt-0.5 block text-sm font-semibold text-slate-900">
                  {website?.status || 'Unsaved draft'}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <span className="block font-bold text-slate-500">Subdomain</span>
                <span className="mt-0.5 block break-all text-sm font-semibold text-slate-900">
                  {website?.subdomain || 'No subdomain yet'}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <span className="block font-bold text-slate-500">Website ID</span>
                <span className="mt-0.5 block break-all text-[11px] font-semibold text-slate-700">
                  {activeWebsiteId || 'Created after Save Draft'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                Public Contact
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Controls the Contact section in the live preview and saved draft.
              </p>
            </div>

            {renderSettingsToggle({
              label: 'Show contact section',
              description: 'Display the Contact section and Send Message links.',
              checked: showContactSection,
              onChange: (checked) => updateSettings('showContactSection', checked),
            })}
            {renderSettingsToggle({
              label: 'Show social links',
              description: 'Display Instagram, X, Facebook, and LinkedIn rows.',
              checked: showSocialLinks,
              disabled: !showContactSection,
              onChange: (checked) => updateSettings('showSocialLinks', checked),
            })}
            {renderSettingsToggle({
              label: 'Allow contact messages',
              description: 'Display the public message form inside Contact.',
              checked: allowContactMessages,
              disabled: !showContactSection,
              onChange: (checked) => updateSettings('allowContactMessages', checked),
            })}

            <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
              Contact visibility syncs with the section settings when you save. Message-form availability is currently a template setting until backend adds a dedicated field.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-rose-600">
                Danger Zone
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Delete biography will be enabled only after backend provides DELETE /api/websites/{'{websiteId}'}.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-100 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wide text-rose-300 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              Delete Biography Unavailable
            </button>
          </div>
        </div>
      </section>
    );
  };

  const renderMediaLibraryPanel = (variant: 'desktop' | 'mobile' = 'desktop') => (
    <section className={variant === 'mobile' ? 'bg-white' : 'flex h-full min-h-0 flex-col bg-white'}>
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Tools
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">Media Library</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {activeImageTarget
                ? `Replacing ${getImageTargetLabel(activeImageTarget)}. Choose an existing image or upload a new one.`
                : 'Store reusable images for this biography.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveImageTarget(null);
              if (variant === 'mobile') {
                setIsMobileMediaLibraryOpen(false);
                return;
              }

              setActiveSidebarItem(null);
            }}
            className={
              variant === 'mobile'
                ? 'inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600 transition hover:border-slate-900 hover:text-slate-900'
                : 'rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700'
            }
            aria-label="Close media library"
          >
            {variant === 'mobile' ? 'Done' : <X className="h-4 w-4" />}
          </button>
        </div>

        <input
          ref={mediaLibraryInputRef}
          type="file"
          accept={IMAGE_UPLOAD_ACCEPT}
          multiple
          onChange={handleUploadMediaLibraryFiles}
          className="sr-only"
        />

        <button
          type="button"
          onClick={() => mediaLibraryInputRef.current?.click()}
          disabled={isLoadingMediaAssets}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700 transition hover:border-slate-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UploadCloud className="h-4 w-4" />
          {activeImageTarget ? 'Upload Replacement Image' : 'Upload Images'}
        </button>
      </div>

      <div className={variant === 'mobile' ? 'px-5 py-4' : 'min-h-0 flex-1 overflow-y-auto px-5 py-4'}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Library
          </p>
          <button
            type="button"
            onClick={loadMediaAssets}
            disabled={isLoadingMediaAssets}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingMediaAssets ? 'Loading' : 'Refresh'}
          </button>
        </div>

        {mediaAssetsMessage && (
          <p className="mb-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
            {mediaAssetsMessage}
          </p>
        )}

        {mediaAssets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <ImageIcon className="mx-auto h-7 w-7 text-slate-300" />
            <h3 className="mt-3 text-sm font-bold text-slate-900">No Images Yet</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Upload images here, then reuse them in Hero, Gallery, Stories, and Timeline.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {mediaAssets.map((asset) => {
              const canUseAsset = Boolean(asset.accessUrl);
              const isRecentlyUploaded = recentlyUploadedMediaAssetIds.includes(asset.mediaAssetId);

              return (
                <article
                  key={asset.mediaAssetId}
                  className={`overflow-hidden rounded-xl border bg-white shadow-sm transition ${
                    isRecentlyUploaded
                      ? 'border-amber-300 ring-2 ring-amber-100'
                      : 'border-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => canUseAsset && handleUseMediaAsset(asset)}
                    disabled={!canUseAsset}
                    className="block aspect-square w-full bg-slate-100 disabled:cursor-not-allowed"
                    title={canUseAsset ? (activeImageTarget ? 'Replace with this image' : 'Use this image') : 'Access URL unavailable'}
                  >
                    {asset.accessUrl ? (
                      <img
                        src={asset.accessUrl}
                        alt={asset.originalFilename || 'Media library image'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <ImageIcon className="h-7 w-7" />
                      </div>
                    )}
                  </button>

                  <div className="space-y-2 p-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="min-w-0 flex-1 truncate text-xs font-bold text-slate-900">
                          {asset.originalFilename || 'Untitled media'}
                        </p>
                        {isRecentlyUploaded && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-800">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[10px] text-slate-500">
                        {asset.mimeType || 'Image'} - {formatMediaFileSize(asset.fileSize)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleUseMediaAsset(asset)}
                        disabled={!canUseAsset}
                        className="rounded-lg bg-slate-950 px-2 py-2 text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {activeImageTarget ? 'Replace' : 'Use'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMediaAsset(asset.mediaAssetId)}
                        disabled={deletingMediaAssetId === asset.mediaAssetId}
                        className={`rounded-lg border px-2 py-2 text-[10px] font-bold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          pendingDeleteMediaAssetId === asset.mediaAssetId
                            ? 'border-rose-300 bg-rose-50 text-rose-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-600'
                        }`}
                      >
                        {deletingMediaAssetId === asset.mediaAssetId
                          ? 'Deleting'
                          : pendingDeleteMediaAssetId === asset.mediaAssetId
                            ? 'Confirm'
                            : 'Delete'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );

  const renderPublishChecklistGroup = (title: string, items: PublishChecklistItem[]) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
        <span className="text-xs font-semibold text-slate-500">
          {items.filter((item) => item.isComplete).length}/{items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item) => {
          const isMissingRequired = item.required && !item.isComplete;

          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                item.isComplete
                  ? 'border-emerald-100 bg-emerald-50/50'
                  : isMissingRequired
                    ? 'border-rose-100 bg-rose-50/60'
                    : 'border-amber-100 bg-amber-50/50'
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  item.isComplete
                    ? 'bg-emerald-100 text-emerald-700'
                    : isMissingRequired
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                }`}
              >
                {item.isComplete ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-slate-950">{item.label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">
                  {item.description}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPublishChecklistModal = () => {
    if (!isPublishChecklistOpen) {
      return null;
    }

    const completedRequiredCount = requiredPublishItems.filter((item) => item.isComplete).length;
    const completedRecommendedCount = recommendedPublishItems.filter((item) => item.isComplete).length;

    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6">
        <button
          type="button"
          onClick={() => setIsPublishChecklistOpen(false)}
          className="absolute inset-0 h-full w-full bg-slate-950/55 backdrop-blur-sm"
          aria-label="Close publish checklist"
        />
        <section className="relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Globe2 className="h-5 w-5" />
              </span>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                  Publish Review
                </p>
                <h2 className="text-lg font-bold text-slate-950">Publish Checklist</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Review required content before this biography moves toward publishing.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPublishChecklistOpen(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-900 hover:text-slate-900"
              aria-label="Close publish checklist"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div
              className={`rounded-2xl border px-4 py-4 ${
                isPublishReady
                  ? 'border-emerald-100 bg-emerald-50/60'
                  : 'border-amber-100 bg-amber-50/70'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">
                    {isPublishReady ? 'Ready for publish review' : 'Needs required fixes'}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Required: {completedRequiredCount}/{requiredPublishItems.length} complete.
                    {' '}Recommended: {completedRecommendedCount}/{recommendedPublishItems.length} complete.
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    isPublishReady
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isPublishReady ? 'Passed' : `${incompleteRequiredPublishItems.length} Missing`}
                </span>
              </div>
            </div>

            {renderPublishChecklistGroup('Required Before Publishing', requiredPublishItems)}
            {renderPublishChecklistGroup('Recommended Polish', recommendedPublishItems)}

            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
              Publishing starts after payment. When the checklist passes, continue to checkout so the draft can be prepared for launch.
            </p>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => setIsPublishChecklistOpen(false)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={() => void handleProceedToPayment()}
              disabled={!isPublishReady || isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Globe2 className="h-4 w-4" />
              Proceed to Payment
            </button>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f2ee] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="grid min-h-20 grid-cols-1 items-center gap-2 px-3 py-2 sm:px-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-3 lg:px-6 lg:py-3">
          <div className="flex min-w-0 items-center justify-between gap-3 lg:justify-start">
            <div className="flex min-w-0 items-center gap-2 lg:gap-3">
              <button
                type="button"
                onClick={() => navigate('/diy-dashboard')}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-900 hover:text-slate-900 lg:h-11 lg:w-11"
                title="Back to dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-slate-950 lg:text-lg">
                  {templateRoute.title}
                </h1>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500 lg:mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="truncate sm:hidden">{mobileSaveStatus}</span>
                  <span className="hidden truncate sm:inline">{saveMessage}</span>
                </div>
              </div>
            </div>

            <div className="relative lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileToolbarMenuOpen((isOpen) => !isOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
                aria-label="Open mobile editor menu"
                aria-expanded={isMobileToolbarMenuOpen}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {isMobileToolbarMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  <p className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Device Preview
                  </p>
                  <div className="space-y-1">
                    {PREVIEW_VIEWPORT_OPTIONS.map(({ value, label, icon: Icon }) => {
                      const isActive = previewViewport === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setPreviewViewport(value);
                            setIsMobileToolbarMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                            isActive
                              ? 'bg-slate-950 text-white'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                          }`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {label}
                          </span>
                          {isActive && <CheckCircle2 className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden items-center justify-start gap-2 lg:flex lg:justify-center">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 shadow-sm">
              {PREVIEW_VIEWPORT_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPreviewViewport(value)}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    previewViewport === value
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  aria-label={`${label} preview`}
                >
                  <Icon className="h-4 w-4" />
                  {value === 'desktop' && label}
                </button>
              ))}
            </div>

            <div className="hidden items-center gap-1 xl:flex">
              <button
                type="button"
                disabled
                className="rounded-lg p-2 text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Undo"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled
                className="rounded-lg p-2 text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Redo"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 items-center gap-2 lg:flex lg:flex-wrap lg:justify-end">
            <button
              type="button"
              onClick={isEditingMode ? handleEnterPreviewMode : handleEnterEditMode}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:gap-2 sm:text-sm lg:px-4 lg:py-2.5"
            >
              {isEditingMode ? <Eye className="h-4 w-4" /> : <PencilLine className="h-4 w-4" />}
              {isEditingMode ? 'Preview' : 'Edit'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:gap-2 sm:text-sm lg:px-4 lg:py-2.5"
            >
              <Save className="h-4 w-4" />
              <span className="hidden min-[360px]:inline">{isSaving ? 'Saving' : 'Save Draft'}</span>
              <span className="min-[360px]:hidden">{isSaving ? 'Saving' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={handleOpenPublishChecklist}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-2.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:gap-2 sm:text-sm lg:px-4 lg:py-2.5"
            >
              <Globe2 className="h-4 w-4" />
              Publish
            </button>
          </div>
        </div>
      </header>

      <main
        className={
          isEditingMode
            ? activeSidebarItem === 'ai-writing'
              ? 'grid min-h-[calc(100vh-81px)] grid-cols-1 lg:grid-cols-[264px_minmax(0,1fr)_360px]'
              : activeSidebarItem === 'media-library' || activeSidebarItem === 'style' || activeSidebarItem === 'general-settings'
              ? 'grid min-h-[calc(100vh-81px)] grid-cols-1 lg:grid-cols-[264px_360px_minmax(0,1fr)]'
              : 'grid min-h-[calc(100vh-81px)] grid-cols-1 lg:grid-cols-[264px_minmax(0,1fr)]'
            : 'min-h-[calc(100vh-81px)]'
        }
      >
        {isEditingMode && (
          <aside className="hidden border-r border-slate-200 bg-white lg:block">
            <div className="sticky top-[81px] h-[calc(100vh-81px)]">
              {renderSidebarNavigation()}
            </div>
          </aside>
        )}

        {isEditingMode && activeSidebarItem === 'media-library' && (
          <aside className="hidden border-r border-slate-200 bg-white lg:block">
            <div className="sticky top-[81px] h-[calc(100vh-81px)]">
              {renderMediaLibraryPanel()}
            </div>
          </aside>
        )}

        {isEditingMode && activeSidebarItem === 'style' && (
          <aside className="hidden border-r border-slate-200 bg-white lg:block">
            <div className="sticky top-[81px] h-[calc(100vh-81px)]">
              {renderTemplateStylePanel()}
            </div>
          </aside>
        )}

        {isEditingMode && activeSidebarItem === 'general-settings' && (
          <aside className="hidden border-r border-slate-200 bg-white lg:block">
            <div className="sticky top-[81px] h-[calc(100vh-81px)]">
              {renderGeneralSettingsPanel()}
            </div>
          </aside>
        )}

        <section className="min-w-0 bg-[#f5f2ee] px-3 py-4 sm:px-5 lg:px-6">
          <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
            <div className="min-w-0 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                <Type className="h-3.5 w-3.5" />
                {previewModeLabel}
              </span>
              {isEditingMode && (
                <span
                  className={`inline-flex max-w-full items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold shadow-sm ${
                    selectedMobileEditorSection
                      ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                      : 'bg-white text-slate-500'
                  }`}
                >
                  {selectedMobileEditorSection ? (
                    <>
                      <SelectedMobileEditorIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Selected: {selectedMobileEditorSection.label}</span>
                    </>
                  ) : (
                    <span>Tap a section to edit</span>
                  )}
                </span>
              )}
            </div>
            {isEditingMode && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600 transition hover:border-rose-300 hover:text-rose-600"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>

          {previewViewport !== 'desktop' ? (
            <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-200 px-3 py-6 shadow-sm sm:px-6 lg:px-8">
              <DevicePreviewFrame iframeRef={devicePreviewFrameRef} viewport={previewViewport}>
                <BiographyTemplateRenderer
                  templateId={templateRoute.id}
                  categoryKey={templateRoute.categoryKey}
                  dataOverride={draft}
                  activeEditSection={isEditingMode ? activeEditorSection : null}
                  onDataChange={isEditingMode ? handleDraftChange : undefined}
                  onEditSectionChange={isEditingMode ? handleEditSectionChange : undefined}
                  onImageChangeRequest={isEditingMode ? handleImageChangeRequest : undefined}
                  websiteId={activeWebsiteId}
                />
              </DevicePreviewFrame>
            </div>
          ) : (
            <div className="mx-auto max-w-[1060px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <BiographyTemplateRenderer
                templateId={templateRoute.id}
                categoryKey={templateRoute.categoryKey}
                dataOverride={draft}
                activeEditSection={isEditingMode ? activeEditorSection : null}
                onDataChange={isEditingMode ? handleDraftChange : undefined}
                onEditSectionChange={isEditingMode ? handleEditSectionChange : undefined}
                onImageChangeRequest={isEditingMode ? handleImageChangeRequest : undefined}
                websiteId={activeWebsiteId}
              />
            </div>
          )}
        </section>

        {isEditingMode && activeSidebarItem === 'ai-writing' && (
          <aside className="hidden border-l border-slate-200 bg-white lg:block">
            <div className="sticky top-[81px] h-[calc(100vh-81px)]">
              {renderAiWritingPanel()}
            </div>
          </aside>
        )}

      </main>

      {isEditingMode && !isMobileEditorOpen && !isMobileAiWritingOpen && !isMobileMediaLibraryOpen && selectedMobileEditorSection && (
        <div className="fixed inset-x-4 bottom-5 z-[70] flex justify-end lg:hidden">
          <div className="flex max-w-full flex-col items-end gap-2">
            <button
              type="button"
              onClick={handleOpenAiWriting}
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wide text-indigo-800 shadow-xl transition active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="truncate">AI Write</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileAiWritingOpen(false);
                setIsMobileEditorOpen(true);
              }}
              className="inline-flex max-w-full items-center gap-2 rounded-full bg-black px-5 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-xl transition active:scale-[0.98]"
            >
              <PencilLine className="h-4 w-4 shrink-0" />
              <span className="max-w-[230px] truncate">Edit {selectedMobileEditorSection.label}</span>
            </button>
          </div>
        </div>
      )}

      {isEditingMode && isMobileEditorOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileEditorOpen(false)}
            className="absolute inset-0 h-full w-full bg-slate-950/45 backdrop-blur-[2px]"
            aria-label="Close editor backdrop"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[84vh] overflow-y-auto rounded-t-[1.75rem] border border-slate-200 bg-white px-5 pb-8 pt-4 shadow-2xl">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
            {renderEditorPanel('mobile')}
          </div>
        </div>
      )}

      {isEditingMode && isMobileAiWritingOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileAiWritingOpen(false)}
            className="absolute inset-0 h-full w-full bg-slate-950/45 backdrop-blur-[2px]"
            aria-label="Close AI writing backdrop"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[1.75rem] border border-slate-200 bg-white pb-8 shadow-2xl">
            <div className="mx-auto mb-1 mt-4 h-1.5 w-12 rounded-full bg-slate-200" />
            {renderAiWritingPanel('mobile')}
          </div>
        </div>
      )}

      {isEditingMode && isMobileMediaLibraryOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <button
            type="button"
            onClick={() => {
              setActiveImageTarget(null);
              setIsMobileMediaLibraryOpen(false);
            }}
            className="absolute inset-0 h-full w-full bg-slate-950/45 backdrop-blur-[2px]"
            aria-label="Close media library backdrop"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[1.75rem] border border-slate-200 bg-white pb-8 shadow-2xl">
            <div className="mx-auto mb-1 mt-4 h-1.5 w-12 rounded-full bg-slate-200" />
            {renderMediaLibraryPanel('mobile')}
          </div>
        </div>
      )}

      {renderPublishChecklistModal()}
    </div>
  );
}
