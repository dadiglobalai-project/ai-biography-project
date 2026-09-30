export interface ValueItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  textSettings?: TextDisplaySettings;
}

export type ImageSizePreset = 'compact' | 'default' | 'tall';
export type ImageFitPreset = 'cover' | 'contain';
export type ImagePositionPreset = 'top' | 'center' | 'bottom';
export type TextSizePreset = 'small' | 'default' | 'large';

export interface ImageDisplaySettings {
  size?: ImageSizePreset;
  fit?: ImageFitPreset;
  position?: ImagePositionPreset;
}

export interface TextDisplaySettings {
  size?: TextSizePreset;
}

export interface HobbyItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  imageAssetId?: string;
  imageSettings?: ImageDisplaySettings;
  textSettings?: TextDisplaySettings;
}

export interface TimelineMilestone {
  id: string;
  year: string;
  era: 'youth' | 'middle' | 'recent';
  title: string;
  location: string;
  description: string;
  annotation?: string;
  details: string[];
  imageUrl?: string;
  imageAssetId?: string;
  imageCaption?: string;
  imageSettings?: ImageDisplaySettings;
  textSettings?: TextDisplaySettings;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'family' | 'career' | 'travel' | 'creative';
  imageUrl: string;
  mediaAssetId?: string;
  thumbnailAssetId?: string;
  caption: string;
  year?: string;
  imageSettings?: ImageDisplaySettings;
  textSettings?: TextDisplaySettings;
}

export interface MemoryStory {
  id: string;
  title: string;
  date: string;
  readTime: string;
  category: string;
  imageUrl: string;
  imageAssetId?: string;
  imageSettings?: ImageDisplaySettings;
  shortDescription: string;
  fullStory: string;
  handwrittenNote?: string;
  textSettings?: TextDisplaySettings;
}

export interface CustomizerSettings {
  theme: 'cream' | 'sage' | 'charcoal';
  fontPairing: 'classic' | 'modern' | 'editorial';
  spacing: 'spacious' | 'compact';
  siteTitle?: string;
  subjectType?: 'SELF' | 'PARENT' | 'GRANDPARENT' | 'CHILD' | 'SPOUSE' | 'LOVED_ONE';
  showContactSection?: boolean;
  showSocialLinks?: boolean;
  allowContactMessages?: boolean;
}

export interface PersonalDetails {
  lifespan?: string;
  status?: string;
  birthDate?: string;
  birthPlace?: string;
  nationality?: string;
  fullName: string;
  tagline: string;
  taglineTextSettings?: TextDisplaySettings;
  profileImageUrl?: string;
  profileImageAssetId?: string;
  backgroundImageAssetId?: string;
  profileImageSettings?: ImageDisplaySettings;
  birthDetails: string;
  deathDetails?: string;
  location: string;
  shortIntro: string;
  shortIntroTextSettings?: TextDisplaySettings;
  bioFull: string;
  bioTextSettings?: TextDisplaySettings;
  signatureQuote: string;
  signatureQuoteAttribution?: string;
  journeyQuote?: string;
  journeyQuoteAttribution?: string;
  communionIntro?: string;
  signatureQuoteTextSettings?: TextDisplaySettings;
  occupation: string;
  coordinates: string;
  coordsLabel: string;
  coordsSub: string;
  contactEmail?: string;
  instagramHandle?: string;
  twitterHandle?: string;
  facebookLabel?: string;
  linkedinLabel?: string;
}

export type EditableTemplateSection =
  | 'hero'
  | 'about'
  | 'pursuits'
  | 'timeline'
  | 'gallery'
  | 'stories'
  | 'contact'
  | 'nature-joys'
  | 'nature-seasons'
  | 'nature-biography'
  | 'nature-reflections'
  | 'places'
  | 'style';

export type EditableImageSection = 'hero' | 'pursuits' | 'timeline' | 'gallery' | 'stories' | 'places';

export interface EditableImageTarget {
  section: EditableImageSection;
  itemIndex?: number;
  itemId?: string;
}

export type EditableSectionCopyKey = 'about' | 'timeline' | 'gallery' | 'stories' | 'contact';

export interface EditableSectionCopy {
  title: string;
  description: string;
  descriptionTextSettings?: TextDisplaySettings;
}

export interface BiographyCategory {
  id: 'life' | 'visionary' | 'entrepreneur';
  title: string;
  badge: string;
  editionLabel?: string;
  quote: string;
  description: string;
  archiveDescription?: string;
  settings: CustomizerSettings;
  personalDetails: PersonalDetails;
  values: ValueItem[];
  hobbies: HobbyItem[];
  timeline: TimelineMilestone[];
  gallery: GalleryItem[];
  stories: MemoryStory[];
  places?: Array<{ name: string; reflection: string; image: string }>;
  seasons?: Array<{ name: string; desc: string; emoji: string; subtitle?: string }>;
  sectionCopy?: Partial<Record<EditableSectionCopyKey, EditableSectionCopy>>;
}
