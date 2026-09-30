import React from 'react';
import { BIO_DATA } from '../data';
import { Sparkles, Pin } from 'lucide-react';
import InlineEditableText from '../../../components/InlineEditableText';

type Note = { title: string; reflection: string; pinnedAngle: string };
export default function GratitudeWall({ notes = BIO_DATA.gratitude, editable = false, onEdit, onChange }: { notes?: Note[]; editable?: boolean; onEdit?: () => void; onChange?: (index: number, field: 'title' | 'reflection', value: string) => void }) {
  return (
    <section id="gratitude" className="py-10 md:py-12 bg-transparent relative overflow-hidden">
      {/* Soft overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-beige-light/30 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] text-sage font-bold inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Moments of wonder
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-forest font-bold tracking-tight">
            The Gratitude Wall
          </h2>
          <p className="text-stone-light text-xs sm:text-sm italic mt-2">
            A selection of handwritten notes pinned naturally, reminding us of life's quiet abundance.
          </p>
        </div>

        {/* Pinned notes glass layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {notes.map((note, index) => (
            <div
              key={note.title}
              className={`glass-card border border-white/30 shadow-sm rounded-[30px] p-8 relative pt-10 transform ${note.pinnedAngle} hover:rotate-0 hover:scale-103 hover:bg-white-warm/60 transition-all duration-300 group`}
            >
              {/* Metallic Brass Pushpin vector matching theme palette */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                <div className="w-3 h-3 rounded-full bg-[#97a97c] shadow-sm"></div>
                <div className="w-0.5 h-3 bg-[#d4a373] -mt-0.5"></div>
              </div>

              {/* Note Category */}
              <span className="text-[9px] uppercase tracking-widest text-[#97a97c] font-bold block mb-2 text-center border-b border-white/20 pb-2">
                <InlineEditableText value={note.title} editable={editable} label={`Gratitude note ${index + 1} category`} onFocus={onEdit} onChange={(value) => onChange?.(index, 'title', value)} />
              </span>

              {/* Note Reflection */}
              <p className="font-serif italic text-sm text-forest leading-relaxed text-center font-light px-2">
                "<InlineEditableText value={note.reflection} editable={editable} multiline label={`Gratitude note ${index + 1} message`} onFocus={onEdit} onChange={(value) => onChange?.(index, 'reflection', value)} />"
              </p>

              {/* Bottom handwriting signoff */}
              <span className="font-cursive text-xl text-sage-dark text-right block mt-4">
                — <InlineEditableText value="Grateful" editable={editable} label={`Gratitude note ${index + 1} attribution`} onFocus={onEdit} onChange={() => undefined} />
              </span>

            </div>
          ))}
        </div>

        {/* Floating background wildflowers */}
        <div className="mt-16 text-center text-[10px] text-stone font-bold tracking-widest uppercase">
          🌿 "We are rich in everything we choose to cherish." 🌿
        </div>

      </div>
    </section>
  );
}
