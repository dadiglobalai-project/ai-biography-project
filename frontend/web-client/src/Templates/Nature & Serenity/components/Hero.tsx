import React from 'react';
import { BIO_DATA } from '../data';
import { ArrowDown, Sparkles, Feather, BookOpen, Compass, Image, Mail } from 'lucide-react';
import InlineEditableText from '../../../components/InlineEditableText';
import type { EditableImageTarget } from '../../LifeJourney/types';

interface HeroProps {
  fullName?: string;
  tagline?: string;
  shortIntro?: string;
  profileImageUrl?: string;
  editable?: boolean;
  onChange?: (field: 'name' | 'tagline' | 'introduction', value: string) => void;
  onEdit?: () => void;
  onImageChangeRequest?: (target: EditableImageTarget) => void;
}

export default function Hero({ fullName = BIO_DATA.fullName, tagline = BIO_DATA.tagline, shortIntro = BIO_DATA.shortIntro, profileImageUrl = BIO_DATA.avatarImage, editable = false, onChange, onEdit, onImageChangeRequest }: HeroProps) {
  return (
    <header
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden bg-beige-light/50"
    >
      {/* Scenic Nature Background Overlay with Glass overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={BIO_DATA.heroBg}
          alt="Misty deep woodland pine trees"
          className="w-full h-full object-cover filter brightness-[0.9] contrast-[0.95] saturate-[0.8]"
          referrerPolicy="no-referrer"
        />
        {/* Glass backdrop blur layer to make the background feel frosted */}
        <div className="absolute inset-0 bg-beige-light/40 backdrop-blur-[4px]"></div>
        {/* Soft elegant gradients - transitioning from dark forest to warm ambient light */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest/30 via-beige-light/40 to-beige-light"></div>
      </div>

      {/* Elegant Leaf/Wildflower Outline Vectors floating in Hero background */}
      <div className="absolute top-24 left-10 text-sage/20 pointer-events-none hidden md:block">
        <svg className="w-48 h-48" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0 C40 20 20 40 10 50 C20 60 40 80 50 100 C60 80 80 60 90 50 C80 40 60 20 50 0 Z" opacity="0.08" />
        </svg>
      </div>
      <div className="absolute bottom-24 right-10 text-sage/20 pointer-events-none hidden md:block">
        <svg className="w-64 h-64" viewBox="0 0 100 100" fill="currentColor">
          <path d="M0 50 Q25 25, 50 50 T100 50" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.15" />
        </svg>
      </div>

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
        
        {/* Profile Image Column */}
        <div className="lg:col-span-5 flex justify-center lg:justify-start order-2 lg:order-1">
          <div className="relative w-64 h-80 sm:w-72 sm:h-96 lg:w-80 lg:h-[420px]" id="hero-avatar-container">
            {/* Soft decorative background rings */}
            <div className="absolute inset-0 bg-sage/30 rounded-[60%_40%_70%_30%_/_50%_60%_40%_50%] transform rotate-6 scale-105 filter blur-sm"></div>
            <div className="absolute inset-0 bg-olive/15 rounded-[50%_50%_30%_70%_/_50%_60%_40%_50%] transform -rotate-12 scale-[1.03]"></div>
            
            {/* The main profile image in organic fluid frame matching the Frosted Glass design */}
            <div className="absolute inset-1 overflow-hidden bg-forest rounded-[60%_40%_70%_30%_/_50%_60%_40%_50%] border-4 border-sage shadow-2xl transition-all duration-700 hover:rounded-[50%_50%_30%_70%_/_50%_60%_40%_50%]">
              <img
                src={profileImageUrl}
                alt={fullName}
                className="w-full h-full object-cover transform scale-105 hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/40 to-transparent opacity-40"></div>
            </div>
            {onImageChangeRequest && (
              <button type="button" onClick={() => onImageChangeRequest({ section: 'hero' })} className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/80 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg hover:bg-black">
                Change Picture
              </button>
            )}

            {/* Botanical badge overlay */}
            <div className="absolute -bottom-4 right-4 bg-[#F7F1E7] border border-[#D8CDBB] px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#17352A] font-semibold">
              <span className="w-2 h-2 rounded-full bg-sage"></span>
              <span>Botanical Chronicler</span>
            </div>
          </div>
        </div>

        {/* Text Content Column */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start order-1 lg:order-2">
          {/* Glassmorphic Box enclosing Hero Text for beautiful readability & frosted glass look */}
          <div className="bg-[#F7F1E7]/95 p-8 sm:p-10 rounded-[40px] shadow-[0_18px_45px_rgba(23,53,42,0.18)] border border-[#D8CDBB] text-center w-full max-w-xl lg:self-start backdrop-blur-sm">
            {/* Category / Template Badge */}
            <div className="inline-flex items-center gap-2 bg-forest text-white-warm rounded-full px-4 py-1.5 mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-sage-light" />
              <span className="text-[10px] sm:text-xs uppercase tracking-widest font-medium">
                A Life in Focus
              </span>
            </div>

            {/* 1. Name */}
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-forest tracking-tight leading-none mb-4">
              <InlineEditableText value={fullName} editable={editable} label="Name" onFocus={onEdit} onChange={(value) => onChange?.('name', value)} />
            </h1>

            {/* 2. Tagline */}
            <p className="font-serif text-lg sm:text-xl md:text-2xl text-sage-dark italic max-w-xl mb-6 leading-relaxed font-medium">
              "<InlineEditableText value={tagline} editable={editable} label="Tagline" onFocus={onEdit} onChange={(value) => onChange?.('tagline', value)} />"
            </p>

            {/* Divider line */}
            <div className="w-24 h-0.5 bg-sage mb-6 rounded-full mx-auto"></div>

            {/* 5. Introduction */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-sage mb-2">
                <Feather className="w-3 h-3" />
                <span>Introduction</span>
              </div>
              <p className="text-sm sm:text-base text-stone/90 max-w-xl leading-relaxed font-light">
                <InlineEditableText value={shortIntro} editable={editable} multiline label="Introduction" onFocus={onEdit} onChange={(value) => onChange?.('introduction', value)} />
              </p>
            </div>

            {/* Template Navigation Quick Actions */}
            <div className="flex flex-wrap gap-2.5 items-center justify-center lg:justify-start pt-2 border-t border-beige-dark/30">
              <a
                href="#biography"
                className="inline-flex items-center gap-1.5 bg-forest hover:bg-forest-light text-white-warm text-xs uppercase tracking-wider px-5 py-2.5 rounded-full shadow transition-all hover:-translate-y-0.5"
                id="hero-nav-biography"
              >
                <BookOpen className="w-3.5 h-3.5 text-sage-light" />
                <span>Full Biography</span>
              </a>

              <a
                href="#timeline"
                className="inline-flex items-center gap-1.5 bg-white-warm/80 hover:bg-white-warm border border-beige-dark text-stone hover:text-forest text-xs uppercase tracking-wider px-4 py-2.5 rounded-full transition-all"
                id="hero-nav-timeline"
              >
                <Compass className="w-3.5 h-3.5 text-sage" />
                <span>Timeline</span>
              </a>

              <a
                href="#gallery"
                className="inline-flex items-center gap-1.5 bg-white-warm/80 hover:bg-white-warm border border-beige-dark text-stone hover:text-forest text-xs uppercase tracking-wider px-4 py-2.5 rounded-full transition-all"
                id="hero-nav-gallery"
              >
                <Image className="w-3.5 h-3.5 text-sage" />
                <span>Gallery</span>
              </a>

              <a
                href="#stories"
                className="inline-flex items-center gap-1.5 bg-white-warm/80 hover:bg-white-warm border border-beige-dark text-stone hover:text-forest text-xs uppercase tracking-wider px-4 py-2.5 rounded-full transition-all"
                id="hero-nav-stories"
              >
                <Feather className="w-3.5 h-3.5 text-sage" />
                <span>Stories</span>
              </a>

              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 bg-white-warm/80 hover:bg-white-warm border border-beige-dark text-stone hover:text-forest text-xs uppercase tracking-wider px-4 py-2.5 rounded-full transition-all"
                id="hero-nav-contact"
              >
                <Mail className="w-3.5 h-3.5 text-sage" />
                <span>Contact Info</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Scrolling Indicator at the very bottom */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-60 text-stone text-[10px] uppercase tracking-widest pointer-events-none">
        <span className="text-forest">Scroll to Explore</span>
        <ArrowDown className="w-3.5 h-3.5 text-sage-dark animate-bounce" />
      </div>
    </header>
  );
}




