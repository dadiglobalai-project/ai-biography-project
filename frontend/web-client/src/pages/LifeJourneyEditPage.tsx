import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Eye,
  Image as ImageIcon,
  Mail,
  MessageSquare,
  Palette,
  RotateCcw,
  Save,
  Sparkles,
  Type,
  UserRound,
} from 'lucide-react';
import LifeJourneyTemplate from '../Templates/LifeJourney/LifeJourneyTemplate';
import { CATEGORIES_DATA } from '../Templates/LifeJourney/data';
import { getBiographyTemplateRoute } from '../Templates/LifeJourney/templateRoutes';
import { authService } from '../services/authService';
import type { BiographyWebsite, SubjectType } from '../services/authService';
import type {
  BiographyCategory,
  CustomizerSettings,
  EditableTemplateSection,
  GalleryItem,
  HobbyItem,
  MemoryStory,
  PersonalDetails,
  TimelineMilestone,
  ValueItem,
} from '../Templates/LifeJourney/types';

const BIOGRAPHY_LIST_REFRESH_KEY = 'xinghuoji.biographies.changed';
const SUBJECT_TYPES: SubjectType[] = ['SELF', 'PARENT', 'GRANDPARENT', 'CHILD', 'SPOUSE', 'LOVED_ONE'];

const getStorageKey = (templateId: string) => `xinghuoji.${templateId}.templateDraft`;

const cloneTemplateData = (categoryKey: BiographyCategory['id']): BiographyCategory =>
  JSON.parse(JSON.stringify(CATEGORIES_DATA[categoryKey])) as BiographyCategory;

const mergeDraft = (
  savedDraft: BiographyCategory,
  categoryKey: BiographyCategory['id']
): BiographyCategory => {
  const baseline = cloneTemplateData(categoryKey);

  return {
    ...baseline,
    ...savedDraft,
    settings: {
      ...baseline.settings,
      ...savedDraft.settings,
    },
    personalDetails: {
      ...baseline.personalDetails,
      ...savedDraft.personalDetails,
    },
    values: savedDraft.values ?? baseline.values,
    hobbies: savedDraft.hobbies ?? baseline.hobbies,
    timeline: savedDraft.timeline ?? baseline.timeline,
    gallery: savedDraft.gallery ?? baseline.gallery,
    stories: savedDraft.stories ?? baseline.stories,
  };
};

const loadDraft = (templateId: string, categoryKey: BiographyCategory['id']): BiographyCategory => {
  try {
    const saved = window.localStorage.getItem(getStorageKey(templateId));
    return saved ? mergeDraft(JSON.parse(saved) as BiographyCategory, categoryKey) : cloneTemplateData(categoryKey);
  } catch {
    return cloneTemplateData(categoryKey);
  }
};

