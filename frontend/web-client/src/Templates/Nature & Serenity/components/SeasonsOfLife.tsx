import React from 'react';
import { BIO_DATA } from '../data';
import { Leaf, Calendar, Sun, Snowflake, CloudRain } from 'lucide-react';
import InlineEditableText from '../../../components/InlineEditableText';

type Season = { name: string; desc: string; emoji: string; subtitle?: string };
export default function SeasonsOfLife({ seasons = BIO_DATA.seasons, editable = false, onEdit, onChange }: { seasons?: Season[]; editable?: boolean; onEdit?: () => void; onChange?: (index: number, field: 'name' | 'desc' | 'subtitle', value: string) => void }) {
  // Map seasonal backgrounds & styling
  const seasonalStyles = [
    {
      borderColor: 'border-white/20',
      bgColor: 'glass-card text-stone', // Translucent frosted glass card
      accentText: 'text-sage-dark font-bold',
      iconBg: 'bg-sage/15',
      icon: <Leaf className="w-6 h-6 text-sage" />,
      subtitles: 'Childhood • Growth • Dreams'
    },
    {
      borderColor: 'border-white/10',
      bgColor: 'bg-forest text-white-warm shadow-md', // Deep contrast forest card
      accentText: 'text-sage-light font-bold',
      iconBg: 'bg-sage/20',
      icon: <Sun className="w-6 h-6 text-white-warm" />,
      subtitles: 'Education • Career • Adventure'
    },
    {
      borderColor: 'border-white/10',
      bgColor: 'bg-[#3A4D39] text-white shadow-md', // Autumn Wisdom green theme
      accentText: 'text-[#c2cfb4] font-bold',
      iconBg: 'bg-[#97a97c]/30',
      icon: <CloudRain className="w-6 h-6 text-white" />,
      subtitles: 'Family • Wisdom • Meaning'
    },
    {
      borderColor: 'border-white/25',
      bgColor: 'glass-card text-stone', // Translucent frosted glass card
      accentText: 'text-[#a98467] font-bold',
      iconBg: 'bg-olive/10',
      icon: <Snowflake className="w-6 h-6 text-[#a98467]" />,
      subtitles: 'Reflection • Legacy • Future'
    }
  ];

  return (
    <section id="seasons" className="py-10 md:py-12 bg-transparent relative overflow-hidden">
      {/* Decorative leaf watermarks floating in corners */}
      <div className="absolute top-1/2 left-4 w-24 h-24 text-sage/10 pointer-events-none hidden md:block">
        <svg fill="currentColor" viewBox="0 0 100 100">
          <path d="M10 80 Q50 30, 90 20 Q80 60, 10 80" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] text-sage font-bold inline-flex items-center gap-1.5 mb-3">
            <Calendar className="w-3.5 h-3.5" /> Exclusive section
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-forest font-bold tracking-tight">
            The Seasons of Life
          </h2>
          <p className="text-stone-light text-xs sm:text-sm italic mt-2">
            Mapping a human lifespan to the eternal circle of nature. 🌱 ☀ 🍂 ❄
          </p>
        </div>

        {/* 4 Seasons grid with circular overlays matching design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {seasons.map((season, idx) => {
            const style = seasonalStyles[idx];
            return (
              <div
                key={season.name}
                className={`border ${style.borderColor} ${style.bgColor} rounded-[30px] p-6 transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between group h-full relative overflow-hidden`}
              >
                {/* Circular element overlay exactly matching Autumn Wisdom */}
                <div className="absolute top-[-20px] right-[-20px] w-24 h-24 border border-white/10 rounded-full pointer-events-none"></div>

                <div>
                  {/* Top Header */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-2xl font-sans" id={`season-emoji-${season.name.toLowerCase()}`}>{season.emoji}</span>
                    <div className={`p-3 rounded-2xl ${style.iconBg} flex items-center justify-center shrink-0`}>
                      {style.icon}
                    </div>
                  </div>

                  {/* Season Name */}
                  <h3 className="font-serif text-2xl font-bold mb-1 tracking-wide relative z-10">
                    <InlineEditableText value={season.name} editable={editable} label={`Season ${idx + 1} name`} onFocus={onEdit} onChange={(value) => onChange?.(idx, 'name', value)} />
                  </h3>

                  {/* Symbolic Milestones subtitles */}
                  <p className={`text-[10px] uppercase tracking-widest font-semibold ${style.accentText} mb-4 relative z-10`}>
                    <InlineEditableText value={season.subtitle || style.subtitles} editable={editable} label={`Season ${idx + 1} category`} onFocus={onEdit} onChange={(value) => onChange?.(idx, 'subtitle', value)} />
                  </p>

                  <div className="w-12 h-0.5 bg-current/25 mb-4 group-hover:w-20 transition-all duration-500 relative z-10"></div>

                  {/* Description */}
                  <p className="text-xs leading-relaxed font-light mb-6 opacity-90 relative z-10">
                    <InlineEditableText value={season.desc} editable={editable} multiline label={`Season ${idx + 1} description`} onFocus={onEdit} onChange={(value) => onChange?.(idx, 'desc', value)} />
                  </p>
                </div>

                {/* Card Bottom status indicators */}
                <div className="pt-4 border-t border-current/10 flex items-center justify-between text-[9px] uppercase tracking-widest opacity-75 font-mono font-bold relative z-10">
                  <span>CANOPY STAGE: {idx + 1}/4</span>
                  <span>RECORDED</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Transition prompt */}
        <div className="mt-12 text-center text-xs text-stone-light italic">
          "For everything there is a season, and a time for every purpose under heaven." — Ecclesiastes 3:1
        </div>

      </div>
    </section>
  );
}
