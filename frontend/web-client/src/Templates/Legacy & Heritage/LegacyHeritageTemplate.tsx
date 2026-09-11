import React from 'react';
import LegacyHeritageApp from './src/App';
import type {
  BiographyCategory,
  EditableImageTarget,
  EditableTemplateSection,
} from '../LifeJourney/types';

interface LegacyHeritageTemplateProps {
  data?: BiographyCategory;
  onDataChange?: React.Dispatch<React.SetStateAction<BiographyCategory>>;
  activeEditSection?: EditableTemplateSection | null;
  onEditSectionChange?: (section: EditableTemplateSection) => void;
  onImageChangeRequest?: (target: EditableImageTarget) => void;
}

export default function LegacyHeritageTemplate({
  data,
  onDataChange,
  activeEditSection = null,
  onEditSectionChange,
  onImageChangeRequest,
}: LegacyHeritageTemplateProps) {
  return (
    <LegacyHeritageApp
      data={data}
      onDataChange={onDataChange}
      activeEditSection={activeEditSection}
      onEditSectionChange={onEditSectionChange}
      onImageChangeRequest={onImageChangeRequest}
    />
  );
}
