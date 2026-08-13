/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Calendar, Camera, Clock, ArrowRight } from 'lucide-react';
import { BiographyData, TemplateStyle } from '../types';
import { ThemeStyles } from '../theme';
import type { EditableImageTarget } from '../../../LifeJourney/types';

interface StoriesSectionProps {
  data: BiographyData;
  style: TemplateStyle;
  styles: ThemeStyles;
  onImageChangeRequest?: (target: EditableImageTarget) => void;
}

export default function StoriesSection({ data, style, styles, onImageChangeRequest }: StoriesSectionProps) {
  
  return (
    <section id="stories" className={`py-20 border-t ${styles.borderLight} ${styles.bodyBg} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className={`inline-flex items-center space-x-1.5 text-xs font-mono tracking-widest ${styles.textSubtitle}`}>
            <BookOpen className="w-3.5 h-3.5" />
            <span>04 / Philosophical Anecdotes</span>
          </span>
          <h2 className={`text-3xl md:text-4xl mt-3 mb-4 tracking-tight ${styles.textTitle}`}>
            Memories, Essays &amp; Leadership Lessons
          </h2>
          <div className={`h-[1px] w-16 mx-auto ${
            style === 'heritage' ? 'bg-[#C5A059]' : style === 'modern' ? 'bg-emerald-500' : 'bg-stone-900'
          }`}></div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.stories.map((story, index) => (
            <article
              key={story.id}
              id={`story-card-${story.id}`}
              className={`flex flex-col h-full ${styles.cardBg} border ${styles.borderLight} overflow-hidden ${styles.rounded} ${styles.shadow}`}
            >
              
              {/* Card Header Image */}
              <div className="aspect-[16/10] relative overflow-hidden bg-stone-100 flex-shrink-0 group/image">
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover contrast-105 hover:scale-102 transition-all duration-500"
                />
                
                {/* Visual Category Label */}
                <div className="absolute top-4 left-4">
                  <span className={`text-[10px] font-mono tracking-wider font-semibold uppercase px-2.5 py-1 rounded bg-black/70 text-white border border-white/15`}>
                    {story.category}
                  </span>
                </div>
                {onImageChangeRequest && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onImageChangeRequest({
                        section: 'stories',
                        itemIndex: index,
                        itemId: story.id,
                      });
                    }}
                    className="pointer-events-auto absolute bottom-4 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/85 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white opacity-100 shadow-lg backdrop-blur-sm transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#C5A059] sm:pointer-events-none sm:opacity-0 sm:group-hover/image:pointer-events-auto sm:group-hover/image:opacity-100 sm:group-focus-within/image:pointer-events-auto sm:group-focus-within/image:opacity-100"
                    aria-label="Change picture"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Change Picture
                  </button>
                )}
              </div>

              {/* Card Body Content */}
              <div className="p-6 flex flex-col flex-grow justify-between">
                <div>
                  
                  {/* Date & Read time */}
                  <div className="flex items-center space-x-3 text-[10px] font-mono text-stone-400 mb-3 uppercase">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-stone-500" />
                      {story.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-stone-500" />
                      {story.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-lg md:text-xl font-bold mb-3 hover:text-[#C5A059] transition-colors ${
                    style === 'heritage' ? 'font-serif text-[#0A1F44]' : style === 'modern' ? 'font-sans text-zinc-900' : 'font-serif italic text-stone-950'
                  }`}>
                    {story.title}
                  </h3>

                  {/* Description */}
                  <p className={`text-sm mb-6 ${styles.textBody} line-clamp-4`}>
                    {story.description}
                  </p>

                </div>

                {/* Simulated UI action link */}
                <div className={`border-t ${styles.borderLight} pt-4 mt-auto`}>
                  <span className={`inline-flex items-center text-xs font-semibold uppercase tracking-wider cursor-pointer group hover:opacity-85 ${
                    style === 'heritage' ? 'text-[#0A1F44]' : style === 'modern' ? 'text-emerald-600' : 'text-stone-900'
                  }`}>
                    <span>Read Full Essay</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>

              </div>

            </article>
          ))}
        </div>



      </div>
    </section>
  );
}
