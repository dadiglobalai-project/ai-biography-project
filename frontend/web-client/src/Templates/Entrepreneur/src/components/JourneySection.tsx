/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Milestone, Sparkles, GraduationCap, Briefcase, Heart, Lightbulb, Compass, MapPin, Clock } from 'lucide-react';
import { BiographyData, TemplateStyle, TimelineCategory } from '../types';
import { ThemeStyles } from '../theme';

interface JourneySectionProps {
  data: BiographyData;
  style: TemplateStyle;
  styles: ThemeStyles;
}

// Map categories to specific icons
const categoryIconMap: Record<TimelineCategory, any> = {
  'Childhood': Sparkles,
  'Education': GraduationCap,
  'Career': Briefcase,
  'Family Life': Heart,
  'Present Day': Compass
};

// Custom biography-focused metadata for Daniel Chen's life stages
const getMilestoneMetadata = (category: TimelineCategory, idx: number) => {
  switch (category) {
    case 'Childhood':
      return { 
        ageRange: 'Age 0 — 17', 
        location: 'Seattle, WA', 
        highlightText: 'Foundational childhood values & early entrepreneurial curiosity',
        achievementCount: '1 Core Stage'
      };
    case 'Education':
      return { 
        ageRange: 'Age 18 — 22', 
        location: 'University of Washington', 
        highlightText: 'Academic systems management, coding systems, & business incubation',
        achievementCount: 'Honors Degree'
      };
    case 'Career':
      return { 
        ageRange: 'Age 23 — 40', 
        location: 'Global & Seattle HQ', 
        highlightText: 'Fostering scalable enterprise solutions, high-stakes pivots, & leadership grit',
        achievementCount: 'Global Expansion'
      };
    case 'Family Life':
      return { 
        ageRange: 'Age 30 — Present', 
        location: 'Bellevue, WA', 
        highlightText: 'Building a shared home legacy of deep mutual trust, growth, & balance',
        achievementCount: '3 Generations'
      };
    case 'Present Day':
      return { 
        ageRange: 'Age 48+', 
        location: 'Pacific Northwest', 
        highlightText: 'Mentoring future-tech startups, establishing charity trusts, & passing the torch',
        achievementCount: 'Legacy Advisory'
      };
    default:
      return { 
        ageRange: `Era ${idx + 1}`, 
        location: 'Seattle, WA', 
        highlightText: 'Key developmental phase',
        achievementCount: 'Milestone'
      };
  }
};

