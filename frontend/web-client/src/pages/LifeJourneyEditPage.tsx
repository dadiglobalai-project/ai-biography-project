import React, { useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Eye,
  Image as ImageIcon,
  Lock,
  Mail,
  MessageSquare,
  Monitor,
  Palette,
  PencilLine,
  RotateCcw,
  Save,
  Sparkles,
  Smartphone,
  Tablet,
  Trash2,
  Type,
  UserRound,
  X,
} from 'lucide-react';
import LifeJourneyTemplate from '../Templates/LifeJourney/LifeJourneyTemplate';
import {
  cloneTemplateData,
  loadDraft,
  removeDraft,
  removeTemplateDraft,
  saveDraft,
} from '../Templates/LifeJourney/draftStorage';
import { getBiographyTemplateRoute } from '../Templates/LifeJourney/templateRoutes';
import { getSectionCopy } from '../Templates/LifeJourney/sectionCopy';
import { hydrateDraftFromBackendSections } from '../Templates/LifeJourney/backendSectionHydration';
import { authService } from '../services/authService';
import {
  getTemplatePreviewProgressKey,
  getWebsitePreviewProgressKey,
  markDiyPreviewedProgressKey,
} from '../utils/diyProgress';
import type {
  BiographyContactMessage,
  BiographyMediaAsset,
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
const AUTO_SAVE_DELAY_MS = 1500;
const IMAGE_UPLOAD_MAX_BYTES = 8 * 1024 * 1024;
const IMAGE_UPLOAD_MAX_DIMENSION = 1600;
const EMPTY_OMITTED_MEDIA_ASSET_IDS = new Set<string>();
const IMAGE_UPLOAD_ACCEPT = 'image/png,image/jpeg,image/webp';
const MOBILE_PREVIEW_SRC_DOC =
  '<!doctype html><html><head></head><body><div id="mobile-preview-root"></div></body></html>';

type PreviewViewport = 'desktop' | 'tablet' | 'phone';
type FramedPreviewViewport = Exclude<PreviewViewport, 'desktop'>;
type EditorMode = 'edit' | 'preview';
type ContentEditorSection = Exclude<EditableTemplateSection, 'style'>;

const DEVICE_PREVIEW_CONFIG: Record<FramedPreviewViewport, { label: string; width: number; height: number }> = {
  tablet: { label: 'Tablet', width: 768, height: 900 },
  phone: { label: 'Phone', width: 390, height: 780 },
};

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

type PersonalTextFieldKey = {
  [K in keyof PersonalDetails]: PersonalDetails[K] extends string | undefined ? K : never;
}[keyof PersonalDetails];

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
    label: 'About',
    description: 'Biography, values, interests',
    icon: BookOpen,
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

const BACKEND_SECTION_ALIASES: Record<ContentEditorSection, string[]> = {
  hero: ['hero', 'hero section'],
  about: ['about', 'about section', 'chronicle', 'chronicle section', 'chronicle overview', 'archival essence'],
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

const notifyBiographyListChanged = () => {
  window.localStorage.setItem(BIOGRAPHY_LIST_REFRESH_KEY, String(Date.now()));
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
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);
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
  const [isLoadingMediaAssets, setIsLoadingMediaAssets] = useState(false);
  const [pendingDeleteMediaAssetId, setPendingDeleteMediaAssetId] = useState<string | null>(null);
  const [deletingMediaAssetId, setDeletingMediaAssetId] = useState<string | null>(null);
  const [updatingContactMessageId, setUpdatingContactMessageId] = useState<string | null>(null);
  const [pendingDeleteContactMessageId, setPendingDeleteContactMessageId] = useState<string | null>(null);
  const [deletingContactMessageId, setDeletingContactMessageId] = useState<string | null>(null);
  const devicePreviewFrameRef = React.useRef<HTMLIFrameElement | null>(null);
  const hasMountedDraftRef = React.useRef(false);
  const activeWebsiteId = website?.id || websiteId;
  const isEditingMode = editorMode === 'edit';
  const previewModeLabel =
    previewViewport === 'desktop'
      ? 'Desktop width'
      : `${DEVICE_PREVIEW_CONFIG[previewViewport].label} width (${DEVICE_PREVIEW_CONFIG[previewViewport].width}px)`;
  const matchingBackendSection = React.useMemo(
    () => getBackendSectionForEditorSection(activeEditorSection, websiteSections),
    [activeEditorSection, websiteSections]
  );
  const pursuitsBackendSection = React.useMemo(
    () => getBackendSectionByAliases(['pursuits', 'pursuit', 'specialized pursuits'], websiteSections),
    [websiteSections]
  );
  const currentBackendSection = activeBackendSection || matchingBackendSection;

  const loadMediaAssets = React.useCallback(async () => {
    if (!activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setMediaAssets([]);
      setMediaAssetsMessage('Media assets will load after this biography is saved');
      return;
    }

    setIsLoadingMediaAssets(true);
    setMediaAssetsMessage('Loading media assets...');

    const assets = await authService.getBiographyWebsiteMedia(activeWebsiteId);

    setIsLoadingMediaAssets(false);
    setMediaAssets(assets);
    setPendingDeleteMediaAssetId(null);
    setMediaAssetsMessage(
      assets.length > 0
        ? `Loaded ${assets.length} media asset${assets.length === 1 ? '' : 's'}`
        : 'No media assets yet'
    );
  }, [activeWebsiteId]);

  const handleDeleteMediaAsset = async (mediaAssetId: string) => {
    if (!activeWebsiteId || activeWebsiteId.startsWith('local-')) {
      setMediaAssetsMessage('Media can be deleted after this biography is saved');
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
    setMediaAssetsMessage('Deleted media asset');
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
    setPendingDeleteSectionId(null);
    if (shouldUseMobileEditor()) {
      setIsMobileEditorOpen(true);
    }
  };

  const handleOpenStyleEditor = () => {
    if (!isEditingMode) {
      return;
    }

    setActiveEditorSection('style');
    setPendingDeleteSectionId(null);
    if (shouldUseMobileEditor()) {
      setIsMobileEditorOpen(true);
    }
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
    setIsMobileEditorOpen(false);
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

      setWebsiteSections(detailedSections);
      if (detailedSections.length > 0) {
        setDraft((currentDraft) => {
          const hydratedDraft = hydrateDraftFromBackendSections(currentDraft, detailedSections);
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
      socialLinks: socialLinks
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
      isVisible: true,
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
      isVisible: section.isVisible ?? true,
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
      isVisible: contactSection.isVisible ?? true,
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
      isVisible: section.isVisible ?? true,
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
      { key: 'contact', title: 'Contact', sortOrder: 7, order: 7, isVisible: true },
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

            <div className="space-y-3 border-t border-slate-100 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Hobbies / Interests
              </h3>
              {draft.hobbies.map((item, index) => (
                <div key={item.id} className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  {renderTextField({
                    label: `Interest ${index + 1} title`,
                    value: item.title,
                    section: 'about',
                    onChange: (value) => updateHobbyItem(index, 'title', value),
                  })}
                  {renderTextField({
                    label: `Interest ${index + 1} description`,
                    value: item.description,
                    multiline: true,
                    section: 'about',
                    onChange: (value) => updateHobbyItem(index, 'description', value),
                  })}
                  {renderTextDisplayFields({
                    title: `Interest ${index + 1} Text`,
                    section: 'about',
                    settings: item.textSettings,
                    onChange: (textSettings) => updateHobbyItem(index, 'textSettings', textSettings),
                  })}
                  {renderImageUploadField({
                    label: `Interest ${index + 1} image`,
                    value: item.imageUrl,
                    assetId: item.imageAssetId,
                    usageType: 'PURSUIT',
                    section: 'about',
                    onChange: (value) => updateHobbyItem(index, 'imageUrl', value),
                    onAssetChange: (assetId) => updateHobbyItem(index, 'imageAssetId', assetId),
                  })}
                  {renderImageDisplayFields({
                    section: 'about',
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
          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-500">Theme</span>
              <select
                value={draft.settings.theme}
                onFocus={() => focusPreviewSection('style')}
                onChange={(event) =>
                  updateSettings('theme', event.target.value as CustomizerSettings['theme'])
                }
                className={inputClass}
              >
                <option value="cream">Cream memoir</option>
                <option value="sage">Sage archive</option>
                <option value="charcoal">Charcoal legacy</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-500">Typography</span>
              <select
                value={draft.settings.fontPairing}
                onFocus={() => focusPreviewSection('style')}
                onChange={(event) =>
                  updateSettings(
                    'fontPairing',
                    event.target.value as CustomizerSettings['fontPairing'],
                  )
                }
                className={inputClass}
              >
                <option value="classic">Classic serif</option>
                <option value="modern">Modern sans</option>
                <option value="editorial">Editorial italic</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-500">Spacing</span>
              <select
                value={draft.settings.spacing}
                onFocus={() => focusPreviewSection('style')}
                onChange={(event) =>
                  updateSettings('spacing', event.target.value as CustomizerSettings['spacing'])
                }
                className={inputClass}
              >
                <option value="spacious">Spacious</option>
                <option value="compact">Compact</option>
              </select>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSave = async () => {
    saveDraft(templateRoute.id, draft, activeWebsiteId);

    setIsSaving(true);
    setSaveMessage('Saving...');

    try {
      if (activeWebsiteId) {
        if (!activeWebsiteId.startsWith('local-')) {
          setSaveMessage('Saving biography content to database...');
          await syncBiographySectionsToBackend(activeWebsiteId);
          saveDraft(templateRoute.id, draft, activeWebsiteId);
          notifyBiographyListChanged();
          setSaveMessage('Saved to database and My Biographies');
          return;
        }

        notifyBiographyListChanged();
        setSaveMessage('Saved locally. Biography is in My Biographies');
        return;
      }

      const savedWebsite = await authService.createBiographyWebsite({
        title: getBiographyTitle(draft, templateRoute.title),
        templateId: backendTemplateId || templateRoute.id,
        subjectType: getSubjectType(searchParams.get('subjectType') || website?.subjectType),
      });

      setWebsite(savedWebsite);
      setSearchParams({ websiteId: savedWebsite.id }, { replace: true });
      saveDraft(templateRoute.id, draft, savedWebsite.id);
      removeTemplateDraft(templateRoute.id);

      if (!savedWebsite.id.startsWith('local-')) {
        setSaveMessage('Created biography. Saving content to database...');
        await syncBiographySectionsToBackend(savedWebsite.id);
        saveDraft(templateRoute.id, draft, savedWebsite.id);
      }

      notifyBiographyListChanged();
      setSaveMessage(
        savedWebsite.id.startsWith('local-')
          ? 'Saved locally. Biography is in My Biographies'
          : 'Saved to database and My Biographies'
      );
    } catch (err: any) {
      setSaveMessage(err?.message || 'Saved locally, but My Biographies was not updated');
    } finally {
      setIsSaving(false);
    }
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
            <Sparkles className="h-4 w-4 text-[#B18625]" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Section Editor</h2>
              <p className="text-[11px] text-slate-500">
                Click any section in the live preview to edit it here.
              </p>
            </div>
          </div>
          {variant === 'mobile' && (
            <button
              type="button"
              onClick={() => setIsMobileEditorOpen(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-900 hover:text-slate-900"
              aria-label="Close editor"
            >
              <X className="h-4 w-4" />
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

            {activeEditorSection === 'about' && pursuitsBackendSection && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                  Backend Pursuits Section
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  Loaded {pursuitsBackendSection.title}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Section ID:</span> {pursuitsBackendSection.id}
                </p>
                <button
                  type="button"
                  onClick={handleUpdatePursuitsSection}
                  disabled={isUpdatingPursuitsSection || isCreatingPursuitsSection}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isUpdatingPursuitsSection ? 'Updating Pursuits' : 'Update Pursuits Content'}
                </button>
              </div>
            )}

            {activeEditorSection === 'about' && !pursuitsBackendSection && (
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
              Click the Hero, About, Life Journey, Gallery, Stories, or Contact area in the live preview.
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="flex min-h-18 flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/diy-dashboard')}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
              title="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                {isEditingMode ? 'Template Editor' : 'Template Preview'}
              </p>
              <h1 className="font-serif-display text-2xl font-semibold leading-tight text-[#0A1128]">
                {templateRoute.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={handleEnterEditMode}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${
                  isEditingMode
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <PencilLine className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={handleEnterPreviewMode}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${
                  !isEditingMode
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
            </div>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
              {saveMessage}
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      <main className={isEditingMode ? 'grid lg:grid-cols-[360px_minmax(0,1fr)]' : 'grid'}>
        {isEditingMode && (
          <aside className="hidden border-r border-slate-200 bg-white lg:block">
            <div className="p-5 lg:sticky lg:top-[73px] lg:max-h-[calc(100vh-73px)] lg:overflow-y-auto lg:p-6">
              {renderEditorPanel('desktop')}
            </div>
          </aside>
        )}

        <section className="min-w-0 bg-slate-100">
          <div className="sticky top-[73px] z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-100/95 px-4 py-3 backdrop-blur-md lg:px-6">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-slate-500" />
              <div>
                <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Live Preview
                </span>
                <span className="block text-[11px] text-slate-500">
                  {previewModeLabel}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${
                    previewViewport === 'desktop'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('tablet')}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${
                    previewViewport === 'tablet'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Tablet className="h-3.5 w-3.5" />
                  Tablet
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('phone')}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${
                    previewViewport === 'phone'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Phone
                </button>
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
          </div>

          {previewViewport !== 'desktop' ? (
            <div className="bg-slate-200 px-3 py-6 sm:px-6 lg:px-8">
              <DevicePreviewFrame iframeRef={devicePreviewFrameRef} viewport={previewViewport}>
                <LifeJourneyTemplate
                  categoryKey={templateRoute.categoryKey}
                  dataOverride={draft}
                  activeEditSection={isEditingMode ? activeEditorSection : null}
                  onDataChange={isEditingMode ? handleDraftChange : undefined}
                  onEditSectionChange={isEditingMode ? handleEditSectionChange : undefined}
                  websiteId={activeWebsiteId}
                />
              </DevicePreviewFrame>
            </div>
          ) : (
            <LifeJourneyTemplate
              categoryKey={templateRoute.categoryKey}
              dataOverride={draft}
              activeEditSection={isEditingMode ? activeEditorSection : null}
              onDataChange={isEditingMode ? handleDraftChange : undefined}
              onEditSectionChange={isEditingMode ? handleEditSectionChange : undefined}
              websiteId={activeWebsiteId}
            />
          )}
        </section>
      </main>

      {isEditingMode && !isMobileEditorOpen && (
        <button
          type="button"
          onClick={() => setIsMobileEditorOpen(true)}
          className="fixed bottom-5 right-5 z-[70] inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-xl transition active:scale-[0.98] lg:hidden"
        >
          <PencilLine className="h-4 w-4" />
          {activeEditorSection
            ? `Edit ${editorSections.find((section) => section.key === activeEditorSection)?.label || 'Section'}`
            : 'Edit Section'}
        </button>
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
    </div>
  );
}
