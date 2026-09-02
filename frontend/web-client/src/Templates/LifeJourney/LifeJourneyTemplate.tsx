import React, { useState } from 'react';
import { 
  Compass, 
  Heart, 
  Leaf, 
  Feather, 
  MapPin, 
  Mail, 
  Calendar, 
  Sparkles, 
  Play, 
  ChevronRight, 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Layers, 
  Award, 
  BookOpen,
  ArrowRight,
  Send,
  FileText,
  Menu,
  X,
  Sprout,
  Palette,
  Mountain,
  AlignCenter,
  AlignLeft,
  Bold,
  Check,
  Eraser,
  Italic,
  Image as ImageIcon,
  Link2,
  List,
  ListOrdered,
  Type
} from 'lucide-react';
import { CATEGORIES_DATA } from './data';
import { getSectionCopy } from './sectionCopy';
import { authService } from '../../services/authService';
import type {
  BiographyCategory,
  EditableImageTarget,
  EditableSectionCopyKey,
  EditableTemplateSection,
  GalleryItem,
  HobbyItem,
  ImageDisplaySettings,
  MemoryStory,
  PersonalDetails,
  TextDisplaySettings,
  TimelineMilestone,
  ValueItem,
} from './types';

interface LifeJourneyTemplateProps {
  categoryKey?: BiographyCategory['id'];
  dataOverride?: BiographyCategory;
  activeEditSection?: EditableTemplateSection | null;
  onDataChange?: React.Dispatch<React.SetStateAction<BiographyCategory>>;
  onEditSectionChange?: (section: EditableTemplateSection) => void;
  onImageChangeRequest?: (target: EditableImageTarget) => void;
  websiteId?: string;
}

const ALLOWED_RICH_TEXT_TAGS = new Set([
  'a',
  'b',
  'br',
  'div',
  'em',
  'font',
  'i',
  'li',
  'ol',
  'p',
  'span',
  'strong',
  'u',
  'ul',
]);

const ALLOWED_TEXT_ALIGNMENTS = new Set(['left', 'center', 'right']);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const sanitizeRichTextUrl = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return '';
  }

  if (/^(https?:|mailto:|tel:|#)/i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
};

const sanitizeRichText = (value: string) => {
  if (!value) {
    return '';
  }

  if (typeof DOMParser === 'undefined') {
    return escapeHtml(value);
  }

  const parser = new DOMParser();
  const documentValue = parser.parseFromString(value, 'text/html');
  const outputDocument = document.implementation.createHTMLDocument('');

  const cleanNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return outputDocument.createTextNode(node.textContent || '');
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    const safeTagName =
      tagName === 'b' ? 'strong' :
        tagName === 'i' ? 'em' :
          tagName;

    if (!ALLOWED_RICH_TEXT_TAGS.has(tagName)) {
      const fragment = outputDocument.createDocumentFragment();
      Array.from(element.childNodes).forEach((child) => {
        const safeChild = cleanNode(child);
        if (safeChild) {
          fragment.appendChild(safeChild);
        }
      });
      return fragment;
    }

    const safeElement = outputDocument.createElement(safeTagName);

    if (safeTagName === 'a') {
      const safeHref = sanitizeRichTextUrl(element.getAttribute('href') || '');
      if (safeHref) {
        safeElement.setAttribute('href', safeHref);
        safeElement.setAttribute('target', '_blank');
        safeElement.setAttribute('rel', 'noreferrer');
      }
    }

    if (safeTagName === 'font') {
      const size = element.getAttribute('size') || '';
      if (/^[1-7]$/.test(size)) {
        safeElement.setAttribute('size', size);
      }
    }

    const textAlignment = (element.style.textAlign || element.getAttribute('align') || '').toLowerCase();
    if (ALLOWED_TEXT_ALIGNMENTS.has(textAlignment)) {
      safeElement.setAttribute('style', `text-align: ${textAlignment};`);
    }

    Array.from(element.childNodes).forEach((child) => {
      const safeChild = cleanNode(child);
      if (safeChild) {
        safeElement.appendChild(safeChild);
      }
    });

    return safeElement;
  };

  const fragment = outputDocument.createDocumentFragment();
  Array.from(documentValue.body.childNodes).forEach((child) => {
    const safeChild = cleanNode(child);
    if (safeChild) {
      fragment.appendChild(safeChild);
    }
  });

  const container = outputDocument.createElement('div');
  container.appendChild(fragment);
  return container.innerHTML;
};

const getRichTextPlainText = (value: string) => {
  if (typeof DOMParser === 'undefined') {
    return value.replace(/<[^>]*>/g, ' ').trim();
  }

  const parser = new DOMParser();
  const documentValue = parser.parseFromString(value, 'text/html');
  return (documentValue.body.textContent || '').replace(/\u00a0/g, ' ').trim();
};

const normalizeEditableRichText = (value: string) => {
  const sanitizedValue = sanitizeRichText(value).trim();
  return getRichTextPlainText(sanitizedValue) ? sanitizedValue : '';
};

