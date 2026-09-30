import React from 'react';
import { BIO_DATA } from '../data';
import { Leaf, Compass, PenTool, Sparkles, Check, Bookmark, Sprout } from 'lucide-react';
import InlineEditableText from '../../../components/InlineEditableText';

interface AboutProps {
  summary?: string;
  quote?: string;
  closingQuote?: string;
  communionIntro?: string;
  fullName?: string;
  location?: string;
  hobbies?: string[];
  values?: Array<{ title: string; description: string; icon: string }>;
  editable?: boolean;
  onChange?: (value: string) => void;
  onQuoteChange?: (value: string) => void;
  onHobbyChange?: (index: number, value: string) => void;
  onNameChange?: (value: string) => void;
  onLocationChange?: (value: string) => void;
  onClosingQuoteChange?: (value: string) => void;
  onCommunionIntroChange?: (value: string) => void;
  onValueChange?: (index: number, field: 'title' | 'description', value: string) => void;
  onEdit?: () => void;
}

export default function About({ summary = BIO_DATA.aboutSummary, quote = 'To sketch a flower is to realize how brief and perfect its breath on this earth is. We must learn to paint the wild forests before they only live in our sketchbooks.', closingQuote = 'In nature, nothing is a hobby; everything is a calling.', communionIntro = "Beyond my illustration desk, you can find me engaged in the quiet tactile rituals of the woodland. These aren't mere pastimes, but ways to anchor the heart.", fullName = BIO_DATA.fullName, location = BIO_DATA.location, hobbies = BIO_DATA.hobbies, values = BIO_DATA.values, editable = false, onChange, onQuoteChange, onHobbyChange, onNameChange, onLocationChange, onClosingQuoteChange, onCommunionIntroChange, onValueChange, onEdit }: AboutProps) {
  // Dynamically map icon names
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Leaf':
        return <Leaf className="w-6 h-6 text-sage" />;
      case 'Compass':
        return <Compass className="w-6 h-6 text-olive" />;
      case 'PenTool':
        return <PenTool className="w-6 h-6 text-stone" />;
      default:
        return <Leaf className="w-6 h-6 text-sage" />;
    }
  };

  return (
    <section id="about" className="py-10 md:py-12 bg-transparent relative overflow-hidden">
      {/* Anchor for Introduction */}
      <div id="introduction" className="absolute -top-10 left-0"></div>

      {/* Background Decorative Shapes */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-sage/5 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-0 w-72 h-72 bg-olive/5 rounded-full filter blur-2xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] text-sage font-bold inline-flex items-center gap-1.5 mb-3">
            <Sprout className="w-3.5 h-3.5" /> Introduction & Philosophy
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-forest font-bold tracking-tight">
            An Unhurried Life: Introduction
          </h2>
          <p className="text-stone-light text-xs font-serif italic mt-2">
            "We grow when we root ourselves deeply in the earth."
          </p>
        </div>

        {/* Main Grid: Summary & Hobbies */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          
          {/* Biography summary: Styled like high-quality Frosted Glass card */}
          <div className="lg:col-span-7 glass-card border border-white/30 shadow-sm rounded-[40px] p-8 md:p-12 relative overflow-hidden flex flex-col justify-between">
            {/* Hand-made deckled edge simulation */}
            <div className="absolute inset-0 border-r-4 border-b-4 border-white/10 pointer-events-none rounded-[40px]"></div>
            
            {/* Subtle botanical leafy watermark in corner */}
            <div className="absolute right-4 bottom-4 text-sage/10 pointer-events-none">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 100 100">
                <path d="M10 80 Q50 30, 90 20 Q80 60, 10 80" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6 text-sage">
                <Bookmark className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest font-bold">The Chronicle Summary</span>
              </div>
              <h3 className="font-serif text-2xl text-forest font-bold mb-6">
                Cultivating Serenity & Art
              </h3>
              <p className="text-sm md:text-base text-stone/90 leading-relaxed font-light mb-6">
                <InlineEditableText value={summary} editable={editable} multiline label="Biography summary" onFocus={onEdit} onChange={onChange} />
              </p>
              <p className="text-sm text-stone/85 leading-relaxed font-light italic border-l-2 border-sage/40 pl-4 py-1">
                "<InlineEditableText value={quote} editable={editable} multiline label="Reflection quote" onFocus={onEdit} onChange={onQuoteChange} />"
              </p>
            </div>

            <div className="pt-8 border-t border-beige-dark/40 flex items-center gap-4 z-10">
              <div className="w-10 h-10 rounded-full border border-beige-dark flex items-center justify-center font-cursive text-xl text-forest font-semibold bg-sage/15">
                A
              </div>
              <div>
                <p className="text-xs font-bold text-forest"><InlineEditableText value={fullName} editable={editable} label="Signature name" onFocus={onEdit} onChange={onNameChange} /></p>
              </div>
            </div>
          </div>

          {/* Hobbies & Interests: Styled as "Warm Cedar/Moss Wood-inspired" Card to match Autumn Wisdom */}
          <div className="lg:col-span-5 bg-forest text-white-warm border border-white/10 shadow-md rounded-[40px] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Grain/wood simulation texture overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-forest-dark/40 to-transparent pointer-events-none"></div>
            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 border border-white/10 rounded-full"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6 text-sage-light">
                <Leaf className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest font-bold">Daily Communion</span>
              </div>
              
              <h3 className="font-serif text-2xl text-white-warm font-light mb-6">
                Interests & Rhythms
              </h3>
              <p className="text-xs text-white-warm/80 mb-6 leading-relaxed">
                <InlineEditableText value={communionIntro} editable={editable} multiline label="Daily communion introduction" onFocus={onEdit} onChange={onCommunionIntroChange} />
              </p>

              <ul className="space-y-3.5">
                {hobbies.map((hobby, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-sage text-white-warm flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                    <span className="text-xs sm:text-sm text-white-warm font-medium leading-tight">
                      <InlineEditableText value={hobby} editable={editable} multiline label={`Interest ${index + 1}`} onFocus={onEdit} onChange={(value) => onHobbyChange?.(index, value)} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 z-10">
              <div className="flex items-center gap-2 text-xs text-sage-light font-serif italic">
                <Sparkles className="w-3.5 h-3.5" />
                <span>"<InlineEditableText value={closingQuote} editable={editable} multiline label="Closing reflection" onFocus={onEdit} onChange={onClosingQuoteChange} />"</span>
              </div>
            </div>
          </div>

        </div>

        {/* Values: Grid of "Stone or Clay" Inspired Cards */}
        <div className="mt-12">
          <h4 className="text-center font-serif text-xs uppercase tracking-widest text-[#97a97c] font-bold mb-8">
            Core Beliefs & Anchors
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, idx) => (
              <div
                key={v.title}
                className="glass-card hover:bg-white-warm border border-white/25 hover:border-sage/40 hover:shadow-lg transition-all duration-300 rounded-[30px] p-6 flex flex-col items-start"
              >
                <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mb-4 border border-sage/20">
                  {renderIcon(v.icon)}
                </div>
                <h5 className="font-serif text-lg text-forest font-bold mb-2">
                  <InlineEditableText value={v.title} editable={editable} label={`Belief ${idx + 1} title`} onFocus={onEdit} onChange={(value) => onValueChange?.(idx, 'title', value)} />
                </h5>
                <p className="text-xs text-stone-light leading-relaxed">
                  <InlineEditableText value={v.description} editable={editable} multiline label={`Belief ${idx + 1} description`} onFocus={onEdit} onChange={(value) => onValueChange?.(idx, 'description', value)} />
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
