export type SectionType =
  | 'HERO'
  | 'CHRONICLE_VALUES'
  | 'SPECIALIZED_PURSUITS'
  | 'LIFE_JOURNEY'
  | 'MEDIA_GALLERY'
  | 'CONTACT';

export type GalleryMediaType = 'IMAGE' | 'VIDEO' | 'AUDIO';

export type SocialPlatform =
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'X'
  | 'LINKEDIN'
  | 'YOUTUBE'
  | 'TIKTOK'
  | 'WEBSITE'
  | 'EMAIL'
  | 'OTHER';

export interface SectionSettingsRequest {
  isVisible: boolean;
  sortOrder: number;
}

export interface BaseSectionResponse<TContent = SectionContent> {
  sectionId: string;
  sectionType: SectionType;
  sectionKey: string;
  sortOrder: number;
  isVisible: boolean;
  content: TContent | null;
}

export interface SectionsResponse {
  websiteId: string;
  sections: SectionResponse[];
}

export type SectionResponse =
  | HeroSectionResponse
  | ChronicleSectionResponse
  | PursuitsSectionResponse
  | TimelineSectionResponse
  | GallerySectionResponse
  | ContactSectionResponse
  | BaseSectionResponse;

export type SectionContent =
  | HeroContent
  | ChronicleContent
  | PursuitsContent
  | TimelineContent
  | GalleryContent
  | ContactContent;

export interface HeroSectionRequest extends SectionSettingsRequest {
  fullName: string;
  designation?: string | null;
  tagline?: string | null;
  shortDescription?: string | null;
  profileImageId?: string | null;
  backgroundImageId?: string | null;
}

export interface HeroContent {
  fullName: string;
  designation: string | null;
  tagline: string | null;
  shortDescription: string | null;
  profileImageId: string | null;
  backgroundImageId: string | null;
}

export type HeroSectionResponse = BaseSectionResponse<HeroContent> & {
  sectionType: 'HERO';
};

export interface ChronicleSectionRequest extends SectionSettingsRequest {
  sectionLabel?: string | null;
  sectionTitle: string;
  sectionDescription?: string | null;
  journal?: JournalRequest | null;
  beliefs?: BeliefsRequest | null;
}

export interface JournalRequest {
  cardLabel?: string | null;
  storyTitle?: string | null;
  storyContent?: string | null;
  quote?: string | null;
}

export interface BeliefsRequest {
  cardLabel?: string | null;
  items?: BeliefItemRequest[];
}

export interface BeliefItemRequest {
  id?: string | null;
  icon?: string | null;
  title: string;
  description?: string | null;
  sortOrder: number;
}

export interface ChronicleContent {
  sectionLabel: string | null;
  sectionTitle: string;
  sectionDescription: string | null;
  journal: JournalContent;
  beliefs: BeliefsContent;
}

export interface JournalContent {
  cardLabel: string | null;
  storyTitle: string | null;
  storyContent: string | null;
  quote: string | null;
}

export interface BeliefsContent {
  cardLabel: string | null;
  items: BeliefItemContent[];
}

export interface BeliefItemContent {
  id: string;
  icon: string | null;
  title: string;
  description: string | null;
  sortOrder: number;
}

export type ChronicleSectionResponse = BaseSectionResponse<ChronicleContent> & {
  sectionType: 'CHRONICLE_VALUES';
};

export interface PursuitsSectionRequest extends SectionSettingsRequest {
  sectionLabel?: string | null;
  items?: PursuitItemRequest[];
}

export interface PursuitItemRequest {
  id?: string | null;
  imageId?: string | null;
  icon?: string | null;
  title: string;
  description?: string | null;
  sortOrder: number;
}

export interface PursuitsContent {
  sectionLabel: string | null;
  items: PursuitItemContent[];
}

export interface PursuitItemContent {
  id: string;
  imageId: string | null;
  icon: string | null;
  title: string;
  description: string | null;
  sortOrder: number;
}

export type PursuitsSectionResponse = BaseSectionResponse<PursuitsContent> & {
  sectionType: 'SPECIALIZED_PURSUITS';
};

export interface TimelineSectionRequest extends SectionSettingsRequest {
  sectionLabel?: string | null;
  sectionTitle: string;
  sectionDescription?: string | null;
  timelineEvents?: TimelineEventRequest[];
}

