/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PersonalValue {
  id: string;
  name: string;
  description: string;
  iconName: string; // Refers to Lucide icon string
}

export type TimelineCategory = 'Childhood' | 'Education' | 'Career' | 'Family Life' | 'Present Day';

export interface TimelineMilestone {
  id: string;
  year: string;
  category: TimelineCategory;
  title: string;
  description: string;
}

export type GalleryType = 'image' | 'video';

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  type: GalleryType;
  imageUrl: string; // Gradient block/placeholder description or URL
}

export interface MemoryStory {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl: string;
  category: string;
  readTime: string;
}

export interface Hobby {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export interface SocialLinks {
  linkedin: string;
  facebook: string;
  youtube: string;
  website: string;
}

export interface BiographyData {
  name: string;
  title: string;
  tagline: string;
  introduction: string;
  profileImageUrl?: string;
  biographySummary: string;
  values: PersonalValue[];
  hobbies: Hobby[];
  timeline: TimelineMilestone[];
  gallery: GalleryItem[];
  stories: MemoryStory[];
  email: string;
  socialLinks: SocialLinks;
}

export type TemplateStyle = 'heritage' | 'modern' | 'editorial';