export default function JourneySection({ data, style, styles }: JourneySectionProps) {
  return (
    <section id="journey" className={`py-24 transition-colors duration-500 ${
      style === 'heritage' 
        ? 'bg-[#0A1F44] text-white' 
        : style === 'modern' 
          ? 'bg-zinc-900 text-white' 
          : 'bg-stone-950 text-stone-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className={`inline-flex items-center space-x-1.5 text-xs font-mono tracking-widest uppercase ${
            style === 'heritage' ? 'text-[#C5A059]' : style === 'modern' ? 'text-emerald-400' : 'text-stone-400'
          }`}>
            <Milestone className="w-3.5 h-3.5" />
            <span>02 / Chronological Life Narrative</span>
          </span>
          <h2 className="text-3xl md:text-5xl mt-3 mb-4 tracking-tight font-serif text-white">
            The Journey Map
          </h2>
          <p className={`text-sm md:text-base max-w-xl mx-auto ${style === 'heritage' ? 'text-stone-300' : 'text-stone-400'}`}>
            Explore the chronological evolution of Daniel Chen's values, milestones, and achievements.
          </p>
          <div className={`h-[1px] w-20 mx-auto mt-6 ${
            style === 'heritage' ? 'bg-[#C5A059]' : style === 'modern' ? 'bg-emerald-400' : 'bg-stone-500'
          }`}></div>
        </div>

        {/* Life Timeline Navigation Pills (Pure visual static labels where clicking does nothing) */}
        <div className="flex flex-wrap justify-center gap-2 mb-16 max-w-4xl mx-auto select-none">
          {data.timeline.map((m, idx) => {
            return (
              <div
                key={m.id}
                id={`pill-timeline-${m.id}`}
                className={`px-4 py-2.5 rounded-none text-xs font-mono border flex items-center space-x-2 ${
                  style === 'heritage'
                    ? 'bg-[#0A1F44]/90 text-[#C5A059] border-[#C5A059]/20'
                    : style === 'modern'
                      ? 'bg-zinc-800/80 text-emerald-400 border-zinc-700/80'
                      : 'bg-stone-900/80 text-stone-300 border-stone-800'
                }`}
              >
                <span className="opacity-70 font-bold">0{idx + 1}</span>
                <span className="opacity-30">|</span>
                <span>{m.year.split(' ')[0]}</span>
                <span className="opacity-30">•</span>
                <span>{m.category}</span>
              </div>
            );
          })}
        </div>

        {/* Visual Connected Timeline Track */}
        <div className="relative max-w-5xl mx-auto">
          
          {/* Central Vertical Connector Path (Draws the line on desktop, offset left on mobile) */}
          <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-[2px] -translate-x-1/2 bg-stone-800 hidden md:block">
            {/* Illuminated Progress Track inside the path */}
            <div 
              className={`absolute top-0 bottom-0 w-full opacity-60 ${
                style === 'heritage' ? 'bg-[#C5A059]' : style === 'modern' ? 'bg-emerald-500' : 'bg-stone-500'
              }`}
            />
          </div>

          {/* Chronological Milestones Layout Grid */}
          <div className="space-y-16 relative">
            {data.timeline.map((m, idx) => {
              const CategoryIcon = categoryIconMap[m.category] || Milestone;
              const isEven = idx % 2 === 0;
              const meta = getMilestoneMetadata(m.category, idx);
              
              return (
                <div
                  key={m.id}
                  id={`milestone-row-${m.id}`}
                  className={`relative flex flex-col md:flex-row items-stretch ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Track Line for Mobile Layout */}
                  <div className="absolute left-6 top-10 bottom-0 w-[1px] bg-stone-800 md:hidden -z-10"></div>

                  {/* Card Block Column (takes up exactly half the width on desktop) */}
                  <div className="w-full md:w-1/2 pl-14 md:pl-0 md:px-10">
                    <div 
                      id={`timeline-card-${m.id}`}
                      className={`h-full p-6 md:p-8 rounded-none border relative text-left ${
                        style === 'heritage'
                          ? 'bg-[#0A1F44] border-[#C5A059]/40 shadow-xl shadow-[#C5A059]/5'
                          : style === 'modern'
                            ? 'bg-zinc-800 border-zinc-700 shadow-xl'
                            : 'bg-stone-900 border-stone-800'
                      }`}
                    >
                      {/* Top Accent Line */}
                      <div className={`absolute top-0 left-0 right-0 h-[2px] ${
                        style === 'heritage' ? 'bg-[#C5A059]' : style === 'modern' ? 'bg-emerald-500' : 'bg-stone-500'
                      }`} />

                      {/* Header block with Period, Age & Location details */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                          style === 'heritage' ? 'text-[#C5A059]' : style === 'modern' ? 'text-emerald-400' : 'text-stone-300'
                        }`}>
                          Chapter 0{idx + 1} • {m.category}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${
                            style === 'heritage'
                              ? 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/20'
                              : style === 'modern'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                : 'bg-stone-800 text-stone-200 border border-stone-700'
                          }`}>
                            {meta.ageRange}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-white/5 text-stone-300">
                            {m.year}
                          </span>
                        </div>
                      </div>

                      {/* Title of Milestone */}
                      <h3 className={`text-xl md:text-2xl font-bold mb-3 text-white ${
                        style === 'heritage' ? 'font-serif' : style === 'modern' ? 'font-sans' : 'font-serif italic'
                      }`}>
                        {m.title}
                      </h3>

                      {/* Structured Metadata Row */}
                      <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2.5 my-3 border-t border-b text-[11px] font-mono border-stone-800 text-stone-400`}>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 opacity-70" />
                          <span>{meta.location}</span>
                        </span>
                        <span className="opacity-30">•</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 opacity-70" />
                          <span>{meta.achievementCount}</span>
                        </span>
                      </div>

                      {/* Milestone Description Text */}
                      <p className={`text-sm leading-relaxed ${
                        style === 'heritage' ? 'text-stone-200' : style === 'modern' ? 'text-zinc-300' : 'text-stone-300'
                      }`}>
                        {m.description}
                      </p>

                      {/* Custom descriptive text block below */}
                      <div className={`mt-4 pt-3 border-t text-xs font-mono italic ${
                        style === 'heritage' ? 'border-[#C5A059]/10 text-[#C5A059]/80' : 'border-stone-850 text-emerald-400/80'
                      }`}>
                        ✦ {meta.highlightText}
                      </div>
                    </div>
                  </div>

                  {/* Icon Node Dot in Central/Left track (Purely static visual node) */}
                  <div className="absolute left-6 md:left-1/2 top-10 md:top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center border-2 ${
                        style === 'heritage'
                          ? 'bg-[#C5A059] text-white border-white shadow-md'
                          : style === 'modern'
                            ? 'bg-emerald-500 text-zinc-950 border-zinc-900 shadow-md shadow-emerald-500/20'
                            : 'bg-white text-stone-950 border-stone-950'
                      }`}
                    >
                      <CategoryIcon className="w-4.5 h-4.5" />
                    </div>
                  </div>

                  {/* Empty Spacer side to balance desktop track */}
                  <div className="hidden md:block md:w-1/2"></div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Bottom Callout / Legacy Note */}
        <div className={`mt-24 p-8 text-center rounded-none border max-w-3xl mx-auto ${
          style === 'heritage'
            ? 'bg-[#0A1F44]/50 border-[#C5A059]/20 text-white shadow-xl'
            : style === 'modern'
              ? 'bg-zinc-800/50 border-zinc-700 text-zinc-300'
              : 'bg-stone-900 border-stone-800 text-stone-300'
        }`}>
          <div className="flex items-center justify-center mb-3 text-[#C5A059]">
            <Lightbulb className="w-5 h-5 mr-2" />
            <span className="text-xs font-mono uppercase tracking-widest">Leadership Perspective</span>
          </div>
          <p className="text-sm italic font-serif leading-relaxed">
            “Failure is simply raw data. It shows you what parameters did not work so you can adjust your equation. The only true catastrophe in business is stopping the search for the solution.”
          </p>
          <p className="text-xs font-mono mt-3 text-stone-500">— Daniel Chen, Seattle Business Council, 2014</p>
        </div>

      </div>
    </section>
  );
}
