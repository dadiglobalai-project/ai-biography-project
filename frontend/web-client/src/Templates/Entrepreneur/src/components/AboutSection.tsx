/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { User, Bookmark, HeartHandshake } from 'lucide-react';
import { BiographyData, TemplateStyle } from '../types';
import { ThemeStyles } from '../theme';
import LucideIcon from './LucideIcon';

interface AboutSectionProps {
  data: BiographyData;
  style: TemplateStyle;
  styles: ThemeStyles;
}

export default function AboutSection({ data, style, styles }: AboutSectionProps) {
  
  // Staggered entrance animation variants for cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <section id="about" className={`py-20 border-t ${styles.borderLight} ${styles.bodyBg} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className={`inline-flex items-center space-x-1.5 text-xs font-mono tracking-widest ${styles.textSubtitle}`}>
            <User className="w-3.5 h-3.5" />
            <span>01 / The Man Behind the Legacy</span>
          </span>
          <h2 className={`text-3xl md:text-4xl mt-3 mb-4 tracking-tight ${styles.textTitle}`}>
            Biographical Portrait &amp; Character
          </h2>
          <div className={`h-[1px] w-16 mx-auto ${
            style === 'heritage' ? 'bg-[#C5A059]' : style === 'modern' ? 'bg-emerald-500' : 'bg-stone-900'
          }`}></div>
        </div>

        {/* Biography Summary - Wide Layout */}
        <div className="max-w-4xl mx-auto mb-20">
          <h3 className={`text-xl md:text-3xl font-serif mb-6 leading-tight ${
            style === 'heritage' ? 'text-[#0A1F44]' : style === 'modern' ? 'text-zinc-900 font-sans font-semibold' : 'text-stone-900 italic'
          }`}>
            A Journey of Grit, Core Values &amp; Civic Devotion
          </h3>
          
          <p className={`text-base md:text-lg mb-8 leading-relaxed ${styles.textBody}`}>
            {data.biographySummary}
          </p>

          {/* In-text pull quote block */}
          <blockquote className={`p-6 border-l-2 my-8 ${
            style === 'heritage' 
              ? 'bg-white border-[#C5A059] rounded-none shadow-sm' 
              : style === 'modern' 
                ? 'bg-zinc-100 border-emerald-500 rounded-r' 
                : 'bg-stone-100 border-stone-900'
          }`}>
            <p className={`text-base font-medium italic ${
              style === 'heritage' ? 'text-[#0A1F44]' : style === 'modern' ? 'text-zinc-800' : 'text-stone-900'
            }`}>
              “True wealth is never measured by a ledger of assets, but by the strength of the relationships you build, the character you preserve under pressure, and the doors you open for the dreamers who come after you.”
            </p>
            <cite className="block mt-2.5 text-xs font-mono tracking-wider text-stone-500 not-italic uppercase">
              — Daniel Chen, Annual Founders Assembly Address
            </cite>
          </blockquote>
        </div>

        {/* Personal Values Grid Section */}
        <div className="mb-20">
          <div className="flex items-center space-x-2.5 mb-8">
            <HeartHandshake className={`w-5 h-5 ${style === 'heritage' ? 'text-[#C5A059]' : style === 'modern' ? 'text-emerald-500' : 'text-stone-900'}`} />
            <h3 className={`text-xl md:text-2xl ${styles.fontTitle} font-bold ${
              style === 'heritage' ? 'text-[#0A1F44]' : style === 'modern' ? 'text-zinc-950' : 'text-stone-950'
            }`}>
              Guiding Principles &amp; Personal Values
            </h3>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {data.values.map((val) => (
              <motion.div
                key={val.id}
                variants={itemVariants}
                id={`val-card-${val.id}`}
                className={`p-6 border ${styles.borderLight} ${styles.cardBg} ${styles.rounded} ${styles.shadow} flex flex-col justify-between`}
              >
                <div>
                  <div className={`w-10 h-10 flex items-center justify-center mb-4 ${
                    style === 'heritage' 
                      ? 'bg-[#F5F2ED] text-[#0A1F44] rounded-none border border-[#C5A059]/30' 
                      : style === 'modern' 
                        ? 'bg-emerald-50 text-emerald-600 rounded' 
                        : 'bg-stone-100 text-stone-900 border border-stone-900'
                  }`}>
                    <LucideIcon name={val.iconName} className="w-5 h-5" />
                  </div>
                  
                  <h4 className={`text-base font-bold mb-2 ${
                    style === 'heritage' ? 'text-[#0A1F44] font-serif' : style === 'modern' ? 'text-zinc-900 font-sans' : 'text-stone-900 font-serif italic'
                  }`}>
                    {val.name}
                  </h4>
                  
                  <p className={`text-sm ${styles.textBody}`}>
                    {val.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}

export function PursuitsSection({ data, style, styles }: AboutSectionProps) {
  return (
    <section className={`py-16 border-t ${styles.borderLight} ${styles.bodyBg} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2.5 mb-8">
          <Bookmark className={`w-5 h-5 ${style === 'heritage' ? 'text-[#C5A059]' : style === 'modern' ? 'text-emerald-500' : 'text-stone-900'}`} />
          <h3 className={`text-xl md:text-2xl ${styles.fontTitle} font-bold ${
            style === 'heritage' ? 'text-[#0A1F44]' : style === 'modern' ? 'text-zinc-950' : 'text-stone-950'
          }`}>
            Hobbies, Habits &amp; Personal Interests
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.hobbies.map((hob) => (
            <div
              key={hob.id}
              id={`hobby-card-${hob.id}`}
              className={`flex space-x-4 p-5 rounded-lg border border-dotted ${styles.borderLight} hover:bg-stone-50/50 transition-colors duration-200`}
            >
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 flex items-center justify-center ${
                  style === 'heritage' ? 'text-[#C5A059]' : style === 'modern' ? 'text-emerald-500' : 'text-stone-800'
                }`}>
                  <LucideIcon name={hob.iconName} className="w-4.5 h-4.5" />
                </div>
              </div>

              <div>
                <h4 className={`text-sm font-bold ${
                  style === 'heritage' ? 'text-[#0A1F44] font-serif' : style === 'modern' ? 'text-zinc-900' : 'text-stone-900'
                }`}>
                  {hob.name}
                </h4>
                <p className="text-xs mt-1 text-stone-500 leading-relaxed">
                  {hob.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
