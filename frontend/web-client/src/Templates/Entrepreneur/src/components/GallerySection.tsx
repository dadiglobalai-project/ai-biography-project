/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Image, Camera, Video } from 'lucide-react';
import { BiographyData, TemplateStyle } from '../types';
import { ThemeStyles } from '../theme';
import type { EditableImageTarget } from '../../../LifeJourney/types';

interface GallerySectionProps {
  data: BiographyData;
  style: TemplateStyle;
  styles: ThemeStyles;
  onImageChangeRequest?: (target: EditableImageTarget) => void;
}

export default function GallerySection({ data, style, styles, onImageChangeRequest }: GallerySectionProps) {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

  const filteredGallery = data.gallery.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <section id="gallery" className={`py-20 border-t ${styles.borderLight} ${styles.bodyBg} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className={`inline-flex items-center space-x-1.5 text-xs font-mono tracking-widest ${styles.textSubtitle}`}>
            <Image className="w-3.5 h-3.5" />
            <span>03 / Historical Archives</span>
          </span>
          <h2 className={`text-3xl md:text-4xl mt-3 mb-4 tracking-tight ${styles.textTitle}`}>
            Media &amp; Photographic Records
          </h2>
          <div className={`h-[1px] w-16 mx-auto ${
            style === 'heritage' ? 'bg-[#C5A059]' : style === 'modern' ? 'bg-emerald-500' : 'bg-stone-900'
          }`}></div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex justify-center space-x-4 mb-10">
          {(['all', 'image', 'video'] as const).map((type) => (
            <button
              key={type}
              id={`filter-btn-${type}`}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all duration-300 border ${
                filter === type
                  ? style === 'heritage'
                    ? 'bg-[#0A1F44] text-[#C5A059] border-[#C5A059] font-semibold'
                    : style === 'modern'
                      ? 'bg-zinc-900 text-emerald-400 border-emerald-400 font-semibold'
                      : 'bg-stone-950 text-white border-stone-950 font-semibold'
                  : style === 'heritage'
                    ? 'bg-transparent text-stone-500 border-stone-200 hover:border-[#C5A059]/50 hover:text-[#0A1F44]'
                    : style === 'modern'
                      ? 'bg-transparent text-zinc-500 border-zinc-200 hover:border-emerald-500/50 hover:text-zinc-900'
                      : 'bg-transparent text-stone-500 border-stone-200 hover:border-stone-900 hover:text-stone-900'
              } ${styles.rounded}`}
            >
              <span className="flex items-center space-x-1.5">
                {type === 'image' && <Camera className="w-3 h-3" />}
                {type === 'video' && <Video className="w-3 h-3" />}
                <span>{type === 'all' ? 'All Records' : `${type}s`}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGallery.map((item) => {
            const itemIndex = data.gallery.findIndex((galleryItem) => galleryItem.id === item.id);

            return (
              <div
                key={item.id}
                id={`gallery-item-${item.id}`}
                className={`group relative overflow-hidden bg-stone-900 cursor-default border ${styles.borderLight} ${styles.rounded} ${styles.shadow}`}
              >
                
                {/* Aspect box container */}
                <div className="aspect-square relative overflow-hidden group/image">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover contrast-110 group-hover:scale-105 transition-all duration-500 ease-out"
                  />

                  {/* Dark overlay with info and caption */}
                  <div className="absolute inset-0 bg-stone-950/40 group-hover:bg-stone-950/70 transition-all duration-300 flex flex-col justify-between p-4">
                    
                    {/* Category Indicator Tag */}
                    <div className="self-start">
                      <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-black/65 text-white border border-white/10 uppercase flex items-center space-x-1">
                        {item.type === 'video' ? (
                          <>
                            <Video className="w-2.5 h-2.5 text-red-400" />
                            <span>Video Clip</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-2.5 h-2.5 text-gold-400" />
                            <span>Photo</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Caption & Title on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white mt-auto pt-2 text-left">
                      <h3 className={`text-sm font-bold truncate ${styles.fontTitle}`}>{item.title}</h3>
                      <p className="text-[10px] text-stone-300 truncate mt-0.5">{item.caption}</p>
                    </div>
                  </div>

                  {onImageChangeRequest && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onImageChangeRequest({
                          section: 'gallery',
                          itemIndex: itemIndex >= 0 ? itemIndex : undefined,
                          itemId: item.id,
                        });
                      }}
                      className="pointer-events-auto absolute left-1/2 top-1/2 z-20 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-black/85 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white opacity-100 shadow-lg backdrop-blur-sm transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#C5A059] sm:pointer-events-none sm:opacity-0 sm:group-hover/image:pointer-events-auto sm:group-hover/image:opacity-100 sm:group-focus-within/image:pointer-events-auto sm:group-focus-within/image:opacity-100"
                      aria-label="Change picture"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      Change Picture
                    </button>
                  )}

                </div>

                {/* Text info block under image (always visible) */}
                <div className={`p-4 ${styles.cardBg} border-t ${styles.borderLight}`}>
                  <p className={`text-xs font-mono font-semibold truncate ${
                    style === 'heritage' ? 'text-[#0A1F44]' : style === 'modern' ? 'text-zinc-900' : 'text-stone-900'
                  }`}>
                    {item.title}
                  </p>
                  <p className="text-[10px] text-stone-400 font-mono mt-0.5 truncate">{item.caption}</p>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