export default function LifeJourneyTemplate({
  categoryKey = 'life',
  dataOverride,
  activeEditSection = null,
  onDataChange,
  onEditSectionChange,
  onImageChangeRequest,
  websiteId = '',
}: LifeJourneyTemplateProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [inlineTextEditor, setInlineTextEditor] = useState<{
    top: number;
    left: number;
    section: EditableTemplateSection;
    multiline: boolean;
  } | null>(null);
  const activeEditableTextRef = React.useRef<HTMLElement | null>(null);
  
  const data = dataOverride ?? CATEGORIES_DATA[categoryKey];
  const isInlineEditable = Boolean(onDataChange);
  const showContactSection = data.settings.showContactSection !== false;
  const showSocialLinks = data.settings.showSocialLinks !== false;
  const allowContactMessages = data.settings.allowContactMessages !== false;

  const updateInlineTextEditorPosition = React.useCallback((
    element: HTMLElement,
    section: EditableTemplateSection,
    multiline: boolean
  ) => {
    const rect = element.getBoundingClientRect();
    const toolbarWidth = 560;
    const nextLeft = Math.min(
      Math.max(rect.left, 16),
      Math.max(window.innerWidth - toolbarWidth - 16, 16)
    );

    const nextPosition = {
      top: Math.max(rect.top - 52, 88),
      left: nextLeft,
      section,
      multiline,
    };

    setInlineTextEditor((currentPosition) => {
      if (
        currentPosition &&
        Math.abs(currentPosition.top - nextPosition.top) < 1 &&
        Math.abs(currentPosition.left - nextPosition.left) < 1 &&
        currentPosition.section === nextPosition.section &&
        currentPosition.multiline === nextPosition.multiline
      ) {
        return currentPosition;
      }

      return nextPosition;
    });
  }, []);

  const focusActiveEditableText = () => {
    const element = activeEditableTextRef.current;
    if (!element) {
      return null;
    }

    element.focus();
    return element;
  };

  const runInlineTextCommand = (command: string, value?: string) => {
    const element = focusActiveEditableText();
    if (!element) {
      return;
    }

    document.execCommand(command, false, value);
  };

  const handleInlineTextLink = () => {
    const element = focusActiveEditableText();
    if (!element) {
      return;
    }

    const selectedText = window.getSelection()?.toString().trim();
    const url = window.prompt(
      selectedText ? `Add link for "${selectedText}"` : 'Add link URL',
      ''
    );

    if (url === null) {
      return;
    }

    const safeUrl = sanitizeRichTextUrl(url);
    if (!safeUrl) {
      return;
    }

    document.execCommand('createLink', false, safeUrl);
    element.querySelectorAll('a').forEach((anchor) => {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noreferrer');
    });
  };

  const handleInlineTextDone = () => {
    activeEditableTextRef.current?.blur();
    setInlineTextEditor(null);
    activeEditableTextRef.current = null;
  };

  React.useEffect(() => {
    if (!inlineTextEditor) {
      return;
    }

    const repositionEditor = () => {
      if (activeEditableTextRef.current) {
        updateInlineTextEditorPosition(
          activeEditableTextRef.current,
          inlineTextEditor.section,
          inlineTextEditor.multiline
        );
      }
    };

    window.addEventListener('resize', repositionEditor);
    window.addEventListener('scroll', repositionEditor, true);

    return () => {
      window.removeEventListener('resize', repositionEditor);
      window.removeEventListener('scroll', repositionEditor, true);
    };
  }, [inlineTextEditor, updateInlineTextEditorPosition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allowContactMessages) {
      setSubmitError('Contact messages are disabled for this biography.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    if (!websiteId || websiteId.startsWith('local-')) {
      window.setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
      }, 300);
      return;
    }

    const wasSent = await authService.createPublicContactMessage(websiteId, {
      senderName: formData.name.trim(),
      senderEmail: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    });

    if (wasSent) {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      return;
    }

    setIsSubmitting(false);
    setSubmitError('Unable to send your message. Please try again.');
  };

  // Helper to render correct icons dynamically from data names
  const renderIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case 'Compass': return <Compass className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Leaf': return <Leaf className={className} />;
      case 'Feather': return <Feather className={className} />;
      case 'Sprout': return <Sprout className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Palette': return <Palette className={className} />;
      case 'Mountain': return <Mountain className={className} />;
      case 'Calendar': return <Calendar className={className} />;
      case 'MapPin': return <MapPin className={className} />;
      case 'Mail': return <Mail className={className} />;
      case 'Play': return <Play className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Layers': return <Layers className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  // Theme styling mapping based on selected biography perspective
  const getThemeStyles = () => {
    switch (data.settings.theme) {
      case 'charcoal':
        return {
          bg: 'bg-[#121214] text-zinc-100',
          navBg: 'bg-[#121214]/85 border-zinc-800/60',
          card: 'bg-[#1C1C1F] border-zinc-800/80 shadow-md',
          accent: 'text-indigo-400 bg-indigo-950/40 border-indigo-900/40',
          accentButton: 'bg-indigo-600 hover:bg-indigo-500 text-white',
          accentHover: 'hover:border-indigo-500/50',
          badge: 'bg-indigo-900/30 text-indigo-300 border-indigo-800/40',
          textPrimary: 'text-zinc-100',
          textSecondary: 'text-zinc-300',
          textSubtle: 'text-zinc-500',
          textMuted: 'text-zinc-400',
          sectionBorder: 'border-zinc-800/70',
          divider: 'bg-zinc-800',
          highlight: 'text-indigo-400',
          innerCard: 'bg-zinc-900/40 border-zinc-800/50',
          quoteCard: 'bg-zinc-900/70 border-zinc-800/70 text-zinc-200',
          mutedPanel: 'bg-zinc-900/40 border-zinc-800/60',
          cardFooter: 'border-zinc-800 bg-zinc-900/50',
          secondaryButton: 'bg-transparent hover:bg-zinc-800/70 text-zinc-100 border border-zinc-700',
          socialLink: 'text-zinc-300 hover:text-zinc-50 hover:border-indigo-500/50',
          iconMuted: 'text-zinc-400',
          mobileMenu: 'bg-[#121214] border-zinc-800 text-zinc-100',
          imageFrame: 'bg-zinc-900 border-zinc-800/60',
          footer: 'border-zinc-800 bg-[#0A0A0C]',
          input: 'bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-indigo-500',
          tag: 'bg-zinc-800/60 border-zinc-700/50 text-zinc-300'
        };
      case 'sage':
        return {
          bg: 'bg-[#F4F7F5] text-slate-800',
          navBg: 'bg-[#F4F7F5]/85 border-emerald-200/20',
          card: 'bg-white border-emerald-900/10 shadow-xs',
          accent: 'text-emerald-800 bg-emerald-50 border-emerald-100',
          accentButton: 'bg-slate-900 hover:bg-slate-800 text-emerald-50',
          accentHover: 'hover:border-emerald-300',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200/50',
          textPrimary: 'text-slate-900',
          textSecondary: 'text-slate-600',
          textSubtle: 'text-slate-400',
          textMuted: 'text-slate-500',
          sectionBorder: 'border-emerald-900/10',
          divider: 'bg-emerald-900/5',
          highlight: 'text-emerald-700',
          innerCard: 'bg-emerald-50/30 border-emerald-100/50',
          quoteCard: 'bg-white border-emerald-100/70 text-slate-700',
          mutedPanel: 'bg-emerald-50/30 border-emerald-100/50',
          cardFooter: 'border-emerald-900/5 bg-emerald-50/40',
          secondaryButton: 'bg-transparent hover:bg-emerald-50 text-slate-800 border border-slate-300',
          socialLink: 'text-slate-600 hover:text-slate-900 hover:border-emerald-500/50',
          iconMuted: 'text-slate-500',
          mobileMenu: 'bg-[#F4F7F5] border-emerald-200 text-slate-800',
          imageFrame: 'bg-slate-100 border-slate-200/50',
          footer: 'border-emerald-900/5 bg-white',
          input: 'bg-white border-slate-200 text-slate-800 focus:ring-emerald-600',
          tag: 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
        };
      case 'cream':
      default:
        return {
          bg: 'bg-[#FAF6F0] text-stone-850',
          navBg: 'bg-[#FAF6F0]/85 border-amber-200/20',
          card: 'bg-white border-amber-900/10 shadow-xs',
          accent: 'text-amber-800 bg-amber-50 border-amber-200/30',
          accentButton: 'bg-stone-900 hover:bg-stone-850 text-amber-50',
          accentHover: 'hover:border-amber-300',
          badge: 'bg-amber-100 text-amber-800 border-amber-200/50',
          textPrimary: 'text-stone-900',
          textSecondary: 'text-stone-700',
          textSubtle: 'text-stone-400',
          textMuted: 'text-stone-500',
          sectionBorder: 'border-stone-200/60',
          divider: 'bg-stone-200/60',
          highlight: 'text-orange-600',
          innerCard: 'bg-[#FAF8F5] border-stone-200/60',
          quoteCard: 'bg-[#FFFDF9] border-amber-200/50 text-stone-700',
          mutedPanel: 'bg-[#FAF8F5]/40 border-stone-100/50',
          cardFooter: 'border-stone-100 bg-stone-50/50',
          secondaryButton: 'bg-transparent hover:bg-stone-500/5 text-stone-800 border border-stone-300',
          socialLink: 'text-stone-600 hover:text-stone-900 hover:border-amber-500/50',
          iconMuted: 'text-stone-500',
          mobileMenu: 'bg-[#FAF6F0] border-stone-200 text-stone-800',
          imageFrame: 'bg-stone-100 border-stone-200/50',
          footer: 'border-stone-200 bg-white',
          input: 'bg-white border-stone-200 text-stone-800 focus:ring-amber-500',
          tag: 'bg-amber-50/60 border-amber-100 text-amber-900'
        };
    }
  };

  const theme = getThemeStyles();

  const getEditHighlightClass = (section: EditableTemplateSection) => {
    if (activeEditSection !== section) {
      return 'relative rounded-[2rem] outline outline-0 outline-offset-8 outline-transparent transition-all duration-300';
    }

    return 'relative rounded-[2rem] outline outline-4 outline-offset-8 outline-[#FED362] shadow-[0_0_0_8px_rgba(254,211,98,0.16),0_18px_45px_rgba(177,134,37,0.16)] transition-all duration-300';
  };

  const getSectionInteractionProps = (section: EditableTemplateSection) => ({
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      if (!isInlineEditable) {
        return;
      }

      const target = event.target as HTMLElement;
      if (target.closest('a, button, input, textarea, select')) {
        return;
      }

      onEditSectionChange?.(section);
    },
  });

  const handleImageChangeRequest = (target: EditableImageTarget) => (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isInlineEditable) {
      return;
    }

    onEditSectionChange?.(target.section);
    onImageChangeRequest?.(target);
  };

  const renderChangePictureButton = (target: EditableImageTarget) => {
    if (!isInlineEditable) {
      return null;
    }

    return (
      <button
        type="button"
        onClick={handleImageChangeRequest(target)}
        className="pointer-events-auto absolute bottom-3 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-stone-950/90 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-white opacity-100 shadow-lg backdrop-blur-sm transition hover:bg-stone-900 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#FED362] sm:pointer-events-none sm:opacity-0 sm:group-hover/image:pointer-events-auto sm:group-hover/image:opacity-100 sm:group-focus-within/image:pointer-events-auto sm:group-focus-within/image:opacity-100"
        aria-label="Change picture"
      >
        <ImageIcon className="h-3.5 w-3.5" />
        Change Picture
      </button>
    );
  };

  type EditableTextTag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'div';

  const updatePersonalDetail = (field: keyof PersonalDetails, value: string) => {
    onDataChange?.((current) => ({
      ...current,
      personalDetails: {
        ...current.personalDetails,
        [field]: value,
      },
    }));
  };

  const updateValueItem = (index: number, field: keyof ValueItem, value: string) => {
    onDataChange?.((current) => ({
      ...current,
      values: current.values.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updateHobbyItem = (index: number, field: keyof HobbyItem, value: string) => {
    onDataChange?.((current) => ({
      ...current,
      hobbies: current.hobbies.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updateTimelineItem = (index: number, updates: Partial<TimelineMilestone>) => {
    onDataChange?.((current) => ({
      ...current,
      timeline: current.timeline.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      ),
    }));
  };

  const updateGalleryItem = (index: number, updates: Partial<GalleryItem>) => {
    onDataChange?.((current) => ({
      ...current,
      gallery: current.gallery.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      ),
    }));
  };

  const updateStoryItem = (index: number, field: keyof MemoryStory, value: string) => {
    onDataChange?.((current) => ({
      ...current,
      stories: current.stories.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updateSectionDescription = (section: EditableSectionCopyKey, value: string) => {
    onDataChange?.((current) => ({
      ...current,
      sectionCopy: {
        ...current.sectionCopy,
        [section]: {
          title: sectionCopy[section].title,
          description: value,
          descriptionTextSettings: current.sectionCopy?.[section]?.descriptionTextSettings,
        },
      },
    }));
  };

  const editableTextClass = isInlineEditable
    ? 'cursor-text rounded-md outline-none transition hover:bg-[#FED362]/10 focus:bg-[#FED362]/15 focus:ring-1 focus:ring-[#FED362]/70 focus:ring-offset-1 focus:ring-offset-white'
    : '';

  const renderEditableText = ({
    as: Component = 'span',
    value,
    className = '',
    section,
    multiline = false,
    onChange,
  }: {
    as?: EditableTextTag;
    value: string;
    className?: string;
    section: EditableTemplateSection;
    multiline?: boolean;
    onChange: (value: string) => void;
  }) => {
    const sanitizedValue = sanitizeRichText(value);

    const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
      const nextValue = normalizeEditableRichText(event.currentTarget.innerHTML);
      const currentValue = normalizeEditableRichText(value);
      if (nextValue !== currentValue) {
        onChange(nextValue);
      }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLElement>) => {
      if (!isInlineEditable) {
        return;
      }

      event.preventDefault();
      const pastedText = event.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, pastedText);
    };

    return (
      <Component
        className={`${className} ${editableTextClass}`}
        contentEditable={isInlineEditable}
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: sanitizedValue }}
        onFocus={(event) => {
          onEditSectionChange?.(section);
          activeEditableTextRef.current = event.currentTarget;
          updateInlineTextEditorPosition(event.currentTarget, section, multiline);
        }}
        onClick={(event) => {
          if (isInlineEditable) {
            activeEditableTextRef.current = event.currentTarget;
            updateInlineTextEditorPosition(event.currentTarget, section, multiline);
          }
        }}
        onBlur={isInlineEditable ? (event) => {
          handleBlur(event);
          window.setTimeout(() => {
            if (document.activeElement !== activeEditableTextRef.current) {
              setInlineTextEditor(null);
              activeEditableTextRef.current = null;
            }
          }, 0);
        } : undefined}
        onKeyDown={(event) => {
          if (!multiline && event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        onPaste={handlePaste}
      />
    );
  };

  // Font class bindings
  const getHeadingFont = () => {
    switch (data.settings.fontPairing) {
      case 'modern':
        return 'font-sans font-extrabold tracking-tight';
      case 'editorial':
        return 'font-serif italic font-semibold';
      case 'classic':
      default:
        return 'font-serif font-black tracking-tight';
    }
  };

  const getImageSizeClass = (
    area: 'profile' | 'hobby' | 'timeline' | 'gallery' | 'story',
    settings?: ImageDisplaySettings
  ) => {
    const size = settings?.size || 'default';

    switch (area) {
      case 'profile':
        return size === 'compact'
          ? 'aspect-square'
          : size === 'tall'
            ? 'aspect-[3/5]'
            : 'aspect-[4/5]';

      case 'hobby':
        return size === 'compact'
          ? 'aspect-[16/7]'
          : size === 'tall'
            ? 'aspect-[4/3]'
            : 'aspect-video';

      case 'timeline':
        return size === 'compact'
          ? 'aspect-[12/5]'
          : size === 'tall'
            ? 'aspect-[4/3]'
            : 'aspect-[19/10]';

      case 'gallery':
        return size === 'compact'
          ? 'aspect-video'
          : size === 'tall'
            ? 'aspect-[3/4]'
            : 'aspect-[4/3]';

      case 'story':
      default:
        return size === 'compact'
          ? 'aspect-[2/1]'
          : size === 'tall'
            ? 'aspect-[4/3]'
            : 'aspect-[16/10]';
    }
  };

  const getImageFitClass = (settings?: ImageDisplaySettings) =>
    settings?.fit === 'contain' ? 'object-contain' : 'object-cover';

  const getImagePositionClass = (settings?: ImageDisplaySettings) => {
    switch (settings?.position) {
      case 'top':
        return 'object-top';
      case 'bottom':
        return 'object-bottom';
      case 'center':
      default:
        return 'object-center';
    }
  };

  const getTextSizeClass = (
    area: 'heroTagline' | 'heroIntro' | 'sectionDescription' | 'body' | 'quote' | 'cardDescription' | 'timelineBody' | 'detail' | 'caption',
    settings?: TextDisplaySettings
  ) => {
    const size = settings?.size || 'default';

    switch (area) {
      case 'heroTagline':
        return size === 'small'
          ? 'text-base sm:text-lg'
          : size === 'large'
            ? 'text-xl sm:text-2xl'
            : 'text-lg sm:text-xl';

      case 'heroIntro':
      case 'body':
        return size === 'small'
          ? 'text-[13px] md:text-sm'
          : size === 'large'
            ? 'text-base md:text-lg'
            : 'text-[14px] md:text-[15px]';

      case 'sectionDescription':
        return size === 'small'
          ? 'text-[11px] md:text-xs'
          : size === 'large'
            ? 'text-sm md:text-base'
            : 'text-xs md:text-sm';

      case 'quote':
        return size === 'small'
          ? 'text-xs'
          : size === 'large'
            ? 'text-base'
            : 'text-sm';

      case 'timelineBody':
        return size === 'small'
          ? 'text-xs'
          : size === 'large'
            ? 'text-base'
            : 'text-sm';

      case 'detail':
        return size === 'small'
          ? 'text-[11px]'
          : size === 'large'
            ? 'text-sm'
            : 'text-xs';

      case 'caption':
      case 'cardDescription':
      default:
        return size === 'small'
          ? 'text-[10px]'
          : size === 'large'
            ? 'text-xs'
            : 'text-[11px]';
    }
  };

  // Fixed profile portraits representing the carpenter at different life chapters
  const getCategoryPortrait = () => {
    return 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&q=80&w=800'; // Bearded master carpenter in workshop
  };

  const profileImageUrl = data.personalDetails.profileImageUrl || getCategoryPortrait();
  const contactEmail = data.personalDetails.contactEmail || 'julian.vance@cannonbeachwood.org';
  const instagramHandle = data.personalDetails.instagramHandle || '@JulianVanceWood';
  const twitterHandle = data.personalDetails.twitterHandle || '@VanceShipwrights';
  const facebookLabel = data.personalDetails.facebookLabel || 'Cabin Studio';
  const linkedinLabel = data.personalDetails.linkedinLabel || 'Julian Vance Forestry';
  const sectionCopy = getSectionCopy(data.sectionCopy);

  return (
    <div className={`min-h-screen ${theme.bg} selection:bg-amber-200 selection:text-amber-900 transition-colors duration-500 font-sans antialiased flex flex-col justify-between ${
      activeEditSection === 'style' ? 'ring-4 ring-inset ring-[#FED362]' : ''
    }`}>
      {isInlineEditable && inlineTextEditor && (
        <div
          className="fixed z-[120] flex max-w-[calc(100vw-32px)] flex-wrap items-center gap-1 rounded-xl border border-stone-200 bg-white/95 p-1 text-xs font-bold text-stone-800 shadow-xl backdrop-blur-md"
          style={{
            top: inlineTextEditor.top,
            left: inlineTextEditor.left,
          }}
          onMouseDown={(event) => event.preventDefault()}
        >
          <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-stone-950 px-3 text-amber-50">
            <Type className="h-3.5 w-3.5" />
            Text
          </span>
          <button
            type="button"
            onClick={() => runInlineTextCommand('bold')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-amber-50"
            title="Bold"
            aria-label="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => runInlineTextCommand('italic')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-amber-50"
            title="Italic"
            aria-label="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <span className="mx-1 h-5 w-px bg-stone-200" />
          <button
            type="button"
            onClick={() => runInlineTextCommand('fontSize', '2')}
            className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[10px] transition hover:bg-amber-50"
            title="Small text"
            aria-label="Small text"
          >
            S
          </button>
          <button
            type="button"
            onClick={() => runInlineTextCommand('fontSize', '3')}
            className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs transition hover:bg-amber-50"
            title="Default text"
            aria-label="Default text"
          >
            M
          </button>
          <button
            type="button"
            onClick={() => runInlineTextCommand('fontSize', '4')}
            className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm transition hover:bg-amber-50"
            title="Large text"
            aria-label="Large text"
          >
            L
          </button>
          {inlineTextEditor.multiline && (
            <>
              <span className="mx-1 h-5 w-px bg-stone-200" />
              <button
                type="button"
                onClick={() => runInlineTextCommand('insertUnorderedList')}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-amber-50"
                title="Bullet list"
                aria-label="Bullet list"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => runInlineTextCommand('insertOrderedList')}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-amber-50"
                title="Numbered list"
                aria-label="Numbered list"
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          <span className="mx-1 h-5 w-px bg-stone-200" />
          <button
            type="button"
            onClick={() => runInlineTextCommand('justifyLeft')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-amber-50"
            title="Align left"
            aria-label="Align left"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => runInlineTextCommand('justifyCenter')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-amber-50"
            title="Align center"
            aria-label="Align center"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </button>
          <span className="mx-1 h-5 w-px bg-stone-200" />
          <button
            type="button"
            onClick={handleInlineTextLink}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-amber-50"
            title="Add link"
            aria-label="Add link"
          >
            <Link2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              runInlineTextCommand('removeFormat');
              runInlineTextCommand('unlink');
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-amber-50"
            title="Clear formatting"
            aria-label="Clear formatting"
          >
            <Eraser className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleInlineTextDone}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-emerald-700 transition hover:bg-emerald-100"
            title="Done editing"
            aria-label="Done editing"
          >
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            Done
          </button>
        </div>
      )}
      
      {/* Sticky Navigation Bar */}
      <header className={`sticky top-0 z-40 w-full ${theme.navBg} backdrop-blur-md border-b transition-colors duration-500`}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 h-16 md:h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <a href="#hero-section" className="flex items-center gap-3 group">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-serif font-black border transition-all ${theme.badge}`}>
              JV
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif font-black text-sm tracking-tight leading-none group-hover:text-amber-700 transition-colors">
                {data.personalDetails.fullName}
              </span>
              <span className="font-mono text-[8px] opacity-60 font-bold uppercase tracking-widest mt-0.5">
                {data.personalDetails.occupation}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-mono text-[10px] font-extrabold uppercase tracking-widest">
            <a href="#about-section" className="hover:opacity-75 transition-opacity">About</a>
            <a href="#timeline-section" className="hover:opacity-75 transition-opacity">Timeline</a>
            <a href="#gallery-section" className="hover:opacity-75 transition-opacity">Gallery</a>
            <a href="#stories-section" className="hover:opacity-75 transition-opacity">Stories</a>
            {showContactSection && (
              <a 
                href="#contact-section" 
                className={`px-4 py-2 rounded-xl transition-all font-mono font-bold tracking-widest uppercase text-[9px] border ${theme.accentButton}`}
              >
                Send Letter
              </a>
            )}
          </nav>

          {/* Mobile Navigation Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden p-2 opacity-80 hover:opacity-100 transition-opacity"
            aria-label="Toggle navigation menu"
            id="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Mobile Overlay Menu */}
          {isMobileMenuOpen && (
            <div className={`md:hidden fixed inset-x-0 top-16 border-b shadow-lg p-6 space-y-5 font-mono text-[10px] font-black uppercase tracking-widest flex flex-col z-50 animate-fade-in ${theme.mobileMenu}`}>
              <a href="#about-section" onClick={() => setIsMobileMenuOpen(false)} className="py-1 border-b border-stone-100/10 pb-2">About</a>
              <a href="#timeline-section" onClick={() => setIsMobileMenuOpen(false)} className="py-1 border-b border-stone-100/10 pb-2">Timeline</a>
              <a href="#gallery-section" onClick={() => setIsMobileMenuOpen(false)} className="py-1 border-b border-stone-100/10 pb-2">Gallery</a>
              <a href="#stories-section" onClick={() => setIsMobileMenuOpen(false)} className="py-1 border-b border-stone-100/10 pb-2">Stories</a>
              {showContactSection && (
                <a 
                  href="#contact-section" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className={`w-full text-center font-bold tracking-widest uppercase p-3 rounded-xl border ${theme.accentButton}`}
                >
                  Send Letter
                </a>
              )}
            </div>
          )}

        </div>
      </header>

      {/* Main Container Frame with Dynamic Spacing */}
      <div className={`max-w-6xl mx-auto px-6 md:px-12 w-full flex-grow ${
        data.settings.spacing === 'compact' ? 'space-y-12 py-6 md:py-8' : 'space-y-16 md:space-y-20 py-8 md:py-12'
      }`}>
        
        {/* ========================================================= */}
        {/* HERITAGE MEMOIR IDENTITY (Visual Category Marker)        */}
        {/* ========================================================= */}
        <section className={`text-center space-y-3 pb-6 border-b ${theme.sectionBorder}`} id="lens-section">
          <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border shadow-xs ${theme.accent}`}>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
            </span>
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-widest">
              CLASSIC MEMOIR // HERITAGE WOODCRAFT EDITION
            </span>
          </div>
          <p className={`font-serif italic text-xs max-w-lg mx-auto ${theme.textMuted}`}>
            A visual archive and narrative chronicle honoring traditional timber joinery, maritime shipwright vessels, and coastal memoirs.
          </p>
        </section>

        {/* ========================================================= */}
        {/* 1. HERO SECTION (Split Layout - No Dead Space)            */}
        {/* ========================================================= */}
        <section
          className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center ${getEditHighlightClass('hero')}`}
          id="hero-section"
          {...getSectionInteractionProps('hero')}
        >
          
          {/* Left Column: Portrait */}
          <div className="lg:col-span-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-indigo-500 rounded-3xl blur-2xl opacity-15 group-hover:opacity-25 transition-all duration-700 -z-10 scale-[1.01]" />
              
              <div className={`${getImageSizeClass('profile', data.personalDetails.profileImageSettings)} group/image rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-stone-150 relative`}>
                <img 
                  src={profileImageUrl} 
                  alt={data.personalDetails.fullName} 
                  className={`w-full h-full ${getImageFitClass(data.personalDetails.profileImageSettings)} ${getImagePositionClass(data.personalDetails.profileImageSettings)} group-hover:scale-102 transition-transform duration-700 filter brightness-95 contrast-[1.02]`}
                  referrerPolicy="no-referrer"
                  id="hero-portrait"
                />
                {renderChangePictureButton({ section: 'hero' })}
                
                {/* Visual Category Label Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 font-mono text-[9px] font-extrabold tracking-widest uppercase rounded-lg shadow-md border bg-amber-100 text-amber-950 border-amber-200">
                    {data.badge}
                  </span>
                </div>

                {/* Overlay Year Label */}
                <div className="absolute bottom-4 right-4 bg-stone-900/80 backdrop-blur-xs px-2.5 py-1 text-[8px] font-mono text-stone-200 rounded-md tracking-wider">
                  CHAPTER ERA // 1952 – 2026
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Biographical content */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="space-y-3">
              <span className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest rounded-md font-extrabold inline-block ${theme.accent}`}>
                {data.quote}
              </span>
              
              {renderEditableText({
                as: 'h1',
                value: data.personalDetails.fullName,
                section: 'hero',
                className: `${getHeadingFont()} text-4xl sm:text-5xl md:text-6xl font-black leading-tight ${theme.textPrimary} tracking-tight`,
                onChange: (value) => updatePersonalDetail('fullName', value),
              })}
              
              {renderEditableText({
                as: 'p',
              value: data.personalDetails.tagline,
              section: 'hero',
              multiline: true,
                className: `font-sans font-bold ${getTextSizeClass('heroTagline', data.personalDetails.taglineTextSettings)} leading-snug ${theme.highlight}`,
              onChange: (value) => updatePersonalDetail('tagline', value),
            })}
            </div>

            <div className={`h-px w-24 ${theme.divider}`} />

            {/* Introduction Narrative */}
            {renderEditableText({
              as: 'p',
              value: data.personalDetails.shortIntro,
              section: 'hero',
              multiline: true,
              className: `font-sans ${getTextSizeClass('heroIntro', data.personalDetails.shortIntroTextSettings)} opacity-90 leading-relaxed font-normal`,
              onChange: (value) => updatePersonalDetail('shortIntro', value),
            })}

            <div className="pt-2 flex flex-wrap gap-4">
              <a 
                href="#about-section"
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold font-sans text-xs tracking-wider uppercase transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 ${theme.accentButton}`}
              >
                <span>Read My Story</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </a>
              {showContactSection && (
                <a 
                  href="#contact-section"
                  className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold font-sans text-xs tracking-wider uppercase transition-all ${theme.secondaryButton}`}
                >
                  <span>Send Message</span>
                </a>
              )}
            </div>
          </div>

        </section>

        {/* ========================================================= */}
        {/* 2. CHRONICLE OVERVIEW & VALUES (Bento Grid)              */}
        {/* ========================================================= */}
        <section
          className={`space-y-12 ${getEditHighlightClass('about')}`}
          id="about-section"
          {...getSectionInteractionProps('about')}
        >
          
          {/* Section Header */}
          <div className="text-left max-w-2xl">
            <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 font-mono text-[9px] tracking-widest font-black uppercase rounded-sm inline-block mb-3">
              02 / THE ARCHIVAL ESSENCE
            </span>
            <h2 className={`${getHeadingFont()} text-3xl md:text-4xl font-black tracking-tight ${theme.textPrimary}`}>
              {sectionCopy.about.title}
            </h2>
            {renderEditableText({
              as: 'p',
              value: sectionCopy.about.description,
              section: 'about',
              multiline: true,
              className: `font-sans ${getTextSizeClass('sectionDescription', sectionCopy.about.descriptionTextSettings)} ${theme.textMuted} mt-1.5`,
              onChange: (value) => updateSectionDescription('about', value),
            })}
          </div>

          {/* Bento Grid Layout - Fills all space neatly */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Card 1: Main Story Block (Col-span 7) */}
            <div className={`lg:col-span-7 rounded-3xl border p-8 md:p-10 text-left space-y-6 flex flex-col justify-start h-full ${theme.card}`}>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <h4 className={`font-mono text-[9px] font-black uppercase tracking-widest ${theme.textSubtle}`}>
                    BIOGRAPHY JOURNAL
                  </h4>
                </div>
                <h3 className={`font-serif text-2xl font-bold leading-tight ${theme.textPrimary}`}>
                  The Journey of My Hands
                </h3>
                <div className={`font-sans ${getTextSizeClass('body', data.personalDetails.bioTextSettings)} opacity-95 leading-relaxed space-y-4`}>
                  {data.personalDetails.bioFull.split('\n\n').map((paragraph, index, paragraphs) => (
                    <React.Fragment key={index}>
                      {renderEditableText({
                        as: 'p',
                        value: paragraph,
                        section: 'about',
                        multiline: true,
                        onChange: (value) => {
                          const updatedParagraphs = [...paragraphs];
                          updatedParagraphs[index] = value;
                          updatePersonalDetail('bioFull', updatedParagraphs.join('\n\n'));
                        },
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Decorative blockquote */}
              <div className={`rounded-2xl border p-5 italic ${getTextSizeClass('quote', data.personalDetails.signatureQuoteTextSettings)} leading-relaxed font-serif relative mt-2 ${theme.quoteCard}`}>
                <span className="text-amber-500 font-bold block mb-1 text-2xl leading-none">“</span>
                {renderEditableText({
                  as: 'p',
                  value: data.personalDetails.signatureQuote,
                  section: 'about',
                  multiline: true,
                  className: '-mt-2 pl-4',
                  onChange: (value) => updatePersonalDetail('signatureQuote', value),
                })}
              </div>
            </div>

            {/* Card 2: Personal Values Block (Col-span 5) */}
            <div className={`lg:col-span-5 rounded-3xl border p-8 md:p-10 text-left flex flex-col justify-center h-full ${theme.card}`}>
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-100/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <h4 className={`font-mono text-[9px] font-black uppercase tracking-widest ${theme.textSubtle}`}>
                    CORE BELIEFS & STANDARDS
                  </h4>
                </div>
                
                <ul className="space-y-6">
                  {data.values.map((val, index) => (
                    <li key={val.id} className="flex gap-4 items-start group">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 transition-colors bg-orange-50 border-orange-100 text-orange-700">
                        {renderIcon(val.icon, "w-4.5 h-4.5")}
                      </div>
                      <div>
                        {renderEditableText({
                          as: 'h5',
                          value: val.title,
                          section: 'about',
                          className: `font-serif text-[14px] font-bold ${theme.textPrimary}`,
                          onChange: (value) => updateValueItem(index, 'title', value),
                        })}
                        {renderEditableText({
                          as: 'p',
                          value: val.description,
                          section: 'about',
                          multiline: true,
                          className: `font-sans ${getTextSizeClass('cardDescription', val.textSettings)} ${theme.textMuted} leading-relaxed mt-1`,
                          onChange: (value) => updateValueItem(index, 'description', value),
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

        </section>

        {/* Specialized Pursuits - Displayed below in a gorgeous full-width row */}
        <section
          className={`space-y-6 ${getEditHighlightClass('pursuits')}`}
          id="pursuits-section"
          {...getSectionInteractionProps('pursuits')}
        >
          <div className={`rounded-3xl border p-8 md:p-10 text-left space-y-6 ${theme.card}`}>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <h4 className={`font-mono text-[9px] font-black uppercase tracking-widest ${theme.textSubtle}`}>
                SPECIALIZED PURSUITS
              </h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-1">
              {data.hobbies.map((hob, index) => (
                <div key={hob.id} className="text-left space-y-2 group">
                  <div className={`${getImageSizeClass('hobby', hob.imageSettings)} group/image rounded-2xl overflow-hidden bg-stone-100 relative border border-stone-200/40 shadow-xs`}>
                    {hob.imageUrl && (
                      <img
                        src={hob.imageUrl}
                        alt={hob.title}
                        className={`w-full h-full ${getImageFitClass(hob.imageSettings)} ${getImagePositionClass(hob.imageSettings)} group-hover:scale-105 transition-transform duration-500`}
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="absolute top-3 left-3 bg-stone-900/85 backdrop-blur-xs w-6 h-6 rounded-md flex items-center justify-center text-amber-100 border border-stone-800 shadow-xs">
                      {renderIcon(hob.icon, "w-3.5 h-3.5 text-amber-400")}
                    </div>
                    {renderChangePictureButton({ section: 'pursuits', itemIndex: index, itemId: hob.id })}
                  </div>
                  {renderEditableText({
                    as: 'h5',
                    value: hob.title,
                    section: 'pursuits',
                    className: `font-serif text-xs font-black pt-1 transition-colors ${theme.textPrimary}`,
                    onChange: (value) => updateHobbyItem(index, 'title', value),
                  })}
                  {renderEditableText({
                    as: 'p',
                    value: hob.description,
                    section: 'pursuits',
                    multiline: true,
                    className: `font-sans ${getTextSizeClass('cardDescription', hob.textSettings)} ${theme.textMuted} leading-relaxed line-clamp-3`,
                    onChange: (value) => updateHobbyItem(index, 'description', value),
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. CHRONOLOGICAL TIMELINE (With Integrated Media Cards)   */}
        {/* ========================================================= */}
        <section
          className={`space-y-6 ${getEditHighlightClass('timeline')}`}
          id="timeline-section"
          {...getSectionInteractionProps('timeline')}
        >
          
          {/* Section Header */}
          <div className="text-left max-w-2xl">
            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-mono text-[9px] tracking-widest font-black uppercase rounded-sm inline-block mb-3">
              03 / CHRONOLOGY OF ERAS
            </span>
            <h2 className={`${getHeadingFont()} text-3xl md:text-4xl font-black tracking-tight ${theme.textPrimary}`}>
              {sectionCopy.timeline.title}
            </h2>
            {renderEditableText({
              as: 'p',
              value: sectionCopy.timeline.description,
              section: 'timeline',
              multiline: true,
              className: `font-sans ${getTextSizeClass('sectionDescription', sectionCopy.timeline.descriptionTextSettings)} ${theme.textMuted} mt-1.5`,
              onChange: (value) => updateSectionDescription('timeline', value),
            })}
          </div>

          {/* Timeline Backbone */}
          <div className="relative border-l-2 border-stone-300/40 ml-4 md:ml-10 pl-8 md:pl-16 space-y-6 py-1">
            
            {data.timeline.map((milestone, idx) => (
              <div key={milestone.id} className="relative text-left group">
                
                {/* Visual Timeline Node */}
                <div className="absolute -left-[41px] md:-left-[73px] top-2 w-6 h-6 rounded-full bg-white border-4 flex items-center justify-center shadow-xs transition-colors group-hover:border-amber-600 border-amber-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                </div>

                {/* Milestone Container Split */}
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-2xl border p-6 transition-colors duration-300 ${theme.card} ${theme.accentHover}`}>
                  
                  {/* Left block of Milestone Card */}
                  <div className={`${milestone.imageUrl ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-2`}>
                    {renderEditableText({
                      value: milestone.year,
                      section: 'timeline',
                      className: 'px-2.5 py-1 bg-stone-900 text-amber-50 text-[9px] font-mono font-black tracking-widest rounded-md block w-fit',
                      onChange: (value) => updateTimelineItem(idx, { year: value }),
                    })}
                    {renderEditableText({
                      as: 'h3',
                      value: milestone.title,
                      section: 'timeline',
                      className: `font-serif text-lg md:text-xl font-bold leading-tight ${theme.textPrimary}`,
                      onChange: (value) => updateTimelineItem(idx, { title: value }),
                    })}
                    <div className="flex items-center gap-1 opacity-70 text-[10px] font-mono uppercase tracking-widest">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      {renderEditableText({
                        value: milestone.location,
                        section: 'timeline',
                        onChange: (value) => updateTimelineItem(idx, { location: value }),
                      })}
                    </div>

                    {/* Integrated Historical Image (if provided) */}
                    {milestone.imageUrl && (
                      <div className="pt-2">
                        <div className={`${getImageSizeClass('timeline', milestone.imageSettings)} group/image rounded-xl overflow-hidden p-1 shadow-xs relative ${theme.imageFrame}`}>
                          <img 
                            src={milestone.imageUrl} 
                            alt={milestone.title} 
                            className={`w-full h-full ${getImageFitClass(milestone.imageSettings)} ${getImagePositionClass(milestone.imageSettings)} rounded-lg filter sepia-[0.1]`}
                            referrerPolicy="no-referrer"
                          />
                          {renderChangePictureButton({ section: 'timeline', itemIndex: idx, itemId: milestone.id })}
                        </div>
                        {milestone.imageCaption && renderEditableText({
                            as: 'p',
                            value: milestone.imageCaption,
                            section: 'timeline',
                            multiline: true,
                            className: `font-mono text-[8px] ${theme.textSubtle} mt-1 leading-normal italic`,
                            onChange: (value) => updateTimelineItem(idx, { imageCaption: value }),
                          })}
                      </div>
                    )}
                  </div>

                  {/* Right block of Milestone Card */}
                  <div className={`${milestone.imageUrl ? 'lg:col-span-8' : 'lg:col-span-9'} ${getTextSizeClass('timelineBody', milestone.textSettings)} leading-relaxed ${theme.textSecondary} border-t lg:border-t-0 lg:border-l ${theme.sectionBorder} pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-start lg:justify-between space-y-3 lg:space-y-0 lg:h-full`}>
                    {renderEditableText({
                      as: 'p',
                      value: milestone.description,
                      section: 'timeline',
                      multiline: true,
                      className: `italic ${theme.textPrimary}`,
                      onChange: (value) => updateTimelineItem(idx, { description: value }),
                    })}
                    
                    <div className={`space-y-2 rounded-xl border p-4 ${theme.mutedPanel}`}>
                      <h4 className={`font-mono text-[9px] font-extrabold tracking-widest uppercase ${theme.textSubtle}`}>
                        ACHIEVEMENTS / RECOLLECTIONS
                      </h4>
                      <ul className={`list-none space-y-1.5 font-sans ${getTextSizeClass('detail', milestone.textSettings)}`}>
                        {milestone.details.map((detail, dIdx) => (
                          <li key={dIdx} className={`flex gap-2 items-start ${theme.textSecondary}`}>
                            <span className="text-amber-600 font-bold shrink-0 mt-0.5">▪</span>
                            {renderEditableText({
                              value: detail,
                              section: 'timeline',
                              multiline: true,
                              onChange: (value) => {
                                const nextDetails = [...milestone.details];
                                nextDetails[dIdx] = value;
                                updateTimelineItem(idx, { details: nextDetails });
                              },
                            })}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. MULTIMEDIA GALLERY (Dense 6-Item Aesthetic Polaroid Grid)*/}
        {/* ========================================================= */}
        <section
          className={`space-y-12 ${getEditHighlightClass('gallery')}`}
          id="gallery-section"
          {...getSectionInteractionProps('gallery')}
        >
          
          {/* Section Header */}
          <div className="text-left max-w-2xl">
            <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 font-mono text-[9px] tracking-widest font-black uppercase rounded-sm inline-block mb-3">
              04 / MULTIMEDIA ARCHIVES
            </span>
            <h2 className={`${getHeadingFont()} text-3xl md:text-4xl font-black tracking-tight ${theme.textPrimary}`}>
              {sectionCopy.gallery.title}
            </h2>
            {renderEditableText({
              as: 'p',
              value: sectionCopy.gallery.description,
              section: 'gallery',
              multiline: true,
              className: `font-sans ${getTextSizeClass('sectionDescription', sectionCopy.gallery.descriptionTextSettings)} ${theme.textMuted} mt-1.5`,
              onChange: (value) => updateSectionDescription('gallery', value),
            })}
          </div>

          {/* Cards Gallery Layout */}
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.gallery.map((item, idx) => (
              <div 
                key={item.id} 
                className={`rounded-2xl border p-4 text-left group transition-all duration-300 flex flex-col ${theme.card} ${theme.accentHover} hover:shadow-md`}
              >
                <div>
                  <div className={`${getImageSizeClass('gallery', item.imageSettings)} group/image rounded-xl overflow-hidden bg-stone-100 mb-4 border border-stone-200/20 relative`}>
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className={`w-full h-full ${getImageFitClass(item.imageSettings)} ${getImagePositionClass(item.imageSettings)} group-hover:scale-103 transition-all duration-500 filter contrast-[1.02]`}
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-xs px-2 py-0.5 text-[8px] font-mono text-white rounded-md tracking-wider">
                      {item.category.toUpperCase()}
                    </span>
                    {renderChangePictureButton({ section: 'gallery', itemIndex: idx, itemId: item.id })}
                  </div>
                  
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-mono text-[9px] uppercase tracking-widest font-black ${theme.highlight}`}>
                      {item.category} RECORD
                    </span>
                    {item.year && (
                      <span className={`font-mono text-[9px] font-bold ${theme.textSubtle}`}>
                        EST.{' '}
                        {renderEditableText({
                          value: item.year,
                          section: 'gallery',
                          onChange: (value) => updateGalleryItem(idx, { year: value }),
                        })}
                      </span>
                    )}
                  </div>
                  
                  {renderEditableText({
                    as: 'h4',
                    value: item.title,
                    section: 'gallery',
                    className: `font-serif text-base font-bold ${theme.textPrimary}`,
                    onChange: (value) => updateGalleryItem(idx, { title: value }),
                  })}
                </div>
                
                {renderEditableText({
                  as: 'p',
                  value: item.caption,
                  section: 'gallery',
                  multiline: true,
                  className: `font-sans ${getTextSizeClass('caption', item.textSettings)} ${theme.textMuted} mt-3 break-words border-t ${theme.sectionBorder} pt-2.5 leading-relaxed line-clamp-4`,
                  onChange: (value) => updateGalleryItem(idx, { caption: value }),
                })}
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. NARRATIVES & MEMORIES (Detailed Stories Trilogy)       */}
        {/* ========================================================= */}
        <section
          className={`space-y-12 animate-fade-in ${getEditHighlightClass('stories')}`}
          id="stories-section"
          {...getSectionInteractionProps('stories')}
        >
          
          {/* Section Header */}
          <div className="text-left max-w-2xl">
            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-mono text-[9px] tracking-widest font-black uppercase rounded-sm inline-block mb-3">
              05 / CHRONICLE NARRATIVES
            </span>
            <h2 className={`${getHeadingFont()} text-3xl md:text-4xl font-black tracking-tight ${theme.textPrimary}`}>
              {sectionCopy.stories.title}
            </h2>
            {renderEditableText({
              as: 'p',
              value: sectionCopy.stories.description,
              section: 'stories',
              multiline: true,
              className: `font-sans ${getTextSizeClass('sectionDescription', sectionCopy.stories.descriptionTextSettings)} ${theme.textMuted} mt-1.5`,
              onChange: (value) => updateSectionDescription('stories', value),
            })}
          </div>

          {/* Stories Blog Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {data.stories.map((story, index) => (
              <article 
                key={story.id} 
                className={`rounded-3xl overflow-hidden border flex flex-col justify-between text-left group transition-all duration-300 ${theme.card} ${theme.accentHover} hover:shadow-md`}
              >
                <div>
                  {/* Image Preview */}
                  <div className={`${getImageSizeClass('story', story.imageSettings)} group/image overflow-hidden bg-stone-100 relative shrink-0`}>
                    {story.imageUrl && (
                      <img
                        src={story.imageUrl}
                        alt={story.title}
                        className={`w-full h-full ${getImageFitClass(story.imageSettings)} ${getImagePositionClass(story.imageSettings)} group-hover:scale-101 transition-transform duration-500`}
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {renderEditableText({
                      value: story.category,
                      section: 'stories',
                      className: 'absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs px-2.5 py-1 text-[8px] font-mono text-amber-200 rounded-md tracking-wider uppercase font-black',
                      onChange: (value) => updateStoryItem(index, 'category', value),
                    })}
                    {renderChangePictureButton({ section: 'stories', itemIndex: index, itemId: story.id })}
                  </div>

                  {/* Text content area */}
                  <div className="p-6 space-y-3">
                    <div className={`flex items-center justify-between text-[9px] font-mono ${theme.textSubtle}`}>
                      {renderEditableText({
                        value: story.readTime,
                        section: 'stories',
                        className: 'font-bold uppercase tracking-wider text-orange-600',
                        onChange: (value) => updateStoryItem(index, 'readTime', value),
                      })}
                      {renderEditableText({
                        value: story.date,
                        section: 'stories',
                        onChange: (value) => updateStoryItem(index, 'date', value),
                      })}
                    </div>

                    {renderEditableText({
                      as: 'h3',
                      value: story.title,
                      section: 'stories',
                      className: `font-serif text-lg font-bold leading-tight transition-colors ${theme.textPrimary}`,
                      onChange: (value) => updateStoryItem(index, 'title', value),
                    })}

                    {renderEditableText({
                      as: 'p',
                      value: story.shortDescription,
                      section: 'stories',
                      multiline: true,
                      className: `font-sans ${theme.textSecondary} ${getTextSizeClass('detail', story.textSettings)} leading-relaxed line-clamp-4`,
                      onChange: (value) => updateStoryItem(index, 'shortDescription', value),
                    })}
                  </div>
                </div>

                {/* Footer action link */}
                <div className={`px-6 py-4 border-t flex items-center justify-between mt-4 ${theme.cardFooter}`}>
                  <span className={`font-mono text-[8px] font-bold uppercase tracking-widest ${theme.textSubtle}`}>
                    CHRONICLE ARCHIVE
                  </span>
                  <div className={`flex items-center gap-1.5 font-sans font-bold text-xs uppercase tracking-wider transition-colors ${theme.textSecondary}`}>
                    <span>Archived Log</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                </div>

              </article>
            ))}
          </div>

        </section>

        {showContactSection && (
        <>
          {/* ========================================================= */}
          {/* 6. CONTACT SECTION (Rustic Oregon Cabin Postbox Theme)    */}
          {/* ========================================================= */}
          <section
          className={`rounded-3xl border p-8 md:p-12 ${theme.card} ${getEditHighlightClass('contact')}`}
          id="contact-section"
          {...getSectionInteractionProps('contact')}
        >
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch text-left">
            
            {/* Contact text and details (Col: 5/12) */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-mono text-[9px] tracking-widest font-black uppercase rounded-sm inline-block">
                    06 / REACH OUT
                  </span>
                  <h2 className={`${getHeadingFont()} text-3xl font-black ${theme.textPrimary}`}>
                    {sectionCopy.contact.title}
                  </h2>
                  {renderEditableText({
                    as: 'p',
                    value: sectionCopy.contact.description,
                    section: 'contact',
                    multiline: true,
                    className: `font-sans ${getTextSizeClass('detail', sectionCopy.contact.descriptionTextSettings)} ${theme.textMuted} leading-relaxed`,
                    onChange: (value) => updateSectionDescription('contact', value),
                  })}
                </div>

                {/* Contact Detail Card */}
                <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${theme.innerCard}`}>
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`font-mono text-[8px] block font-bold ${theme.textSubtle}`}>CABIN MAILBOX</span>
                    {renderEditableText({
                      value: contactEmail,
                      section: 'contact',
                      className: `font-sans text-xs font-bold hover:underline cursor-pointer ${theme.textPrimary}`,
                      onChange: (value) => updatePersonalDetail('contactEmail', value),
                    })}
                  </div>
                </div>
              </div>

              {/* Social Channels List */}
              {showSocialLinks && (
                <div className="space-y-3">
                  <h4 className={`font-mono text-[9px] uppercase tracking-widest font-extrabold ${theme.textSubtle}`}>
                    CONNECT ON SOCIAL STATIONS
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <span className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all duration-300 cursor-pointer ${theme.innerCard} ${theme.socialLink}`}>
                      <Instagram className={`w-4 h-4 ${theme.iconMuted}`} />
                      {renderEditableText({
                        value: instagramHandle,
                        section: 'contact',
                        className: 'font-sans text-xs font-semibold',
                        onChange: (value) => updatePersonalDetail('instagramHandle', value),
                      })}
                    </span>
                    
                    <span className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all duration-300 cursor-pointer ${theme.innerCard} ${theme.socialLink}`}>
                      <Twitter className={`w-4 h-4 ${theme.iconMuted}`} />
                      {renderEditableText({
                        value: twitterHandle,
                        section: 'contact',
                        className: 'font-sans text-xs font-semibold',
                        onChange: (value) => updatePersonalDetail('twitterHandle', value),
                      })}
                    </span>

                    <span className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all duration-300 cursor-pointer ${theme.innerCard} ${theme.socialLink}`}>
                      <Facebook className={`w-4 h-4 ${theme.iconMuted}`} />
                      {renderEditableText({
                        value: facebookLabel,
                        section: 'contact',
                        className: 'font-sans text-xs font-semibold',
                        onChange: (value) => updatePersonalDetail('facebookLabel', value),
                      })}
                    </span>

                    <span className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all duration-300 cursor-pointer ${theme.innerCard} ${theme.socialLink}`}>
                      <Linkedin className={`w-4 h-4 ${theme.iconMuted}`} />
                      {renderEditableText({
                        value: linkedinLabel,
                        section: 'contact',
                        className: 'font-sans text-xs font-semibold',
                        onChange: (value) => updatePersonalDetail('linkedinLabel', value),
                      })}
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Contact Form Container */}
            <div className={`lg:col-span-7 border p-6 md:p-8 rounded-2xl relative flex flex-col justify-center h-full ${theme.quoteCard}`}>
              {!allowContactMessages ? (
                <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-8 text-center">
                  <Mail className="mx-auto h-7 w-7 text-amber-600" />
                  <h3 className={`mt-4 font-serif text-xl font-bold ${theme.textPrimary}`}>
                    Contact Messages Are Closed
                  </h3>
                  <p className={`mx-auto mt-2 max-w-sm font-sans text-xs leading-relaxed ${theme.textSecondary}`}>
                    This biography is not accepting public contact messages right now.
                  </p>
                </div>
              ) : isSubmitted ? (
                <div className="bg-emerald-50/50 border border-emerald-200/60 p-8 rounded-xl text-center space-y-4 my-8">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                    <Send className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className={`font-serif text-xl font-bold ${theme.textPrimary}`}>Message Sent!</h3>
                  <p className={`font-sans text-xs max-w-sm mx-auto leading-relaxed ${theme.textSecondary}`}>
                    Thank you for writing. Your message has been received at the shore cabin mailbox. Julian will respond as soon as his hands are clear of saw work.
                  </p>
                  <button 
                    type="button" 
                    onClick={() => setIsSubmitted(false)}
                    className="mt-2 text-xs font-mono font-bold text-emerald-700 hover:text-emerald-800 underline transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className={`font-serif text-lg font-bold mb-6 ${theme.textPrimary}`}>
                    Send a Message to the Cabin
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={`font-mono text-[9px] font-extrabold uppercase ${theme.textSubtle}`}>
                          YOUR FULL NAME *
                        </label>
                        <input 
                           type="text" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Sarah Miller" 
                          className={`w-full rounded-lg p-3 ${theme.input}`}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className={`font-mono text-[9px] font-extrabold uppercase ${theme.textSubtle}`}>
                          YOUR EMAIL ADDRESS *
                        </label>
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. sarah@example.com" 
                          className={`w-full rounded-lg p-3 ${theme.input}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`font-mono text-[9px] font-extrabold uppercase ${theme.textSubtle}`}>
                        SUBJECT OF INQUIRY
                      </label>
                      <input 
                        type="text" 
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g. Heirloom Walnut Table Commission" 
                        className={`w-full rounded-lg p-3 ${theme.input}`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`font-mono text-[9px] font-extrabold uppercase ${theme.textSubtle}`}>
                        YOUR LETTER MESSAGE *
                      </label>
                      <textarea 
                        rows={4} 
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Type your message with clean hands..." 
                        className={`w-full rounded-lg p-3 resize-none ${theme.input}`}
                      />
                    </div>

                    {submitError && (
                      <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
                        {submitError}
                      </p>
                    )}

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-stone-900 hover:bg-stone-800 text-amber-100 p-3.5 rounded-lg font-bold tracking-wider uppercase text-xs inline-flex items-center justify-center gap-2 border border-stone-800 transition-colors disabled:opacity-55 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                    </button>

                  </form>
                </>
              )}
            </div>

          </div>
          </section>
        </>
        )}

      </div>

      {/* ========================================================= */}
      {/* GLOBAL FOOTER                                             */}
      {/* ========================================================= */}
      <footer className={`w-full border-t py-12 shrink-0 ${theme.footer}`}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-8 text-left">
          
          <div className="flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-orange-800 shrink-0 bg-orange-50">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-[9px] opacity-60 uppercase tracking-widest font-extrabold block">
                {data.personalDetails.fullName.toUpperCase()} // HISTORICAL ARCHIVE
              </span>
              <p className="font-sans text-[11px] opacity-50 mt-0.5">
                Honoring traditional forestry, hand joinery, and maritime vessel architecture.
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <span className="font-mono text-[9px] opacity-60 uppercase tracking-widest block font-black">
              COOS BAY TO CANNON BEACH // OREGON LANDS
            </span>
            <p className="font-sans text-[11px] opacity-50">
              &copy; 2026 {data.personalDetails.fullName}. Built with respect to the redwood forests.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
