import React from 'react';
import { BIO_DATA } from '../data';
import { CupSoda, BookOpen, Feather, Radio, Footprints, CloudRain, Heart } from 'lucide-react';
import InlineEditableText from '../../../components/InlineEditableText';

interface DailyJoysProps {
  joys?: Array<{ title: string; description: string }>;
  editable?: boolean;
  onChange?: (index: number, field: 'title' | 'description', value: string) => void;
  onEdit?: () => void;
}

export default function DailyJoys({ joys = BIO_DATA.joys, editable = false, onChange, onEdit }: DailyJoysProps) {
  // Map icons dynamically
  const joyIcons = [
    <CupSoda className="w-5 h-5 text-sage" />,
    <BookOpen className="w-5 h-5 text-olive" />,
    <Feather className="w-5 h-5 text-stone" />,
    <Radio className="w-5 h-5 text-sage" />,
    <Footprints className="w-5 h-5 text-stone-light" />,
    <CloudRain className="w-5 h-5 text-olive" />,
  ];

  return (
    <section id="joys" className="py-10 md:py-12 bg-transparent relative overflow-hidden">
      {/* Soft background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sage/5 rounded-full filter blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] text-sage font-bold inline-flex items-center gap-1.5 mb-3">
            <Heart className="w-3.5 h-3.5 text-red-500/60" /> Daily liturgies
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-forest font-bold tracking-tight">
            Liturgies of Daily Joy
          </h2>
          <p className="text-stone-light text-xs sm:text-sm italic mt-2">
            The small, quiet rituals that keep the heart grounded and the senses awake.
          </p>
        </div>

        {/* Minimalist Grid of Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {joys.map((joy, idx) => (
            <div
              key={joy.title}
              className="glass-card border border-white/30 shadow-sm hover:bg-white-warm/60 rounded-[30px] p-6 transition-all duration-300 flex items-start gap-4 group"
            >
              {/* Joy Icon Container */}
              <div className="w-12 h-12 rounded-2xl bg-sage/15 flex items-center justify-center flex-shrink-0 border border-sage/10 group-hover:bg-white group-hover:scale-105 transition-all duration-300">
                {joyIcons[idx] || <Heart className="w-5 h-5 text-sage" />}
              </div>

              {/* Text content */}
              <div>
                <h3 className="font-serif text-lg text-forest font-bold mb-1 group-hover:text-sage-dark transition-colors">
                  <InlineEditableText value={joy.title} editable={editable} label={`Daily joy ${idx + 1} title`} onFocus={onEdit} onChange={(value) => onChange?.(idx, 'title', value)} />
                </h3>
                <p className="text-xs text-stone leading-relaxed font-light">
                  <InlineEditableText value={joy.description} editable={editable} multiline label={`Daily joy ${idx + 1} description`} onFocus={onEdit} onChange={(value) => onChange?.(idx, 'description', value)} />
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Closing reflection */}
        <div className="mt-12 text-center text-xs text-stone font-bold uppercase tracking-widest">
          🌸 SIMPLE MOMENTS, DEEP LIVING 🌸
        </div>

      </div>
    </section>
  );
}