export interface TimelineEventRequest {
  id?: string | null;
  timePeriod?: string | null;
  title: string;
  location?: string | null;
  quote?: string | null;
  imageId?: string | null;
  imageAltText?: string | null;
  imageCaption?: string | null;
  sortOrder: number;
  highlights?: TimelineHighlightRequest[];
}

export interface TimelineHighlightRequest {
  id?: string | null;
  highlightText: string;
  sortOrder: number;
}

export interface TimelineContent {
  sectionLabel: string | null;
  sectionTitle: string;
  sectionDescription: string | null;
  timelineEvents: TimelineEventContent[];
}

export interface TimelineEventContent {
  id: string;
  timePeriod: string | null;
  title: string;
  location: string | null;
  quote: string | null;
  imageId: string | null;
  imageAltText: string | null;
  imageCaption: string | null;
  sortOrder: number;
  highlights: TimelineHighlightContent[];
}

export interface TimelineHighlightContent {
  id: string;
  highlightText: string;
  sortOrder: number;
}

export type TimelineSectionResponse = BaseSectionResponse<TimelineContent> & {
  sectionType: 'LIFE_JOURNEY';
};

export interface GallerySectionRequest extends SectionSettingsRequest {
  sectionLabel?: string | null;
  sectionTitle: string;
  sectionDescription?: string | null;
  items?: GalleryItemRequest[];
}

export interface GalleryItemRequest {
  id?: string | null;
  mediaAssetId?: string | null;
  thumbnailAssetId?: string | null;
  mediaType: GalleryMediaType;
  category?: string | null;
  recordLabel?: string | null;
  displayYear?: string | null;
  title: string;
  description?: string | null;
  altText?: string | null;
  sortOrder: number;
}

export interface GalleryContent {
  sectionLabel: string | null;
  sectionTitle: string;
  sectionDescription: string | null;
  items: GalleryItemContent[];
}

export interface GalleryItemContent {
  id: string;
  mediaAssetId: string | null;
  thumbnailAssetId: string | null;
  mediaType: GalleryMediaType;
  category: string | null;
  recordLabel: string | null;
  displayYear: string | null;
  title: string;
  description: string | null;
  altText: string | null;
  sortOrder: number;
}

export type GallerySectionResponse = BaseSectionResponse<GalleryContent> & {
  sectionType: 'MEDIA_GALLERY';
};

export interface ContactSectionRequest extends SectionSettingsRequest {
  sectionLabel?: string | null;
  sectionTitle: string;
  sectionDescription?: string | null;
  contactInfo?: ContactInfoRequest | null;
  socialLinks?: SocialLinkRequest[];
  formSettings?: ContactFormSettingsRequest | null;
}

export interface ContactInfoRequest {
  label?: string | null;
  email?: string | null;
}

export interface SocialLinkRequest {
  id?: string | null;
  platform: SocialPlatform;
  displayName?: string | null;
  profileUrl?: string | null;
  icon?: string | null;
  sortOrder: number;
}

export interface ContactFormSettingsRequest {
  title?: string | null;
  namePlaceholder?: string | null;
  emailPlaceholder?: string | null;
  subjectPlaceholder?: string | null;
  messagePlaceholder?: string | null;
  submitButtonText?: string | null;
  successMessage?: string | null;
  errorMessage?: string | null;
}

export interface ContactContent {
  sectionLabel: string | null;
  sectionTitle: string;
  sectionDescription: string | null;
  contactInfo: ContactInfoContent;
  socialLinks: SocialLinkContent[];
  formSettings: ContactFormSettingsContent;
}

export interface ContactInfoContent {
  label: string | null;
  email: string | null;
}

export interface SocialLinkContent {
  id: string;
  platform: SocialPlatform;
  displayName: string | null;
  profileUrl: string | null;
  icon: string | null;
  sortOrder: number;
}

export interface ContactFormSettingsContent {
  title: string | null;
  namePlaceholder: string | null;
  emailPlaceholder: string | null;
  subjectPlaceholder: string | null;
  messagePlaceholder: string | null;
  submitButtonText: string | null;
  successMessage: string | null;
  errorMessage: string | null;
}

export type ContactSectionResponse = BaseSectionResponse<ContactContent> & {
  sectionType: 'CONTACT';
};
