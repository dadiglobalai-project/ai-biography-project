/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Linkedin, Facebook, Youtube, Globe, Send, CheckCircle2 } from 'lucide-react';
import { BiographyData, TemplateStyle } from '../types';
import { ThemeStyles } from '../theme';

interface ContactSectionProps {
  data: BiographyData;
  style: TemplateStyle;
  styles: ThemeStyles;
}

export default function ContactSection({ data, style, styles }: ContactSectionProps) {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section id="contact" className={`py-20 border-t ${styles.borderLight} ${styles.bodyBg} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className={`inline-flex items-center space-x-1.5 text-xs font-mono tracking-widest ${styles.textSubtitle}`}>
            <Mail className="w-3.5 h-3.5" />
            <span>05 / Public Inquiries</span>
          </span>
          <h2 className={`text-3xl md:text-4xl mt-3 mb-4 tracking-tight ${styles.textTitle}`}>
            Inquiries &amp; Connections
          </h2>
          <div className={`h-[1px] w-16 mx-auto ${
            style === 'heritage' ? 'bg-[#C5A059]' : style === 'modern' ? 'bg-emerald-500' : 'bg-stone-900'
          }`}></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Column: Direct Info & Social Connections */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <h3 className={`text-xl md:text-2xl mb-4 ${styles.textTitle}`}>
                Get in Touch
              </h3>
              <p className={`text-sm mb-8 ${styles.textBody}`}>
                For speaking engagements, legacy foundation microgrants, advisory requests, or editorial interviews, please reach out via the secure channels below.
              </p>

              {/* Direct Email Clipboard Widget */}
              <div className={`p-4 rounded-lg border ${styles.borderLight} ${styles.cardBg} mb-8`}>
                <p className="text-[10px] font-mono uppercase text-stone-500 tracking-wider mb-2">Primary Direct Channel</p>
                <div>
                  <span 
                    className={`text-sm font-mono font-semibold break-all cursor-default ${
                      style === 'heritage' ? 'text-[#0A1F44]' : style === 'modern' ? 'text-[#10b981]' : 'text-stone-950'
                    }`}
                  >
                    {data.email}
                  </span>
                </div>
              </div>

              {/* Social Channels List */}
              <div className="space-y-3.5">
                <p className="text-[10px] font-mono uppercase text-stone-500 tracking-wider">Verified Social Networks</p>
                
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
                  <div
                    className={`flex items-center space-x-3 p-3 ${styles.cardBg} border ${styles.borderLight} rounded-lg transition flex-1 cursor-default`}
                  >
                    <div className="bg-blue-50 text-blue-600 p-1.5 rounded-md">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-stone-500 leading-none">LinkedIn Professional</p>
                      <p className="text-xs font-semibold text-stone-900 mt-0.5">{data.name}</p>
                    </div>
                  </div>

                  <div
                    className={`flex items-center space-x-3 p-3 ${styles.cardBg} border ${styles.borderLight} rounded-lg transition flex-1 cursor-default`}
                  >
                    <div className="bg-purple-50 text-purple-600 p-1.5 rounded-md">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-stone-500 leading-none">Corporate Office</p>
                      <p className="text-xs font-semibold text-stone-900 mt-0.5">chenholdings.com</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
                  <div
                    className={`flex items-center space-x-3 p-3 ${styles.cardBg} border ${styles.borderLight} rounded-lg transition flex-1 cursor-default`}
                  >
                    <div className="bg-red-50 text-red-600 p-1.5 rounded-md">
                      <Youtube className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-stone-500 leading-none">Documentary Channel</p>
                      <p className="text-xs font-semibold text-stone-900 mt-0.5">Chen Legacy Videos</p>
                    </div>
                  </div>

                  <div
                    className={`flex items-center space-x-3 p-3 ${styles.cardBg} border ${styles.borderLight} rounded-lg transition flex-1 cursor-default`}
                  >
                    <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-md">
                      <Facebook className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-stone-500 leading-none">Personal Archiving</p>
                      <p className="text-xs font-semibold text-stone-900 mt-0.5">{data.name} Page</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Right Column: Contact Form Panel */}
          <div className="lg:col-span-7">
            <div className={`p-6 md:p-8 ${styles.cardBg} border ${styles.borderLight} ${styles.rounded} ${styles.shadow}`}>
              
              <h3 className={`text-base font-bold mb-1 ${
                style === 'heritage' ? 'font-serif text-[#0A1F44]' : style === 'modern' ? 'font-sans text-zinc-900' : 'font-serif italic text-stone-950'
              }`}>
                Secure Inquiry Form
              </h3>
              
              <p className="text-xs text-stone-500 font-mono mb-6">
                Fill out the required parameters below to transmit a message.
              </p>

              {/* Form Itself */}
              <form id="biography-contact-form" onSubmit={handleSubmit} className="space-y-4 text-left">
                
                {/* Name field */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-600 mb-1.5 font-bold">
                    Your Name / Organization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="e.g. Executive Partner"
                    className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900 placeholder:text-stone-450 transition"
                  />
                </div>

                {/* Email field */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-600 mb-1.5 font-bold">
                    Your Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="e.g. partner@firm.com"
                    className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900 placeholder:text-stone-450 transition"
                  />
                </div>

                {/* Message field */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-600 mb-1.5 font-bold">
                    Message Body <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder="Specify details regarding your advisory proposal, speaking invitation, or legacy archival inquiry..."
                    className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900 placeholder:text-stone-450 transition resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  id="submit-form-button"
                  className={`w-full py-3.5 px-4 text-xs font-mono font-bold uppercase tracking-widest text-center transition-all duration-300 flex items-center justify-center space-x-2 ${styles.accentBg} ${styles.rounded}`}
                >
                  <span>Transmit Message</span>
                  <Send className="w-3.5 h-3.5" />
                </button>

              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
