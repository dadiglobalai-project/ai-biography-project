import React, { useState } from 'react';
import { BIO_DATA, BiographyChapter } from '../data';
import { BookOpen, Calendar, MapPin, Feather, Sparkles, CheckCircle2, ChevronRight, Bookmark } from 'lucide-react';
import InlineEditableText from '../../../components/InlineEditableText';

export default function FullBiography({ fullName = BIO_DATA.fullName, lifespan = BIO_DATA.vitalDetails.lifespan, status = BIO_DATA.vitalDetails.status, birthDate = BIO_DATA.vitalDetails.birthDate, birthPlace = BIO_DATA.vitalDetails.birthPlace, nationality = BIO_DATA.vitalDetails.nationality, location = BIO_DATA.location, profession = BIO_DATA.vitalDetails.profession, editable = false, onEdit, onChange, onImageChange }: { fullName?: string; lifespan?: string; status?: string; birthDate?: string; birthPlace?: string; nationality?: string; location?: string; profession?: string; editable?: boolean; onEdit?: () => void; onChange?: (field: string, value: string) => void; onImageChange?: (index: number) => void }) {
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const chapters: BiographyChapter[] = BIO_DATA.fullBiography;

  return (
    <section id="biography" className="py-16 md:py-24 bg-transparent relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-sage/5 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 -left-20 w-96 h-96 bg-clay/5 rounded-full filter blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-[10px] uppercase tracking-[0.25em] font-bold mb-3">
            <BookOpen className="w-3.5 h-3.5 text-sage" />
            <span>Complete Life Chronicle</span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl text-forest font-bold tracking-tight">
            Full Biography
          </h2>
          <p className="text-stone-light text-sm md:text-base font-serif italic mt-3 max-w-xl mx-auto">
            "A life recorded in wood grain, seasonal snowpacks, and the slow, deliberate craft of ink on cotton rag paper."
          </p>
        </div>

        {/* Vital Record Summary Card */}
        <div className="glass-card border border-white/30 rounded-[32px] p-6 md:p-8 mb-12 shadow-sm bg-white-warm/50 backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-beige-dark/40">
            {/* Person & Lifespan */}
            <div className="pt-3 md:pt-0 md:pr-6">
              <span className="text-[10px] uppercase tracking-widest text-stone-light block font-semibold mb-1">
                Subject & Vital Lifespan
              </span>
              <p className="font-serif text-lg font-bold text-forest"><InlineEditableText value={fullName} editable={editable} label="Full name" onFocus={onEdit} onChange={(value) => onChange?.('fullName', value)} /></p>
              <p className="text-xs text-stone font-mono mt-0.5"><InlineEditableText value={lifespan} editable={editable} label="Lifespan" onFocus={onEdit} onChange={(value) => onChange?.('lifespan', value)} /></p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-sage/20 text-forest text-[9px] font-bold uppercase tracking-wider">
                <InlineEditableText value={status} editable={editable} label="Life status" onFocus={onEdit} onChange={(value) => onChange?.('status', value)} />
              </span>
            </div>

            {/* Birth Details */}
            <div className="pt-3 md:pt-0 md:px-6">
              <span className="text-[10px] uppercase tracking-widest text-stone-light block font-semibold mb-1">
                Birth Details
              </span>
              <p className="text-xs font-serif font-bold text-forest"><InlineEditableText value={birthDate} editable={editable} label="Birth date" onFocus={onEdit} onChange={(value) => onChange?.('birthDate', value)} /></p>
              <p className="text-xs text-stone-light mt-0.5"><InlineEditableText value={birthPlace} editable={editable} label="Birthplace" onFocus={onEdit} onChange={(value) => onChange?.('birthPlace', value)} /></p>
              <p className="text-[10px] text-stone-light font-mono mt-1">Nationality: <InlineEditableText value={nationality} editable={editable} label="Nationality" onFocus={onEdit} onChange={(value) => onChange?.('nationality', value)} /></p>
            </div>

            {/* Location & Sanctuary */}
            <div className="pt-3 md:pt-0 md:px-6">
              <span className="text-[10px] uppercase tracking-widest text-stone-light block font-semibold mb-1">
                Primary Residence & Studio
              </span>
              <p className="text-xs font-serif font-bold text-forest"><InlineEditableText value={location} editable={editable} label="Primary residence" onFocus={onEdit} onChange={(value) => onChange?.('location', value)} /></p>
            </div>

            {/* Calling & Practice */}
            <div className="pt-3 md:pt-0 md:pl-6">
              <span className="text-[10px] uppercase tracking-widest text-stone-light block font-semibold mb-1">
                Calling & Vocation
              </span>
              <p className="text-xs font-serif font-bold text-forest"><InlineEditableText value={profession} editable={editable} label="Profession" onFocus={onEdit} onChange={(value) => onChange?.('profession', value)} /></p>
              <p className="text-xs text-stone-light mt-0.5">Mineral Inks & Classical Botany</p>
            </div>
          </div>
        </div>

        {/* Chapter Filter Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <button
            onClick={() => setSelectedChapterId('all')}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all font-semibold ${
              selectedChapterId === 'all'
                ? 'bg-forest text-white-warm shadow-md'
                : 'bg-white-warm/60 text-stone hover:bg-white-warm border border-beige-dark/50'
            }`}
          >
            Read All Chapters
          </button>
          {chapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChapterId(ch.id)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all font-semibold ${
                selectedChapterId === ch.id
                  ? 'bg-forest text-white-warm shadow-md'
                  : 'bg-white-warm/60 text-stone hover:bg-white-warm border border-beige-dark/50'
              }`}
            >
              {ch.chapterNumber}: <InlineEditableText value={ch.era} editable={editable} label={`${ch.chapterNumber} date range`} onFocus={onEdit} onChange={() => undefined} />
            </button>
          ))}
        </div>

        {/* Chapters Reading Feed */}
        <div className="space-y-16">
          {chapters
            .filter((ch) => selectedChapterId === 'all' || ch.id === selectedChapterId)
            .map((chapter) => (
              <article
                key={chapter.id}
                className="glass-card border border-white/30 rounded-[36px] overflow-hidden shadow-md bg-white-warm/60 backdrop-blur-sm"
              >
                {/* Chapter Heading Banner */}
                <div className="p-8 md:p-12 pb-6 border-b border-beige-dark/30">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                    <span className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-sage">
                      <Bookmark className="w-3.5 h-3.5" />
                      {chapter.chapterNumber} · <InlineEditableText value={chapter.era} editable={editable} label={`${chapter.chapterNumber} header date range`} onFocus={onEdit} onChange={() => undefined} />
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-stone-light bg-beige-light/60 px-3 py-1 rounded-full">
                      Archival Record
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl md:text-4xl text-forest font-bold">
                    <InlineEditableText value={chapter.title} editable={editable} label={`${chapter.chapterNumber} title`} onFocus={onEdit} onChange={() => undefined} />
                  </h3>
                  <p className="text-stone-light text-sm md:text-base font-serif italic mt-1">
                    <InlineEditableText value={chapter.subtitle} editable={editable} multiline label={`${chapter.chapterNumber} subtitle`} onFocus={onEdit} onChange={() => undefined} />
                  </p>
                </div>

                {/* Chapter Body Content with Layout Grid */}
                <div className="p-8 md:p-12 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Text Narrative (Left 7 Cols) */}
                  <div className="lg:col-span-7 space-y-5 text-stone/90 leading-relaxed font-light text-sm sm:text-base">
                    {chapter.paragraphs.map((para, pIdx) => (
                      <p
                        key={pIdx}
                        className={
                          pIdx === 0
                            ? "first-letter:font-serif first-letter:text-5xl first-letter:font-bold first-letter:text-forest first-letter:float-left first-letter:mr-3 first-letter:leading-none"
                            : ""
                        }
                      >
                        <InlineEditableText value={para} editable={editable} multiline label={`${chapter.chapterNumber} paragraph ${pIdx + 1}`} onFocus={onEdit} onChange={() => undefined} />
                      </p>
                    ))}

                    {/* Pull Quote */}
                    {chapter.quote && (
                      <div className="my-6 p-6 rounded-2xl bg-forest/5 border-l-4 border-sage italic font-serif text-forest text-base md:text-lg">
                        "<InlineEditableText value={chapter.quote} editable={editable} multiline label={`${chapter.chapterNumber} quote`} onFocus={onEdit} onChange={() => undefined} />"
                      </div>
                    )}
                  </div>

                  {/* Visual Plate & Highlights (Right 5 Cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Chapter Archival Image */}
                    <div className="relative rounded-[28px] overflow-hidden shadow-lg border border-white/40 aspect-[4/3] group">
                      <img
                        src={chapter.image}
                        alt={chapter.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      {editable && <button type="button" onClick={() => onImageChange?.(chapters.indexOf(chapter))} className="absolute inset-0 m-auto h-fit w-fit rounded-full bg-slate-950/80 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100">Change picture</button>}
                      <div className="absolute inset-0 bg-gradient-to-t from-forest/60 via-transparent to-transparent opacity-60"></div>
                      <div className="absolute bottom-3 left-4 right-4 text-white-warm text-[10px] font-mono tracking-wider">
                        Plate: {chapter.era} · Field Monograph
                      </div>
                    </div>

                    {/* Key Highlights */}
                    <div className="p-6 rounded-[24px] bg-white-warm/80 border border-beige-dark/50">
                      <h4 className="text-[10px] uppercase tracking-widest text-forest font-bold mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sage" />
                        <span>Milestones & Discoveries</span>
                      </h4>
                      <ul className="space-y-2.5">
                        {chapter.keyHighlights.map((item, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-2.5 text-xs text-stone font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sage flex-shrink-0 mt-0.5" />
                            <InlineEditableText value={item} editable={editable} multiline label={`${chapter.chapterNumber} milestone ${hIdx + 1}`} onFocus={onEdit} onChange={() => undefined} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
}
