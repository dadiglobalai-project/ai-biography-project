export type CanonicalTemplateId =
  | 'life-journey'
  | 'entrepreneur-story'
  | 'legacy-heritage'
  | 'nature-serenity'
  | 'visionary-legacy';

export interface CanonicalBiographyTemplate {
  id: CanonicalTemplateId;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
}

export const CANONICAL_BIOGRAPHY_TEMPLATES: Record<CanonicalTemplateId, CanonicalBiographyTemplate> = {
  'life-journey': {
    id: 'life-journey',
    title: 'Life Journey',
    subtitle: 'A journey through the land',
    description: 'Complete autobiography template emphasizing chronologies, personal milestones, and wisdom gathered.',
    tag: 'Classic Memoir',
  },
  'entrepreneur-story': {
    id: 'entrepreneur-story',
    title: 'Entrepreneur Story',
    subtitle: 'Document your business adventures',
    description: 'Tailored for founders, pathfinders, and industry pioneers to archive their ventures, failures, and triumphs.',
    tag: 'Professional',
  },
  'legacy-heritage': {
    id: 'legacy-heritage',
    title: 'Legacy & Heritage',
    subtitle: 'Preserve a family archive',
    description: 'A warm scrapbook-style template for family legacies, heirloom memories, letters, and heritage stories.',
    tag: 'Heritage',
  },
  'nature-serenity': {
    id: 'nature-serenity',
    title: 'Nature & Serenity',
    subtitle: 'A quiet life in focus',
    description: 'A reflective nature-inspired template for peaceful memories, personal rituals, and meaningful life chapters.',
    tag: 'Reflective',
  },
  'visionary-legacy': {
    id: 'visionary-legacy',
    title: 'Visionary Legacy',
    subtitle: 'A monument to a life of ideas',
    description: 'A bold biography structure for leaders, innovators, and lifelong builders.',
    tag: 'Visionary',
  },
};

const normalizeTemplateLookupValue = (value?: string | null) =>
  value?.trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || '';

const TEMPLATE_ALIAS_TO_ID: Record<string, CanonicalTemplateId> = {
  'life-journey': 'life-journey',
  'personal-memoir': 'life-journey',
  'classic-memoir': 'life-journey',
  'love-union': 'life-journey',

  'entrepreneur-story': 'entrepreneur-story',
  'founder-story': 'entrepreneur-story',
  'business-legacy': 'entrepreneur-story',

  'legacy-heritage': 'legacy-heritage',
  'legacy-and-heritage': 'legacy-heritage',
  'family-legacy': 'legacy-heritage',
  'family-chronicle': 'legacy-heritage',
  'ancestor-chronicles': 'legacy-heritage',

  'nature-serenity': 'nature-serenity',
  'nature-and-serenity': 'nature-serenity',
  'growth-dreams': 'nature-serenity',
  'growth-and-dreams': 'nature-serenity',

  'visionary-legacy': 'visionary-legacy',
};

export function getCanonicalTemplateId(value?: string | null): CanonicalTemplateId | null {
  const normalizedValue = normalizeTemplateLookupValue(value);

  if (!normalizedValue) {
    return null;
  }

  return TEMPLATE_ALIAS_TO_ID[normalizedValue] || null;
}

export function getCanonicalTemplate(value?: string | null) {
  const templateId = getCanonicalTemplateId(value);
  return templateId ? CANONICAL_BIOGRAPHY_TEMPLATES[templateId] : null;
}

export function getCanonicalTemplateTitle(value?: string | null, fallback = 'Template') {
  return getCanonicalTemplate(value)?.title || fallback;
}

export function isCanonicalTemplateMatch(left?: string | null, right?: string | null) {
  const leftTemplateId = getCanonicalTemplateId(left);
  const rightTemplateId = getCanonicalTemplateId(right);

  if (leftTemplateId && rightTemplateId) {
    return leftTemplateId === rightTemplateId;
  }

  return normalizeTemplateLookupValue(left) === normalizeTemplateLookupValue(right);
}
