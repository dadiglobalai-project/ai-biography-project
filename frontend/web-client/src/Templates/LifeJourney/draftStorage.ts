import { CATEGORIES_DATA } from './data';
import type { BiographyCategory } from './types';

export const getTemplateDraftStorageKey = (templateId: string) => `xinghuoji.${templateId}.templateDraft`;

export const getWebsiteDraftStorageKey = (websiteId: string) =>
  `xinghuoji.website.${websiteId}.templateDraft`;

export const getDraftStorageKey = (templateId: string, websiteId?: string) =>
  websiteId ? getWebsiteDraftStorageKey(websiteId) : getTemplateDraftStorageKey(templateId);

export const cloneTemplateData = (categoryKey: BiographyCategory['id']): BiographyCategory =>
  JSON.parse(JSON.stringify(CATEGORIES_DATA[categoryKey])) as BiographyCategory;

export const mergeDraft = (
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
    sectionCopy: {
      ...baseline.sectionCopy,
      ...savedDraft.sectionCopy,
    },
  };
};

export const loadDraft = (
  templateId: string,
  categoryKey: BiographyCategory['id'],
  websiteId?: string
): BiographyCategory => {
  try {
    const websiteDraft = websiteId ? window.localStorage.getItem(getWebsiteDraftStorageKey(websiteId)) : null;
    const templateDraft = window.localStorage.getItem(getTemplateDraftStorageKey(templateId));
    const saved = websiteDraft || templateDraft;

    return saved ? mergeDraft(JSON.parse(saved) as BiographyCategory, categoryKey) : cloneTemplateData(categoryKey);
  } catch {
    return cloneTemplateData(categoryKey);
  }
};

export const saveDraft = (templateId: string, draft: BiographyCategory, websiteId?: string) => {
  window.localStorage.setItem(getDraftStorageKey(templateId, websiteId), JSON.stringify(draft));
};

export const removeTemplateDraft = (templateId: string) => {
  window.localStorage.removeItem(getTemplateDraftStorageKey(templateId));
};

export const removeDraft = (templateId: string, websiteId?: string) => {
  window.localStorage.removeItem(getDraftStorageKey(templateId, websiteId));
};
