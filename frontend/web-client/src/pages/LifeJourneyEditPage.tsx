import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Palette,
  RotateCcw,
  Save,
  Sparkles,
  Type,
} from 'lucide-react';
import LifeJourneyTemplate from '../Templates/LifeJourney/LifeJourneyTemplate';
import { CATEGORIES_DATA } from '../Templates/LifeJourney/data';
import type {
  BiographyCategory,
  CustomizerSettings,
  PersonalDetails,
} from '../Templates/LifeJourney/types';

const STORAGE_KEY = 'xinghuoji.lifeJourney.templateDraft';

const cloneLifeJourneyData = (): BiographyCategory =>
  JSON.parse(JSON.stringify(CATEGORIES_DATA.life)) as BiographyCategory;

const mergeDraft = (savedDraft: BiographyCategory): BiographyCategory => {
  const baseline = cloneLifeJourneyData();

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

const loadDraft = (): BiographyCategory => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? mergeDraft(JSON.parse(saved) as BiographyCategory) : cloneLifeJourneyData();
  } catch {
    return cloneLifeJourneyData();
  }
};

const personalFields: Array<{
  field: keyof PersonalDetails;
  label: string;
  multiline?: boolean;
}> = [
  { field: 'fullName', label: 'Full name' },
  { field: 'occupation', label: 'Occupation' },
  { field: 'tagline', label: 'Tagline', multiline: true },
  { field: 'birthDetails', label: 'Birth details' },
  { field: 'location', label: 'Location' },
  { field: 'shortIntro', label: 'Short intro', multiline: true },
  { field: 'bioFull', label: 'Biography', multiline: true },
  { field: 'signatureQuote', label: 'Signature quote', multiline: true },
];

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100';

export default function LifeJourneyEditPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<BiographyCategory>(() => loadDraft());
  const [saveMessage, setSaveMessage] = useState('Unsaved changes');

  React.useEffect(() => {
    document.title = 'Edit Life Journey | Xinghuoji';
  }, []);

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

  const handleSave = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setSaveMessage('Saved locally');
  };

  const handleReset = () => {
    const originalDraft = cloneLifeJourneyData();
    window.localStorage.removeItem(STORAGE_KEY);
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
                Life Journey
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
              {saveMessage}
            </span>
            <button
              type="button"
              onClick={() => navigate('/diy-dashboard/templates/life-journey/preview')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-slate-900"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
          </div>
        </div>
      </header>

      <main className="grid lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200 bg-white">
          <div className="space-y-8 p-5 lg:sticky lg:top-[73px] lg:max-h-[calc(100vh-73px)] lg:overflow-y-auto lg:p-6">
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="h-4 w-4 text-[#B18625]" />
                <h2 className="text-sm font-bold text-slate-900">Identity</h2>
              </div>

              <div className="space-y-4">
                {personalFields.map((item) => (
                  <label key={item.field} className="block space-y-1.5">
                    <span className="text-xs font-bold text-slate-500">{item.label}</span>
                    {item.multiline ? (
                      <textarea
                        rows={item.field === 'bioFull' ? 7 : 3}
                        value={draft.personalDetails[item.field]}
                        onChange={(event) => updatePersonalDetail(item.field, event.target.value)}
                        className={`${inputClass} resize-y leading-relaxed`}
                      />
                    ) : (
                      <input
                        type="text"
                        value={draft.personalDetails[item.field]}
                        onChange={(event) => updatePersonalDetail(item.field, event.target.value)}
                        className={inputClass}
                      />
                    )}
                  </label>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Palette className="h-4 w-4 text-[#B18625]" />
                <h2 className="text-sm font-bold text-slate-900">Style</h2>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-500">Theme</span>
                <select
                  value={draft.settings.theme}
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
                  onChange={(event) =>
                    updateSettings('spacing', event.target.value as CustomizerSettings['spacing'])
                  }
                  className={inputClass}
                >
                  <option value="spacious">Spacious</option>
                  <option value="compact">Compact</option>
                </select>
              </label>
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

          <LifeJourneyTemplate dataOverride={draft} />
        </section>
      </main>
    </div>
  );
}
