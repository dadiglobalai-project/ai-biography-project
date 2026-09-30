import React from 'react';
import { BIO_DATA } from '../data';
import { Flower, Star, Flame, Quote, PenTool, CheckCircle } from 'lucide-react';
import InlineEditableText from '../../../components/InlineEditableText';

export default function ReflectionGarden({ editable = false, onEdit }: { editable?: boolean; onEdit?: () => void }) {
  return (
    <section id="reflections" className="py-10 md:py-12 bg-transparent relative overflow-hidden">
      {/* Decorative leaf watermarks floating */}
      <div className="absolute top-10 right-10 w-64 h-64 text-sage/10 pointer-events-none">
        <svg fill="currentColor" viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50 15 Q35 35, 50 60 Q65 35, 50 15 Z" />
          <path d="M50 40 Q40 50, 50 70 Q60 50, 50 40 Z" opacity="0.5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-[10px] uppercase tracking-[0.25em] text-sage font-bold inline-flex items-center gap-1.5 mb-3">
            <Flower className="w-3.5 h-3.5" /> Exclusive sanctuary
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-forest font-bold tracking-tight">
            The Reflection Garden
          </h2>
          <p className="text-stone-light text-xs sm:text-sm italic mt-2">
            A quiet sanctuary dedicated to conscious living, deep wisdom, and gratitude.
          </p>
        </div>

        {/* 2-Column Reflection Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Column 1: Core Reflections (Left side) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Reflection Card: What Brings Me Peace */}
            <div className="glass-card border border-white/30 hover:bg-white-warm shadow-sm rounded-[40px] p-8 transition-all duration-300 relative group">
              <div className="absolute top-6 right-6 text-sage/35">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              
              {/* Elegant Accent Dot indicators from Frosted Glass theme */}
              <div className="flex gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-[#97a97c]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#d4a373]"></div>
              </div>

              <h3 className="font-serif text-2xl text-forest font-bold italic mb-3">
                <InlineEditableText value="What brings me peace?" editable={editable} label="Peace reflection title" onFocus={onEdit} onChange={() => undefined} />
              </h3>
              <p className="text-xs sm:text-sm text-stone leading-relaxed font-light mb-4">
                <InlineEditableText value={BIO_DATA.reflections.peace} editable={editable} multiline label="Peace reflection" onFocus={onEdit} onChange={() => undefined} />
              </p>
              <InlineEditableText value="Solace of forest mornings..." editable={editable} multiline label="Peace reflection signature" onFocus={onEdit} onChange={() => undefined} className="font-cursive text-2xl text-sage-dark/80 block mt-2" />
            </div>

            {/* Reflection Card: Lessons Learned (Handmade Paper / Glass look) */}
            <div className="bg-white-warm border border-white/40 hover:shadow-md rounded-[40px] p-8 transition-all duration-300 relative group">
              <div className="absolute top-6 right-6 text-sage">
                <PenTool className="w-8 h-8 opacity-40" />
              </div>
              
              <div className="flex gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-[#2d3a2d]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#97a97c]"></div>
              </div>

              <h3 className="font-serif text-2xl text-forest font-bold italic mb-3">
                <InlineEditableText value="Lessons learned on the trail" editable={editable} label="Lessons title" onFocus={onEdit} onChange={() => undefined} />
              </h3>
              <p className="text-xs sm:text-sm text-stone leading-relaxed font-light">
                <InlineEditableText value={BIO_DATA.reflections.lessons} editable={editable} multiline label="Lessons reflection" onFocus={onEdit} onChange={() => undefined} />
              </p>
            </div>

            {/* Reflection Card: Life Philosophy */}
            <div className="glass-card border border-white/30 hover:bg-white-warm shadow-sm rounded-[40px] p-8 transition-all duration-300 relative group">
              <div className="flex gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-[#d4a373]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#2d3a2d]"></div>
              </div>
              
              <h3 className="font-serif text-2xl text-forest font-bold italic mb-3">
                <InlineEditableText value="My life philosophy" editable={editable} label="Philosophy title" onFocus={onEdit} onChange={() => undefined} />
              </h3>
              <p className="text-xs sm:text-sm text-stone leading-relaxed font-light">
                <InlineEditableText value={BIO_DATA.reflections.philosophy} editable={editable} multiline label="Life philosophy" onFocus={onEdit} onChange={() => undefined} />
              </p>
            </div>

          </div>

          {/* Column 2: Inspirational Wall & Gratitude (Right side) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* Handwritten Words I Live By Card */}
            <div className="glass-card border border-white/40 rounded-[40px] p-8 relative overflow-hidden flex-grow flex flex-col justify-center shadow-sm">
              {/* Paper line background pattern simulation */}
              <div className="absolute inset-y-0 left-12 w-0.5 bg-red-200/20"></div>
              
              <div className="absolute top-6 right-6 text-forest/10">
                <Quote className="w-16 h-16 transform rotate-180" />
              </div>

              <div className="relative z-10 pl-4">
                <span className="text-[10px] uppercase tracking-widest text-[#97a97c] font-bold mb-4 block">
                  <InlineEditableText value="Words I Live By" editable={editable} label="Words I Live By heading" onFocus={onEdit} onChange={() => undefined} />
                </span>
                
                {BIO_DATA.reflections.quotes.map((q, idx) => (
                  <div key={idx} className="mb-6 last:mb-0">
                    <p className="font-serif text-lg sm:text-xl text-forest italic leading-relaxed">
                      "<InlineEditableText value={q.text} editable={editable} multiline label={`Reflection quote ${idx + 1}`} onFocus={onEdit} onChange={() => undefined} />"
                    </p>
                    <p className="font-cursive text-2xl text-sage-dark block mt-2 text-right">
                      — <InlineEditableText value={q.author} editable={editable} label={`Reflection quote ${idx + 1} author`} onFocus={onEdit} onChange={() => undefined} />
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gratitude summary card: Forest Green aesthetic */}
            <div className="bg-forest text-white-warm border border-white/10 rounded-[40px] p-8 relative overflow-hidden shadow-md">
              <div className="absolute top-[-20px] right-[-20px] w-24 h-24 border border-white/10 rounded-full"></div>
              <h3 className="font-serif text-lg text-white-warm font-bold mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-sage" />
                <span><InlineEditableText value="Things I'm Most Grateful For" editable={editable} label="Gratitude heading" onFocus={onEdit} onChange={() => undefined} /></span>
              </h3>
              <p className="text-xs text-white-warm/80 mb-4 font-light">
                "<InlineEditableText value="Gratitude turns a simple meadow into an exquisite banquet." editable={editable} multiline label="Gratitude introduction" onFocus={onEdit} onChange={() => undefined} />"
              </p>
              <div className="space-y-3.5">
                <div className="flex gap-3 items-start">
                  <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-white-warm/90 leading-relaxed font-light">
                    <InlineEditableText value="Witnessing the microscopic capillary systems inside botanical plates." editable={editable} multiline label="Gratitude item 1" onFocus={onEdit} onChange={() => undefined} />
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-white-warm/90 leading-relaxed font-light">
                    <InlineEditableText value="Pure icy spring water from the high cascades behind our cedar cabin." editable={editable} multiline label="Gratitude item 2" onFocus={onEdit} onChange={() => undefined} />
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
