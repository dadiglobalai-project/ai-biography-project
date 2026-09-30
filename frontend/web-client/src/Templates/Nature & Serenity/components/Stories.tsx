import React from 'react';
import { BIO_DATA } from '../data';
import { BookOpen, Calendar, ChevronRight, PenTool } from 'lucide-react';
import InlineEditableText from '../../../components/InlineEditableText';

type Story = { title: string; description: string; date: string; category: string; image?: string };
export default function Stories({ stories = BIO_DATA.stories, editable = false, onEdit, onChange, onImageChange }: { stories?: Story[]; editable?: boolean; onEdit?: () => void; onChange?: (index: number, field: 'category' | 'date' | 'title' | 'description', value: string) => void; onImageChange?: (index: number) => void }) {
  return (
    <section id="stories" className="py-10 md:py-12 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] text-sage font-bold inline-flex items-center gap-1.5 mb-3">
            <BookOpen className="w-3.5 h-3.5" /> Stories & Journal Chronicles
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-forest font-bold tracking-tight">
            Leaves from the Journal: Stories
          </h2>
          <p className="text-stone-light text-xs sm:text-sm italic mt-2">
            Quiet personal stories of woodland mornings and mountain encounters, written with dipping ink.
          </p>
        </div>

        {/* Stories Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <article
              key={story.title}
              className="glass-card border border-white/25 shadow-md hover:shadow-xl rounded-[30px] overflow-hidden hover:bg-white-warm/60 transition-all duration-500 flex flex-col justify-between group"
            >
              {/* Journal Cover Image */}
              <div className="relative h-48 overflow-hidden bg-beige-light/40">
                <img
                  src={story.image || "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80"}
                  alt={story.title}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                {editable && <button type="button" onClick={() => onImageChange?.(index)} className="absolute inset-0 m-auto h-fit w-fit rounded-full bg-slate-950/85 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100">Change picture</button>}
                <div className="absolute inset-0 bg-gradient-to-t from-white-warm to-transparent opacity-85"></div>
                <div className="absolute top-4 left-4 bg-forest text-white-warm text-[8px] uppercase tracking-widest px-3 py-1 rounded-full font-bold shadow-sm">
                  <InlineEditableText value={story.category} editable={editable} label={`Story ${index + 1} category`} onFocus={onEdit} onChange={(value) => onChange?.(index, 'category', value)} />
                </div>
              </div>

              {/* Journal Text content */}
              <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between">
                <div>

                  {/* Date & Icon */}
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#97a97c] mb-3 font-mono font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    <InlineEditableText value={story.date} editable={editable} label={`Story ${index + 1} date`} onFocus={onEdit} onChange={(value) => onChange?.(index, 'date', value)} />
                  </div>

                  {/* Elegant Title */}
                  <h3 className="font-serif text-xl text-forest font-bold mb-4 leading-snug group-hover:text-sage-dark transition-colors">
                    <InlineEditableText value={story.title} editable={editable} label={`Story ${index + 1} title`} onFocus={onEdit} onChange={(value) => onChange?.(index, 'title', value)} />
                  </h3>

                  {/* Journal Description */}
                  <p className="text-xs sm:text-sm text-stone leading-relaxed font-light mb-6 line-clamp-4">
                    "<InlineEditableText value={story.description} editable={editable} multiline label={`Story ${index + 1} description`} onFocus={onEdit} onChange={(value) => onChange?.(index, 'description', value)} />"
                  </p>
                </div>

                {/* Footnotes & Botanical Emblem */}
                <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs text-sage-dark font-semibold">
                  <div className="flex items-center gap-1 font-serif italic">
                    <PenTool className="w-3.5 h-3.5 text-stone-light" />
                    <span><InlineEditableText value="Aveline's Hand" editable={editable} label={`Story ${index + 1} author`} onFocus={onEdit} onChange={() => undefined} /></span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold group-hover:text-forest transition-colors">
                    <span>Read Journal</span>
                    <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>

            </article>
          ))}
        </div>

        {/* Floating signature quote */}
        <div className="mt-16 text-center">
          <div className="w-20 h-0.5 bg-sage/20 mx-auto mb-6"></div>
          <p className="font-cursive text-3xl text-forest italic">
            "To write is to record the forest's breath."
          </p>
        </div>

      </div>
    </section>
  );
}
