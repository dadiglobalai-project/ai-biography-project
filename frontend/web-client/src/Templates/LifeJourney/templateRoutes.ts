import type { BiographyCategory } from './types';
import {
  CANONICAL_BIOGRAPHY_TEMPLATES,
  getCanonicalTemplate,
  type CanonicalTemplateId,
} from '../../data/biographyTemplates';

export interface BiographyTemplateRoute {
  categoryKey: BiographyCategory['id'];
  id: string;
  title: string;
}

export const BIOGRAPHY_TEMPLATE_ROUTES: Record<string, BiographyTemplateRoute> = {
  'visionary-legacy': {
    categoryKey: 'visionary',
    id: 'visionary-legacy',
    title: CANONICAL_BIOGRAPHY_TEMPLATES['visionary-legacy'].title,
  },
  'life-journey': {
    categoryKey: 'life',
    id: 'life-journey',
    title: CANONICAL_BIOGRAPHY_TEMPLATES['life-journey'].title,
  },
  'entrepreneur-story': {
    categoryKey: 'entrepreneur',
    id: 'entrepreneur-story',
    title: CANONICAL_BIOGRAPHY_TEMPLATES['entrepreneur-story'].title,
  },
  'legacy-heritage': {
    categoryKey: 'life',
    id: 'legacy-heritage',
    title: CANONICAL_BIOGRAPHY_TEMPLATES['legacy-heritage'].title,
  },
  'nature-serenity': {
    categoryKey: 'life',
    id: 'nature-serenity',
    title: CANONICAL_BIOGRAPHY_TEMPLATES['nature-serenity'].title,
  },
};

export function getBiographyTemplateRoute(templateId?: string) {
  const canonicalTemplate = getCanonicalTemplate(templateId);
  const routeId = canonicalTemplate?.id as CanonicalTemplateId | undefined;

  return BIOGRAPHY_TEMPLATE_ROUTES[routeId || templateId || ''] ?? BIOGRAPHY_TEMPLATE_ROUTES['life-journey'];
}
