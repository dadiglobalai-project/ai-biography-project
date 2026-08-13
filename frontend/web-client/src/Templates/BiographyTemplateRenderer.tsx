import React from 'react';
import EntrepreneurTemplate from './Entrepreneur/EntrepreneurTemplate';
import LegacyHeritageTemplate from './Legacy & Heritage/LegacyHeritageTemplate';
import LifeJourneyTemplate from './LifeJourney/LifeJourneyTemplate';
import { CATEGORIES_DATA } from './LifeJourney/data';
import type {
  BiographyCategory,
  EditableImageTarget,
  EditableTemplateSection,
} from './LifeJourney/types';
import type { TemplateStyle as EntrepreneurTemplateStyle } from './Entrepreneur/src/types';

interface BiographyTemplateRendererProps {
  templateId?: string;
  categoryKey?: BiographyCategory['id'];
  dataOverride?: BiographyCategory;
  activeEditSection?: EditableTemplateSection | null;
  onDataChange?: React.Dispatch<React.SetStateAction<BiographyCategory>>;
  onEditSectionChange?: (section: EditableTemplateSection) => void;
  onImageChangeRequest?: (target: EditableImageTarget) => void;
  websiteId?: string;
}

const getEntrepreneurTemplateStyle = (data: BiographyCategory): EntrepreneurTemplateStyle => {
  switch (data.settings.theme) {
    case 'sage':
      return 'modern';
    case 'charcoal':
      return 'editorial';
    case 'cream':
    default:
      return 'heritage';
  }
};

export default function BiographyTemplateRenderer({
  templateId = 'life-journey',
  categoryKey = 'life',
  dataOverride,
  activeEditSection = null,
  onDataChange,
  onEditSectionChange,
  onImageChangeRequest,
  websiteId = '',
}: BiographyTemplateRendererProps) {
  const data = dataOverride ?? CATEGORIES_DATA[categoryKey];

  if (templateId === 'entrepreneur-story') {
    return (
      <EntrepreneurTemplate
        data={data}
        style={getEntrepreneurTemplateStyle(data)}
        activeEditSection={activeEditSection}
        onEditSectionChange={onEditSectionChange}
        onImageChangeRequest={onImageChangeRequest}
      />
    );
  }

  if (templateId === 'legacy-heritage') {
    return (
      <LegacyHeritageTemplate
        data={data}
        activeEditSection={activeEditSection}
        onEditSectionChange={onEditSectionChange}
        onImageChangeRequest={onImageChangeRequest}
      />
    );
  }

  return (
    <LifeJourneyTemplate
      categoryKey={categoryKey}
      dataOverride={dataOverride}
      activeEditSection={activeEditSection}
      onDataChange={onDataChange}
      onEditSectionChange={onEditSectionChange}
      onImageChangeRequest={onImageChangeRequest}
      websiteId={websiteId}
    />
  );
}
