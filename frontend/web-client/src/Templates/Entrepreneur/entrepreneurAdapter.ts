import type {
  BiographyCategory,
  GalleryItem as LifeJourneyGalleryItem,
  TimelineMilestone as LifeJourneyTimelineMilestone,
} from '../LifeJourney/types';
import type { BiographyData, TimelineCategory } from './src/types';

const timelineFallbackCategories: TimelineCategory[] = [
  'Childhood',
  'Education',
  'Career',
  'Family Life',
  'Present Day',
];

const getTimelineCategory = (
  milestone: LifeJourneyTimelineMilestone,
  index: number,
  total: number
): TimelineCategory => {
  const text = `${milestone.title} ${milestone.location} ${milestone.description}`.toLowerCase();

  if (text.includes('family') || text.includes('marri') || text.includes('children') || text.includes('home')) {
    return 'Family Life';
  }

  if (text.includes('school') || text.includes('college') || text.includes('education') || text.includes('graduat')) {
    return 'Education';
  }

  if (text.includes('born') || text.includes('child') || text.includes('youth') || index === 0) {
    return 'Childhood';
  }

  if (text.includes('present') || text.includes('current') || text.includes('today') || index === total - 1) {
    return 'Present Day';
  }

  return timelineFallbackCategories[index] ?? 'Career';
};

const getGalleryType = (item: LifeJourneyGalleryItem) =>
  item.category === 'creative' && item.title.toLowerCase().includes('video') ? 'video' : 'image';

export const adaptBiographyToEntrepreneur = (draft: BiographyCategory): BiographyData => ({
  name: draft.personalDetails.fullName,
  title: draft.personalDetails.occupation,
  tagline: draft.personalDetails.tagline,
  introduction: draft.personalDetails.shortIntro,
  profileImageUrl: draft.personalDetails.profileImageUrl,
  biographySummary: draft.personalDetails.bioFull || draft.personalDetails.shortIntro,
  values: draft.values.map((value, index) => ({
    id: value.id || `value-${index + 1}`,
    name: value.title,
    description: value.description,
    iconName: value.icon || 'Sparkles',
  })),
  hobbies: draft.hobbies.map((hobby, index) => ({
    id: hobby.id || `hobby-${index + 1}`,
    name: hobby.title,
    description: hobby.description,
    iconName: hobby.icon || 'BriefcaseBusiness',
  })),
  timeline: draft.timeline.map((milestone, index, milestones) => ({
    id: milestone.id || `milestone-${index + 1}`,
    year: milestone.year,
    category: getTimelineCategory(milestone, index, milestones.length),
    title: milestone.title,
    description: milestone.description,
  })),
  gallery: draft.gallery.map((item, index) => ({
    id: item.id || `gallery-${index + 1}`,
    title: item.title,
    caption: item.caption,
    type: getGalleryType(item),
    imageUrl: item.imageUrl,
  })),
  stories: draft.stories.map((story, index) => ({
    id: story.id || `story-${index + 1}`,
    title: story.title,
    date: story.date,
    description: story.shortDescription || story.fullStory,
    imageUrl: story.imageUrl,
    category: story.category,
    readTime: story.readTime,
  })),
  email: draft.personalDetails.contactEmail || 'contact@example.com',
  socialLinks: {
    linkedin: draft.personalDetails.linkedinLabel || '',
    facebook: draft.personalDetails.facebookLabel || '',
    youtube: '',
    website: '',
  },
});
