import React from 'react';
import { BIO_DATA } from '../data';
import { MapPin, ArrowUpRight } from 'lucide-react';
import InlineEditableText from '../../../components/InlineEditableText';

type Place = { name: string; reflection: string; image: string };

export default function FavoritePlaces({ places = BIO_DATA.places, editable = false, onEdit, onChange, onImageChange }: { places?: Place[]; editable?: boolean; onEdit?: () => void; onChange?: (index: number, field: 'name' | 'reflection', value: string) => void; onImageChange?: (index: number) => void }) {
  return (
    <section id="places" className="py-10 md:py-12 bg-transparent relative overflow-hidden">
      {/* Decorative circle */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-sage/5 rounded-full filter blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] text-sage font-bold inline-flex items-center gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5" /> Chapter V
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-forest font-bold tracking-tight">
            Sacred Geography
          </h2>
          <p className="text-stone-light text-xs sm:text-sm italic mt-2">
            The coordinates where my soul is quiet and my pencil flows freely.
          </p>
        </div>

        {/* Places Grid: Beautiful landscape glass cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {places.map((place, index) => (
            <div
              key={place.name}
              className="glass-card border border-white/25 shadow-md hover:shadow-xl rounded-[30px] overflow-hidden hover:bg-white-warm/60 transition-all duration-500 flex flex-col group"
            >
              {/* Landscape Image Container with Zoom effect */}
              <div className="relative h-64 sm:h-72 overflow-hidden bg-beige-light/40">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[1.2s] filter brightness-[0.9] saturate-[0.85]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                {editable && <button type="button" onClick={() => onImageChange?.(index)} className="absolute inset-0 m-auto h-fit w-fit rounded-full bg-slate-950/80 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100">Change picture</button>}
                {/* Location indicator over image */}
                <div className="absolute top-4 left-4 bg-white/70 backdrop-blur-md border border-white/40 text-forest px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-sage" />
                  <span>California Woodlands</span>
                </div>
              </div>

              {/* Text Reflection Content */}
              <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-forest font-bold mb-3 flex items-center justify-between">
                    <InlineEditableText value={place.name} editable={editable} label={`Favorite place ${index + 1} name`} onFocus={onEdit} onChange={(value) => onChange?.(index, 'name', value)} />
                    <ArrowUpRight className="w-5 h-5 text-stone-light/50 group-hover:text-sage-dark transition-colors" />
                  </h3>
                  <p className="text-xs sm:text-sm text-stone leading-relaxed font-light mb-4">
                    "<InlineEditableText value={place.reflection} editable={editable} multiline label={`Favorite place ${index + 1} reflection`} onFocus={onEdit} onChange={(value) => onChange?.(index, 'reflection', value)} />"
                  </p>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
