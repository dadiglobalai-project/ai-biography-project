import { getSectionCopy } from './sectionCopy';
import type { BiographyWebsiteSection } from '../../services/authService';
import type {
  BiographyCategory,
  EditableSectionCopyKey,
  GalleryItem,
  TimelineMilestone,
} from './types';

type BackendRecord = Record<string, unknown>;

const asBackendRecord = (value: unknown): BackendRecord | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as BackendRecord) : null;

const normalizeBackendSectionText = (value?: string) =>
  (value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const getRecordStringValue = (record: BackendRecord | null | undefined, keys: string[]) => {
  if (!record) {
    return undefined;
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string') {
      return value;
    }
  }

  return undefined;
};

const getRecordNumberValue = (record: BackendRecord | null | undefined, keys: string[], fallback: number) => {
  if (!record) {
    return fallback;
  }

  for (const key of keys) {
    const value = record[key];
    const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const getSectionLookupRecords = (section?: BiographyWebsiteSection | null, nestedKeys: string[] = []) => {
  const sectionRecord = asBackendRecord(section);
  const contentRecord = asBackendRecord(section?.content);
  const baseRecords = [contentRecord, sectionRecord].filter(Boolean) as BackendRecord[];
  const nestedRecords = baseRecords.flatMap((record) =>
    nestedKeys.map((key) => asBackendRecord(record[key])).filter(Boolean) as BackendRecord[]
  );

  return [...nestedRecords, ...baseRecords];
};

const getSectionStringValue = (
  section: BiographyWebsiteSection | null | undefined,
  keys: string[],
  nestedKeys: string[] = []
) => {
  for (const record of getSectionLookupRecords(section, nestedKeys)) {
    const value = getRecordStringValue(record, keys);
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
};

const getSectionArrayValue = (
  section: BiographyWebsiteSection | null | undefined,
  keys: string[],
  nestedKeys: string[] = []
) => {
  for (const record of getSectionLookupRecords(section, nestedKeys)) {
    for (const key of keys) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value as BackendRecord[];
      }
    }
  }

  return [];
};

const sortBackendItems = (items: BackendRecord[]) =>
  [...items].sort(
    (a, b) =>
      getRecordNumberValue(a, ['sortOrder', 'order', 'position'], 0) -
      getRecordNumberValue(b, ['sortOrder', 'order', 'position'], 0)
  );

const getBackendSectionByAliases = (aliases: string[], sections: BiographyWebsiteSection[]) => {
  const normalizedAliases = aliases.map(normalizeBackendSectionText);

  return sections.find((backendSection) => {
    const values = [
      backendSection.id,
      backendSection.key,
      backendSection.title,
      backendSection.description,
    ]
      .map(normalizeBackendSectionText)
      .filter(Boolean);

    return values.some((value) =>
      normalizedAliases.some((alias) => value === alias || value.includes(alias) || alias.includes(value))
    );
  }) || null;
};

const withSectionDescription = (
  draft: BiographyCategory,
  section: EditableSectionCopyKey,
  description?: string
): BiographyCategory => {
  if (description === undefined) {
    return draft;
  }

  const currentCopy = getSectionCopy(draft.sectionCopy)[section];

  return {
    ...draft,
    sectionCopy: {
      ...draft.sectionCopy,
      [section]: {
        ...currentCopy,
        description,
        descriptionTextSettings: draft.sectionCopy?.[section]?.descriptionTextSettings,
      },
    },
  };
};

const normalizeGalleryCategory = (category?: string): GalleryItem['category'] => {
  const normalizedCategory = (category || '').toLowerCase();
  return normalizedCategory === 'family' ||
    normalizedCategory === 'career' ||
    normalizedCategory === 'travel' ||
    normalizedCategory === 'creative'
    ? normalizedCategory
    : 'creative';
};

const getTimelineEra = (index: number, fallback?: TimelineMilestone['era']): TimelineMilestone['era'] => {
  if (fallback) {
    return fallback;
  }

  if (index === 0) {
    return 'youth';
  }

  if (index === 1) {
    return 'middle';
  }

  return 'recent';
};

export const hydrateDraftFromBackendSections = (
  currentDraft: BiographyCategory,
  sections: BiographyWebsiteSection[]
): BiographyCategory => {
  let nextDraft = currentDraft;
  const heroSection = getBackendSectionByAliases(['hero', 'hero section'], sections);
  const chronicleSection = getBackendSectionByAliases(
    ['about', 'about section', 'chronicle', 'chronicle section', 'chronicle overview', 'archival essence'],
    sections
  );
  const pursuitsSection = getBackendSectionByAliases(['pursuits', 'pursuit', 'specialized pursuits'], sections);
  const timelineSection = getBackendSectionByAliases(['timeline', 'timeline section', 'life journey'], sections);
  const gallerySection = getBackendSectionByAliases(['gallery', 'gallery section'], sections);
  const contactSection = getBackendSectionByAliases(['contact', 'contact section'], sections);

  if (heroSection) {
    nextDraft = {
      ...nextDraft,
      personalDetails: {
        ...nextDraft.personalDetails,
        fullName: getSectionStringValue(heroSection, ['fullName']) ?? nextDraft.personalDetails.fullName,
        occupation:
          getSectionStringValue(heroSection, ['designation', 'occupation']) ??
          nextDraft.personalDetails.occupation,
        tagline: getSectionStringValue(heroSection, ['tagline']) ?? nextDraft.personalDetails.tagline,
        shortIntro:
          getSectionStringValue(heroSection, ['shortDescription', 'shortIntro']) ??
          nextDraft.personalDetails.shortIntro,
        profileImageAssetId:
          getSectionStringValue(heroSection, ['profileImageId', 'profile_image_id']) ??
          nextDraft.personalDetails.profileImageAssetId,
        backgroundImageAssetId:
          getSectionStringValue(heroSection, ['backgroundImageId', 'background_image_id']) ??
          nextDraft.personalDetails.backgroundImageAssetId,
      },
    };
  }

  if (chronicleSection) {
    const beliefItems = sortBackendItems(
      getSectionArrayValue(chronicleSection, ['items', 'beliefItems'], ['beliefs'])
    );

    nextDraft = withSectionDescription(
      {
        ...nextDraft,
        personalDetails: {
          ...nextDraft.personalDetails,
          bioFull:
            getSectionStringValue(chronicleSection, ['storyContent', 'content', 'body'], ['journal']) ??
            nextDraft.personalDetails.bioFull,
          signatureQuote:
            getSectionStringValue(chronicleSection, ['quote'], ['journal']) ??
            nextDraft.personalDetails.signatureQuote,
        },
        values:
          beliefItems.length > 0
            ? beliefItems.map((item, index) => {
                const fallback = nextDraft.values[index];
                return {
                  id:
                    getRecordStringValue(item, ['id', 'beliefId']) ||
                    fallback?.id ||
                    `value-${index + 1}`,
                  title: getRecordStringValue(item, ['title']) ?? fallback?.title ?? '',
                  description:
                    getRecordStringValue(item, ['description']) ?? fallback?.description ?? '',
                  icon: getRecordStringValue(item, ['icon']) ?? fallback?.icon ?? 'Heart',
                  textSettings: fallback?.textSettings,
                };
              })
            : nextDraft.values,
      },
      'about',
      getSectionStringValue(chronicleSection, ['sectionDescription', 'description'])
    );
  }

  if (pursuitsSection) {
    const pursuitItems = sortBackendItems(
      getSectionArrayValue(pursuitsSection, ['items', 'pursuits'], ['pursuits'])
    );

    if (pursuitItems.length > 0) {
      nextDraft = {
        ...nextDraft,
        hobbies: pursuitItems.map((item, index) => {
          const fallback = nextDraft.hobbies[index];
          return {
            id:
              getRecordStringValue(item, ['id', 'pursuitId']) ||
              fallback?.id ||
              `hobby-${index + 1}`,
            title: getRecordStringValue(item, ['title']) ?? fallback?.title ?? '',
            description:
              getRecordStringValue(item, ['description']) ?? fallback?.description ?? '',
            icon: getRecordStringValue(item, ['icon']) ?? fallback?.icon ?? 'Sparkles',
            imageUrl: fallback?.imageUrl ?? '',
            imageAssetId:
              getRecordStringValue(item, ['imageId', 'image_id', 'mediaAssetId', 'media_asset_id']) ??
              fallback?.imageAssetId,
            imageSettings: fallback?.imageSettings,
            textSettings: fallback?.textSettings,
          };
        }),
      };
    }
  }

  if (timelineSection) {
    const timelineEvents = sortBackendItems(
      getSectionArrayValue(timelineSection, ['timelineEvents', 'events'], ['timeline'])
    );

    nextDraft = withSectionDescription(
      {
        ...nextDraft,
        timeline:
          timelineEvents.length > 0
            ? timelineEvents.map((event, index) => {
                const fallback = nextDraft.timeline[index];
                const highlights = sortBackendItems(
                  (Array.isArray(event.highlights)
                    ? event.highlights
                    : Array.isArray(event.timelineHighlights)
                      ? event.timelineHighlights
                      : []) as BackendRecord[]
                );

                return {
                  id:
                    getRecordStringValue(event, ['id', 'timelineEventId', 'eventId']) ||
                    fallback?.id ||
                    `milestone-${index + 1}`,
                  year:
                    getRecordStringValue(event, ['timePeriod', 'year']) ??
                    fallback?.year ??
                    '',
                  era: getTimelineEra(index, fallback?.era),
                  title: getRecordStringValue(event, ['title']) ?? fallback?.title ?? '',
                  location: getRecordStringValue(event, ['location']) ?? fallback?.location ?? '',
                  description:
                    getRecordStringValue(event, ['quote', 'description']) ??
                    fallback?.description ??
                    '',
                  details:
                    highlights.length > 0
                      ? highlights
                          .map((highlight) =>
                            getRecordStringValue(highlight, ['highlightText', 'text', 'description'])
                          )
                          .filter((highlight): highlight is string => highlight !== undefined)
                      : fallback?.details ?? [],
                  imageUrl: fallback?.imageUrl,
                  imageAssetId:
                    getRecordStringValue(event, ['imageId', 'image_id', 'mediaAssetId', 'media_asset_id']) ??
                    fallback?.imageAssetId,
                  imageCaption:
                    getRecordStringValue(event, ['imageCaption']) ?? fallback?.imageCaption,
                  imageSettings: fallback?.imageSettings,
                  textSettings: fallback?.textSettings,
                };
              })
            : nextDraft.timeline,
      },
      'timeline',
      getSectionStringValue(timelineSection, ['sectionDescription', 'description'])
    );
  }

  if (gallerySection) {
    const galleryItems = sortBackendItems(
      getSectionArrayValue(gallerySection, ['items', 'galleryItems'], ['gallery'])
    );

    nextDraft = withSectionDescription(
      {
        ...nextDraft,
        gallery:
          galleryItems.length > 0
            ? galleryItems.map((item, index) => {
                const fallback = nextDraft.gallery[index];
                return {
                  id:
                    getRecordStringValue(item, ['id', 'galleryItemId', 'itemId']) ||
                    fallback?.id ||
                    `gallery-${index + 1}`,
                  title: getRecordStringValue(item, ['title']) ?? fallback?.title ?? '',
                  category: normalizeGalleryCategory(
                    getRecordStringValue(item, ['category']) ?? fallback?.category
                  ),
                  imageUrl: fallback?.imageUrl ?? '',
                  mediaAssetId:
                    getRecordStringValue(item, ['mediaAssetId', 'media_asset_id', 'mediaId', 'assetId']) ??
                    fallback?.mediaAssetId,
                  thumbnailAssetId:
                    getRecordStringValue(item, ['thumbnailAssetId', 'thumbnail_asset_id', 'thumbnailId']) ??
                    fallback?.thumbnailAssetId,
                  caption:
                    getRecordStringValue(item, ['description', 'caption']) ??
                    fallback?.caption ??
                    '',
                  year:
                    getRecordStringValue(item, ['displayYear', 'year']) ?? fallback?.year,
                  imageSettings: fallback?.imageSettings,
                  textSettings: fallback?.textSettings,
                };
              })
            : nextDraft.gallery,
      },
      'gallery',
      getSectionStringValue(gallerySection, ['sectionDescription', 'description'])
    );
  }

  if (contactSection) {
    const socialLinks = getSectionArrayValue(contactSection, ['socialLinks', 'links'], ['contact']);
    const socialByPlatform = new Map(
      socialLinks.map((link) => [
        normalizeBackendSectionText(getRecordStringValue(link, ['platform']) || ''),
        getRecordStringValue(link, ['displayName', 'name']) || '',
      ])
    );

    nextDraft = withSectionDescription(
      {
        ...nextDraft,
        personalDetails: {
          ...nextDraft.personalDetails,
          contactEmail:
            getSectionStringValue(contactSection, ['email'], ['contactInfo']) ??
            nextDraft.personalDetails.contactEmail,
          instagramHandle:
            socialByPlatform.get('instagram') || nextDraft.personalDetails.instagramHandle,
          twitterHandle:
            socialByPlatform.get('twitter') || nextDraft.personalDetails.twitterHandle,
          facebookLabel:
            socialByPlatform.get('facebook') || nextDraft.personalDetails.facebookLabel,
          linkedinLabel:
            socialByPlatform.get('linkedin') || nextDraft.personalDetails.linkedinLabel,
        },
      },
      'contact',
      getSectionStringValue(contactSection, ['sectionDescription', 'description'])
    );
  }

  return nextDraft;
};
