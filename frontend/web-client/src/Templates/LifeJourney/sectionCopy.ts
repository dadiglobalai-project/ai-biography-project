import type { EditableSectionCopy, EditableSectionCopyKey } from './types';

export const DEFAULT_SECTION_COPY: Record<EditableSectionCopyKey, EditableSectionCopy> = {
  about: {
    title: 'Chronicle & Values',
    description:
      'An overview of the journey, the philosophical values guiding my work, and the creative avenues that complete my life.',
  },
  timeline: {
    title: 'Life Journey Timeline',
    description:
      'A historical progression of key milestones, breakthroughs, and memories captured along the years.',
  },
  gallery: {
    title: 'The Media Gallery',
    description:
      "An aesthetic grid of actual work logs, sketches, ocean voyages, and antique workbench elements from my life's studio.",
  },
  stories: {
    title: 'Memories & Stories',
    description: 'Rich narrative logs sharing profound lessons, ocean storms, and timber salvages.',
  },
  contact: {
    title: 'Get in Touch',
    description:
      'Have questions about custom carpenter commissions, heritage wooden boat builds, mentorship applications, or just want to swap coast stories? Send a message.',
  },
};

export function getSectionCopy(sectionCopy?: Partial<Record<EditableSectionCopyKey, EditableSectionCopy>>) {
  return {
    about: { ...DEFAULT_SECTION_COPY.about, ...sectionCopy?.about },
    timeline: { ...DEFAULT_SECTION_COPY.timeline, ...sectionCopy?.timeline },
    gallery: { ...DEFAULT_SECTION_COPY.gallery, ...sectionCopy?.gallery },
    stories: { ...DEFAULT_SECTION_COPY.stories, ...sectionCopy?.stories },
    contact: { ...DEFAULT_SECTION_COPY.contact, ...sectionCopy?.contact },
  };
}
