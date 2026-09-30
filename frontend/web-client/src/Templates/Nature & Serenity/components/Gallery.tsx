import React from 'react';
import { BIO_DATA, GalleryItem } from '../data';
import { Play, Eye, Image as ImageIcon, Camera, Film } from 'lucide-react';

export default function Gallery({ gallery = BIO_DATA.gallery, editable = false, onImageChange }: { gallery?: GalleryItem[]; editable?: boolean; onImageChange?: (index: number) => void }) {
  return (
    <section id="gallery" className="py-10 md:py-12 bg-transparent relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sand/20 rounded-full filter blur-2xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] text-sage font-bold inline-flex items-center gap-1.5 mb-3">
            <Camera className="w-3.5 h-3.5" /> Gallery & Visual Archive
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-forest font-bold tracking-tight">
            Curated Gallery Plates
          </h2>
          <p className="text-stone-light text-xs sm:text-sm italic mt-2">
            Visual transcripts of soil, water, and shadow. Captured with slow intent.
          </p>
        </div>

        {/* Premium Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
          {gallery.map((item, index) => {
            // Determine aspect ratio class to maintain beautiful distinct shapes without gaps
            let aspectClass = '';
            if (item.aspect === 'landscape') {
              aspectClass = 'aspect-[16/10]';
            } else if (item.aspect === 'portrait') {
              aspectClass = 'aspect-[3/4]';
            } else if (item.aspect === 'square') {
              aspectClass = 'aspect-square';
            }

            return (
              <div
                key={item.id}
                className={`break-inside-avoid mb-6 relative group overflow-hidden rounded-[30px] border border-white/20 shadow-md hover:shadow-xl hover:border-white/50 transition-all duration-500 bg-beige-light/40 backdrop-blur-xs ${aspectClass}`}
              >
                {/* Image asset */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 filter brightness-[0.95] contrast-[1.02]"
                  referrerPolicy="no-referrer"
                />
                {editable && <button type="button" onClick={() => onImageChange?.(index)} className="absolute inset-0 m-auto h-fit w-fit rounded-full bg-slate-950/85 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100">Change picture</button>}

                {/* Glassmorphic overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                  
                  {/* Top category label */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-widest bg-white-warm/90 backdrop-blur-sm text-forest font-bold px-2.5 py-1 rounded-full">
                      {item.category}
                    </span>
                    {item.type === 'video' ? (
                      <Film className="w-4 h-4 text-white-warm" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-white-warm" />
                    )}
                  </div>

                  {/* Centered Indicator for Video Placeholders */}
                  {item.type === 'video' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-14 h-14 rounded-full bg-white-warm/30 backdrop-blur-md flex items-center justify-center border border-white-warm/40 shadow-lg transform scale-95 group-hover:scale-100 transition-transform duration-500">
                        <Play className="w-6 h-6 text-white-warm fill-white-warm translate-x-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Bottom title & description */}
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-serif text-sm font-bold leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mb-1">
                      {item.title}
                    </p>
                    <p className="text-white text-[10px] uppercase tracking-widest flex items-center gap-1 font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                      <Eye className="w-3 h-3" />
                      <span>{item.type === 'video' ? 'Play Field Recording' : 'View Botanical Plate'}</span>
                    </p>
                  </div>

                </div>

                {/* Standard card bottom cover for non-hover responsive states (e.g., tablet/mobile) */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 flex flex-col justify-end h-20 md:hidden pointer-events-none">
                  <p className="text-white-warm font-serif text-xs font-bold line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-beige-warm text-[8px] uppercase tracking-widest font-bold">
                    {item.category}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        {/* Dynamic decorative note below gallery - Glassmorphic block */}
        <div className="mt-12 glass-card border border-white/30 rounded-[30px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage/15 flex items-center justify-center text-forest border border-sage/10">
              <Camera className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-forest">The Slow Lens Archive</p>
              <p className="text-[10px] text-stone-light">All plates are cataloged using natural sunlight, no flash, 35mm film format.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
