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
  const mergeCopy = (section: EditableSectionCopyKey): EditableSectionCopy => ({
    title: DEFAULT_SECTION_COPY[section].title,
    description: sectionCopy?.[section]?.description ?? DEFAULT_SECTION_COPY[section].description,
  });

  return {
    about: mergeCopy('about'),
    timeline: mergeCopy('timeline'),
    gallery: mergeCopy('gallery'),
    stories: mergeCopy('stories'),
    contact: mergeCopy('contact'),
  };
}
