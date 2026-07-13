import type { BiographyCategory } from './types';

export interface BiographyTemplateRoute {
  categoryKey: BiographyCategory['id'];
  id: string;
  title: string;
}

export const BIOGRAPHY_TEMPLATE_ROUTES: Record<string, BiographyTemplateRoute> = {
  'visionary-legacy': {
    categoryKey: 'visionary',
    id: 'visionary-legacy',
    title: 'Visionary Legacy',
  },
  'life-journey': {
    categoryKey: 'life',
    id: 'life-journey',
    title: 'Life Journey',
  },
  'entrepreneur-story': {
    categoryKey: 'entrepreneur',
    id: 'entrepreneur-story',
    title: 'Entrepreneur Story',
  },
};

export function getBiographyTemplateRoute(templateId?: string) {
  return BIOGRAPHY_TEMPLATE_ROUTES[templateId || ''] ?? BIOGRAPHY_TEMPLATE_ROUTES['life-journey'];
}