type TextFieldConfig = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  section?: EditableTemplateSection;
};

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
    field: keyof PersonalDetails;
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
  timeline: [
    { field: 'birthDetails', label: 'Childhood / birth details' },
    { field: 'location', label: 'Present day location' },
  ],
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
  const [draft, setDraft] = useState<BiographyCategory>(() =>
    loadDraft(templateRoute.id, templateRoute.categoryKey)
  );
  const [website, setWebsite] = useState<BiographyWebsite | null>(null);
  const [saveMessage, setSaveMessage] = useState('Unsaved changes');
  const [isSaving, setIsSaving] = useState(false);
  const [activeEditorSection, setActiveEditorSection] = useState<EditableTemplateSection>('hero');
  const websiteId = searchParams.get('websiteId') || '';

  const focusPreviewSection = (section: EditableTemplateSection) => {
    setActiveEditorSection(section);
    window.requestAnimationFrame(() => {
      const previewSection = document.getElementById(`${section}-section`);
      previewSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
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

  const openPreviewPage = () => {
    const url = new URL(`/diy-dashboard/templates/${templateRoute.id}/preview`, window.location.origin);
    const currentWebsiteId = website?.id || websiteId;
    if (currentWebsiteId) {
      url.searchParams.set('websiteId', currentWebsiteId);
    }

    const opened = window.open(url.toString(), '_blank', 'noopener,noreferrer');
    if (!opened) {
      setSaveMessage('Your browser blocked the preview tab');
    }
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

  const updatePersonalDetail = (field: keyof PersonalDetails, value: string) => {
    setDraft((current) => ({
      ...current,
      personalDetails: {
        ...current.personalDetails,
        [field]: value,
      },
    }));
    setSaveMessage('Unsaved changes');
  };

  const updateValueItem = (index: number, field: keyof ValueItem, value: string) => {
    setDraft((current) => ({
      ...current,
      values: current.values.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
    setSaveMessage('Unsaved changes');
  };

  const updateHobbyItem = (index: number, field: keyof HobbyItem, value: string) => {
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

  const updateStoryItem = (index: number, field: keyof MemoryStory, value: string) => {
    setDraft((current) => ({
      ...current,
      stories: current.stories.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
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
    section = activeEditorSection,
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

  const renderPersonalFields = (
    section: Extract<EditableTemplateSection, 'hero' | 'about' | 'timeline' | 'contact'>
  ) => (
    <div className="space-y-4">
      {personalFieldsBySection[section].map((item) =>
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

  const renderSectionEditor = () => {
    switch (activeEditorSection) {
      case 'hero':
        return renderPersonalFields('hero');

      case 'about':
        return (
          <div className="space-y-6">
            {renderPersonalFields('about')}

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
                  {renderTextField({
                    label: `Interest ${index + 1} image URL`,
                    value: item.imageUrl,
                    section: 'about',
                    onChange: (value) => updateHobbyItem(index, 'imageUrl', value),
                  })}
                </div>
              ))}
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-6">
            {renderPersonalFields('timeline')}

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
                </div>
              ))}
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-4">
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
                {renderTextField({
                  label: `Gallery item ${index + 1} caption`,
                  value: item.caption,
                  multiline: true,
                  section: 'gallery',
                  onChange: (value) => updateGalleryItem(index, { caption: value }),
                })}
              </div>
            ))}
          </div>
        );

      case 'stories':
        return (
          <div className="space-y-4">
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
                {renderTextField({
                  label: `Story ${index + 1} short description`,
                  value: item.shortDescription,
                  multiline: true,
                  section: 'stories',
                  onChange: (value) => updateStoryItem(index, 'shortDescription', value),
                })}
              </div>
            ))}
          </div>
        );

      case 'contact':
        return renderPersonalFields('contact');

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
    window.localStorage.setItem(getStorageKey(templateRoute.id), JSON.stringify(draft));

    setIsSaving(true);
    setSaveMessage('Saving...');

    try {
      if (website?.id || websiteId) {
        notifyBiographyListChanged();
        setSaveMessage('Saved locally. Biography is in My Biographies');
        return;
      }

      const savedWebsite = await authService.createBiographyWebsite({
        title: getBiographyTitle(draft, templateRoute.title),
        templateId: templateRoute.id,
        subjectType: getSubjectType(searchParams.get('subjectType') || website?.subjectType),
      });

      setWebsite(savedWebsite);
      setSearchParams({ websiteId: savedWebsite.id }, { replace: true });
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
    window.localStorage.removeItem(getStorageKey(templateRoute.id));
    setDraft(originalDraft);
    setSaveMessage('Reset to original');
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
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
              {saveMessage}
            </span>
            <button
              type="button"
              onClick={openPreviewPage}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
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
        <aside className="border-r border-slate-200 bg-white">
          <div className="p-5 lg:sticky lg:top-[73px] lg:max-h-[calc(100vh-73px)] lg:overflow-y-auto lg:p-6">
            <section className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="h-4 w-4 text-[#B18625]" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Template Sections</h2>
                  <p className="text-[11px] text-slate-500">
                    Select the section you want to edit.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {editorSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeEditorSection === section.key;

                  return (
                    <button
                      key={section.key}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => focusPreviewSection(section.key)}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                        isActive
                          ? 'border-[#FED362] bg-[#FED362]/15 text-slate-950 shadow-sm'
                          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                          isActive
                            ? 'border-[#FED362] bg-white text-[#B18625]'
                            : 'border-slate-100 bg-slate-50 text-slate-500'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold uppercase tracking-wide">
                          {section.label}
                        </span>
                        <span className="block truncate text-[11px] text-slate-500">
                          {section.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-5">
                <div className="mb-4">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B18625]">
                    Editing
                  </p>
                  <h3 className="text-lg font-bold text-slate-950">
                    {editorSections.find((section) => section.key === activeEditorSection)?.label}
                  </h3>
                </div>

                {renderSectionEditor()}
              </div>
            </section>
          </div>
        </aside>

        <section className="min-w-0 bg-slate-100">
          <div className="sticky top-[73px] z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-100/95 px-4 py-3 backdrop-blur-md lg:px-6">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Live Preview
              </span>
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

          <LifeJourneyTemplate
            categoryKey={templateRoute.categoryKey}
            dataOverride={draft}
            activeEditSection={activeEditorSection}
            onDataChange={handleDraftChange}
            onEditSectionChange={setActiveEditorSection}
          />
        </section>
      </main>
    </div>
  );
}
