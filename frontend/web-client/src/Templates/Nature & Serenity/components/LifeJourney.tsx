import React from 'react';
import { BIO_DATA } from '../data';
import { Compass, Leaf, Flower, Anchor, Star, Sparkles, MapPin } from 'lucide-react';
import InlineEditableText from '../../../components/InlineEditableText';

type Milestone = { year: string; title: string; description: string; image: string; location?: string };
export default function LifeJourney({ journey = BIO_DATA.journey, editable = false, onEdit, onChange, onImageChange }: { journey?: Milestone[]; editable?: boolean; onEdit?: () => void; onChange?: (index: number, field: 'year' | 'title' | 'description' | 'location', value: string) => void; onImageChange?: (index: number) => void }) {
  // Map icons to each timeline milestone for a organic botanical feel
  const journeyIcons = [
    <Leaf className="w-5 h-5 text-white-warm" />,
    <Compass className="w-5 h-5 text-white-warm" />,
    <Flower className="w-5 h-5 text-white-warm" />,
    <Anchor className="w-5 h-5 text-white-warm" />,
    <Star className="w-5 h-5 text-white-warm" />,
  ];

  return (
    <section id="timeline" className="py-10 md:py-12 bg-transparent relative overflow-hidden">
      {/* Anchor alias for journey links */}
      <div id="journey" className="absolute -top-10 left-0"></div>

      {/* Decorative background forest assets */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-beige-light/50 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-[10px] uppercase tracking-[0.25em] text-sage font-bold inline-flex items-center gap-1.5 mb-3">
            <Compass className="w-3.5 h-3.5" /> Timeline & Milestones
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-forest font-bold tracking-tight">
            Chronological Life Journey
          </h2>
          <p className="text-stone-light text-xs sm:text-sm italic mt-2 max-w-lg mx-auto">
            A chronological timeline documenting pivotal migrations, botanical discoveries, and milestones along the mountain trail.
          </p>
        </div>

        {/* Winding Trail Timeline Container */}
        <div className="relative">
          
          {/* CURVED SVG RIVER/TRAIL LINE (Visible on Desktop/Lg Screens) */}
          <div className="absolute inset-y-12 left-1/2 -translate-x-1/2 w-48 pointer-events-none hidden lg:block z-0 opacity-60">
            <svg className="w-full h-full" viewBox="0 0 200 1200" fill="none" stroke="#d4a373" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 7">
              {/* Complex bezier curve acting as a winding forest path */}
              <path d="M 100,0 
                       C 40,150 160,250 100,400 
                       C 30,550 170,650 100,800 
                       C 50,950 150,1050 100,1200" />
            </svg>
          </div>

          {/* Timeline Milestones Loop */}
          <div className="space-y-16 md:space-y-24 relative z-10">
            {journey.map((m, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={m.year}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                    isEven ? '' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Card Column (Alternating Left/Right) */}
                  <div
                    className={`lg:col-span-5 ${
                      isEven ? 'order-1 lg:text-right' : 'order-1 lg:order-3 lg:text-left'
                    }`}
                  >
                    <div className="glass-card border border-white/30 p-6 sm:p-8 rounded-[30px] shadow-sm relative hover:bg-white-warm/60 transition-all duration-500 group">
                      
                      {/* Year badge */}
                      <span className="inline-block px-3.5 py-1 rounded-full bg-forest text-white-warm text-[10px] font-bold uppercase tracking-wider mb-4">
                        <InlineEditableText value={m.year} editable={editable} label={`Milestone ${index + 1} year`} onFocus={onEdit} onChange={(value) => onChange?.(index, 'year', value)} />
                      </span>

                      <h3 className="font-serif text-xl sm:text-2xl text-forest font-bold mb-3 group-hover:text-sage-dark transition-colors">
                        <InlineEditableText value={m.title} editable={editable} label={`Milestone ${index + 1} title`} onFocus={onEdit} onChange={(value) => onChange?.(index, 'title', value)} />
                      </h3>

                      <p className="text-xs sm:text-sm text-stone leading-relaxed font-light">
                        <InlineEditableText value={m.description} editable={editable} multiline label={`Milestone ${index + 1} description`} onFocus={onEdit} onChange={(value) => onChange?.(index, 'description', value)} />
                      </p>

                      {/* Small leaf emblem indicating path milestone */}
                      <div className={`absolute top-6 ${isEven ? '-right-3' : '-left-3'} hidden lg:block`}>
                        <div className="w-6 h-6 rounded-full bg-white border border-sage flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all shadow-sm">
                          <Leaf className="w-3 h-3 text-sage" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Central Node Column (Always centered on Desktop, hidden on mobile) */}
                  <div className="lg:col-span-2 flex justify-center order-2 hidden lg:flex">
                    <div className="w-12 h-12 rounded-full bg-forest border-4 border-white-warm shadow-md flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                      {journeyIcons[index] || <Leaf className="w-5 h-5 text-white" />}
                    </div>
                  </div>

                  {/* Image Column */}
                  <div
                    className={`lg:col-span-5 ${
                      isEven ? 'order-3 lg:order-3' : 'order-3 lg:order-1'
                    }`}
                  >
                    <div className="relative group">
                      {/* Frame shadow and border - rustic style */}
                      <div className="absolute inset-0 bg-stone/5 rounded-[30px] transform rotate-2 group-hover:rotate-1 transition-all"></div>
                      <div className="absolute inset-0 bg-sage/10 rounded-[30px] transform -rotate-1 group-hover:rotate-0 transition-all"></div>
                      
                      <div className="relative overflow-hidden rounded-[30px] border-4 border-white shadow-md">
                        <img
                          src={m.image}
                          alt={m.title}
                          className={`w-full h-48 sm:h-64 object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700`}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                        {editable && <button type="button" onClick={() => onImageChange?.(index)} className="absolute inset-0 m-auto h-fit w-fit rounded-full bg-slate-950/80 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100">Change picture</button>}
                        
                        {/* Tiny location pin indicator */}
                        <div className="absolute bottom-3 left-3 bg-white-warm/95 backdrop-blur-md px-3 py-1 rounded-full text-[9px] uppercase tracking-wider text-forest font-semibold flex items-center gap-1 shadow-sm">
                          <MapPin className="w-3 h-3 text-sage" />
                          <InlineEditableText value={m.location || 'Mendocino Woodland'} editable={editable} label={`Milestone ${index + 1} location`} onFocus={onEdit} onChange={(value) => onChange?.(index, 'location', value)} />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Trail Summary/Transition footer */}
        <div className="mt-24 text-center">
          <div className="inline-flex flex-col items-center gap-2 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center border border-sage/20 text-sage">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="font-serif text-lg text-forest italic mt-2">
              "Every footstep has led me deeper into the beauty of the wild."
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
