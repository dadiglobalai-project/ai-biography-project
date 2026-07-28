import React, { useState } from 'react';
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
import { authService } from '../services/authService';
import type { BiographyWebsite, SubjectType } from '../services/authService';
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

type PreviewViewport = 'desktop' | 'mobile';

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
    { field: 'profileImageUrl', label: 'Profile image URL' },
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

const getBiographyTitle = (draft: BiographyCategory, templateTitle: string) => {
  const name = draft.personalDetails.fullName.trim();
  return name ? `${name}'s ${templateTitle}` : `${templateTitle} Biography`;
};

const getSubjectType = (subjectType?: string): SubjectType => {
  return SUBJECT_TYPES.includes(subjectType as SubjectType) ? (subjectType as SubjectType) : 'SELF';
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
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>('desktop');
  const [activeEditorSection, setActiveEditorSection] = useState<EditableTemplateSection | null>(null);
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);
  const hasMountedDraftRef = React.useRef(false);
  const activeWebsiteId = website?.id || websiteId;

  const shouldUseMobileEditor = () => window.matchMedia('(max-width: 1023px)').matches;

  const focusPreviewSection = (section: EditableTemplateSection) => {
    setActiveEditorSection(section);
    window.requestAnimationFrame(() => {
      const previewSection = document.getElementById(`${section}-section`);
      previewSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const handleEditSectionChange = (section: EditableTemplateSection) => {
    setActiveEditorSection(section);
    if (shouldUseMobileEditor()) {
      setIsMobileEditorOpen(true);
    }
  };

  const handleOpenStyleEditor = () => {
    setActiveEditorSection('style');
    if (shouldUseMobileEditor()) {
      setIsMobileEditorOpen(true);
    }
  };

  const handleDraftChange: React.Dispatch<React.SetStateAction<BiographyCategory>> = (nextDraft) => {
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

  const previewPageUrl = React.useMemo(() => {
    const url = new URL(`/diy-dashboard/templates/${templateRoute.id}/preview`, window.location.origin);
    if (activeWebsiteId) {
      url.searchParams.set('websiteId', activeWebsiteId);
    }
    if (backendTemplateId) {
      url.searchParams.set('apiTemplateId', backendTemplateId);
    }

    return url.toString();
  }, [activeWebsiteId, backendTemplateId, templateRoute.id]);

  const openPreviewPage = () => {
    saveDraft(templateRoute.id, draft, activeWebsiteId);
  };

  React.useEffect(() => {
    if (!websiteId) {
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
                  {renderTextField({
                    label: `Interest ${index + 1} image URL`,
                    value: item.imageUrl,
                    section: 'about',
                    onChange: (value) => updateHobbyItem(index, 'imageUrl', value),
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
                  {renderTextField({
                    label: `Milestone ${index + 1} image URL`,
                    value: item.imageUrl || '',
                    section: 'timeline',
                    onChange: (value) => updateTimelineItem(index, { imageUrl: value }),
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
                {renderTextField({
                  label: `Gallery item ${index + 1} image / video URL`,
                  value: item.imageUrl,
                  section: 'gallery',
                  onChange: (value) => updateGalleryItem(index, { imageUrl: value }),
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
                {renderTextField({
                  label: `Story ${index + 1} image URL`,
                  value: item.imageUrl,
                  section: 'stories',
                  onChange: (value) => updateStoryItem(index, 'imageUrl', value),
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
      notifyBiographyListChanged();
      setSaveMessage('Saved to My Biographies');
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
                Template Editor
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
                className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-950 shadow-sm transition"
              >
                <PencilLine className="h-4 w-4" />
                Edit
              </button>
              <a
                href={previewPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={openPreviewPage}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500 transition hover:text-slate-900"
              >
                <Eye className="h-4 w-4" />
                Preview
              </a>
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

      <main className="grid lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="hidden border-r border-slate-200 bg-white lg:block">
          <div className="p-5 lg:sticky lg:top-[73px] lg:max-h-[calc(100vh-73px)] lg:overflow-y-auto lg:p-6">
            {renderEditorPanel('desktop')}
          </div>
        </aside>

        <section className="min-w-0 bg-slate-100">
          <div className="sticky top-[73px] z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-100/95 px-4 py-3 backdrop-blur-md lg:px-6">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-slate-500" />
              <div>
                <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Live Preview
                </span>
                <span className="block text-[11px] text-slate-500">
                  {previewViewport === 'mobile' ? 'Mobile width' : 'Desktop width'}
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
                  onClick={() => setPreviewViewport('mobile')}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${
                    previewViewport === 'mobile'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Mobile
                </button>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600 transition hover:border-rose-300 hover:text-rose-600"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>

          <div className={previewViewport === 'mobile' ? 'bg-slate-200 px-3 py-6 sm:px-6 lg:px-8' : ''}>
            <div
              className={
                previewViewport === 'mobile'
                  ? 'mx-auto max-w-[390px] overflow-hidden rounded-[2rem] border border-slate-300 bg-white shadow-2xl'
                  : ''
              }
            >
              <LifeJourneyTemplate
                categoryKey={templateRoute.categoryKey}
                dataOverride={draft}
                activeEditSection={activeEditorSection}
                onDataChange={handleDraftChange}
                onEditSectionChange={handleEditSectionChange}
              />
            </div>
          </div>
        </section>
      </main>

      {!isMobileEditorOpen && (
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

      {isMobileEditorOpen && (
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
