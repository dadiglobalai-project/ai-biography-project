export interface ValueItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface HobbyItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
}

export interface TimelineMilestone {
  id: string;
  year: string;
  era: 'youth' | 'middle' | 'recent';
  title: string;
  location: string;
  description: string;
  details: string[];
  imageUrl?: string;
  imageCaption?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'family' | 'career' | 'travel' | 'creative';
  imageUrl: string;
  caption: string;
  year?: string;
}

export interface MemoryStory {
  id: string;
  title: string;
  date: string;
  readTime: string;
  category: string;
  imageUrl: string;
  shortDescription: string;
  fullStory: string;
}

export interface CustomizerSettings {
  theme: 'cream' | 'sage' | 'charcoal';
  fontPairing: 'classic' | 'modern' | 'editorial';
  spacing: 'spacious' | 'compact';
}

export interface PersonalDetails {
  fullName: string;
  tagline: string;
  birthDetails: string;
  location: string;
  shortIntro: string;
  bioFull: string;
  signatureQuote: string;
  occupation: string;
  coordinates: string;
  coordsLabel: string;
  coordsSub: string;
}

export type EditableTemplateSection =
  | 'hero'
  | 'about'
  | 'timeline'
  | 'gallery'
  | 'stories'
  | 'contact'
  | 'style';

export interface BiographyCategory {
  id: 'life' | 'visionary' | 'entrepreneur';
  title: string;
  badge: string;
  quote: string;
  description: string;
  settings: CustomizerSettings;
  personalDetails: PersonalDetails;
  values: ValueItem[];
  hobbies: HobbyItem[];
  timeline: TimelineMilestone[];
  gallery: GalleryItem[];
  stories: MemoryStory[];
}
