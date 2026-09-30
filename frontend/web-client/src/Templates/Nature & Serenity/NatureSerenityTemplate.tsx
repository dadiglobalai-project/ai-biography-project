import React from 'react';
import About from './components/About';
import Contact from './components/Contact';
import DailyJoys from './components/DailyJoys';
import DecorativeDivider from './components/DecorativeDivider';
import FavoritePlaces from './components/FavoritePlaces';
import FullBiography from './components/FullBiography';
import Gallery from './components/Gallery';
import GratitudeWall from './components/GratitudeWall';
import Hero from './components/Hero';
import LetterToFuture from './components/LetterToFuture';
import LifeJourney from './components/LifeJourney';
import ReflectionGarden from './components/ReflectionGarden';
import SeasonsOfLife from './components/SeasonsOfLife';
import Stories from './components/Stories';
import { BIO_DATA } from './data';
import type { BiographyCategory, EditableImageTarget, EditableTemplateSection } from '../LifeJourney/types';

interface NatureSerenityTemplateProps {
  data?: BiographyCategory;
  onDataChange?: React.Dispatch<React.SetStateAction<BiographyCategory>>;
  onEditSectionChange?: (section: EditableTemplateSection) => void;
  onImageChangeRequest?: (target: EditableImageTarget) => void;
}

/**
 * Nature & Serenity currently uses its own curated content model.
 * This wrapper gives it a stable template entry point while the shared
 * editable-field adapter is added section by section.
 */
export default function NatureSerenityTemplate({ data, onDataChange, onEditSectionChange, onImageChangeRequest }: NatureSerenityTemplateProps) {
  const details = data?.personalDetails;
  const editable = Boolean(onDataChange);
  const updatePersonal = (field: 'fullName' | 'tagline' | 'shortIntro' | 'bioFull' | 'signatureQuote' | 'location' | 'journeyQuote' | 'communionIntro', value: string) => {
    onDataChange?.((current) => ({ ...current, personalDetails: { ...current.personalDetails, [field]: value } }));
  };
  return (
    <main className="min-h-screen bg-beige-light text-stone">
      <Hero fullName={details?.fullName} tagline={details?.tagline} shortIntro={details?.shortIntro} profileImageUrl={details?.profileImageUrl} editable={editable} onEdit={() => onEditSectionChange?.('hero')} onImageChangeRequest={onImageChangeRequest} onChange={(field, value) => updatePersonal(field === 'name' ? 'fullName' : field === 'introduction' ? 'shortIntro' : field, value)} />
      <DecorativeDivider variant="leaves" />
      <About summary={details?.bioFull} quote={details?.signatureQuote} closingQuote={details?.journeyQuote} communionIntro={details?.communionIntro} fullName={details?.fullName} location={details?.location} hobbies={data?.hobbies?.map((item) => item.title)} values={data?.values} editable={editable} onEdit={() => onEditSectionChange?.('about')} onChange={(value) => updatePersonal('bioFull', value)} onNameChange={(value) => updatePersonal('fullName', value)} onLocationChange={(value) => updatePersonal('location', value)} onQuoteChange={(value) => updatePersonal('signatureQuote', value)} onClosingQuoteChange={(value) => updatePersonal('journeyQuote', value)} onCommunionIntroChange={(value) => updatePersonal('communionIntro', value)} onValueChange={(index, field, value) => onDataChange?.((current) => ({ ...current, values: current.values.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }))} onHobbyChange={(index, value) => onDataChange?.((current) => ({ ...current, hobbies: current.hobbies.map((item, itemIndex) => itemIndex === index ? { ...item, title: value } : item) }))} />
      <DailyJoys joys={data?.hobbies?.map((item) => ({ title: item.title, description: item.description }))} editable={editable} onEdit={() => onEditSectionChange?.('nature-joys')} onChange={(index, field, value) => onDataChange?.((current) => ({ ...current, hobbies: current.hobbies.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }))} />
      <FavoritePlaces places={data?.places ?? BIO_DATA.places} editable={editable} onEdit={() => onEditSectionChange?.('nature-seasons')} onImageChange={(index) => onImageChangeRequest?.({ section: 'places', itemIndex: index })} onChange={(index, field, value) => onDataChange?.((current) => ({ ...current, places: (current.places ?? BIO_DATA.places).map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }))} />
      <SeasonsOfLife seasons={data?.seasons ?? BIO_DATA.seasons} editable={editable} onEdit={() => onEditSectionChange?.('nature-seasons')} onChange={(index, field, value) => onDataChange?.((current) => ({ ...current, seasons: (current.seasons ?? BIO_DATA.seasons).map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }))} />
      <LifeJourney journey={data?.timeline?.map((item) => ({ year: item.year, title: item.title, description: item.description, image: item.imageUrl || '', location: item.location })) ?? BIO_DATA.journey} editable={editable} onEdit={() => onEditSectionChange?.('timeline')} onImageChange={(index) => onImageChangeRequest?.({ section: 'timeline', itemIndex: index })} onChange={(index, field, value) => onDataChange?.((current) => ({ ...current, timeline: current.timeline.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: field === 'location' ? value : value } : item) }))} />
      <FullBiography fullName={details?.fullName} lifespan={details?.lifespan} status={details?.status} birthDate={details?.birthDate} birthPlace={details?.birthPlace} nationality={details?.nationality} location={details?.location} profession={details?.occupation} editable={editable} onEdit={() => onEditSectionChange?.('nature-biography')} onImageChange={(index) => onImageChangeRequest?.({ section: 'timeline', itemIndex: index })} onChange={(field, value) => onDataChange?.((current) => ({ ...current, personalDetails: { ...current.personalDetails, [field]: value } }))} />
      <Gallery gallery={BIO_DATA.gallery.map((item, index) => ({ ...item, image: data?.gallery?.[index]?.imageUrl || item.image }))} editable={editable} onImageChange={(index) => onImageChangeRequest?.({ section: 'gallery', itemIndex: index })} />
      <Stories stories={data?.stories?.map((item) => ({ title: item.title, description: item.shortDescription, date: item.date, category: item.category, image: item.imageUrl || '' })) ?? BIO_DATA.stories} editable={editable} onEdit={() => onEditSectionChange?.('stories')} onImageChange={(index) => onImageChangeRequest?.({ section: 'stories', itemIndex: index })} onChange={(index, field, value) => onDataChange?.((current) => ({ ...current, stories: current.stories.map((item, itemIndex) => itemIndex === index ? { ...item, [field === 'description' ? 'shortDescription' : field]: value } : item) }))} />
      <ReflectionGarden editable={editable} onEdit={() => onEditSectionChange?.('nature-reflections')} />
      <GratitudeWall notes={BIO_DATA.gratitude} editable={editable} onEdit={() => onEditSectionChange?.('nature-reflections')} />
      <LetterToFuture />
      <Contact />
    </main>
  );
}
