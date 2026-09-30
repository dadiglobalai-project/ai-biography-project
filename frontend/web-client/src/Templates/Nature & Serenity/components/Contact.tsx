import React, { useState } from 'react';
import { BIO_DATA } from '../data';
import { Mail, Github, Instagram, Twitter, Heart, Send, Sparkles, Phone, MapPin, Clock, CheckCircle } from 'lucide-react';

export default function Contact() {
  const { contactInfo } = BIO_DATA;
  const [submitted, setSubmitted] = useState(false);
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormState({ name: '', email: '', message: '' });
    }, 6000);
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-transparent relative overflow-hidden">
      {/* Background ambient shade */}
      <div className="absolute inset-0 bg-gradient-to-t from-forest/5 to-transparent pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] text-sage font-bold inline-flex items-center gap-1.5 mb-3">
            <Mail className="w-3.5 h-3.5" /> Contact Information & Dispatch
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-forest font-bold tracking-tight">
            Contact Information
          </h2>
          <p className="text-stone-light text-sm italic mt-2">
            Reach out for botanical commissions, print inquiries, or simply send a hand-addressed note from afar.
          </p>
        </div>

        {/* Contact Coordinates Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* Email */}
          <div className="glass-card p-6 rounded-[24px] border border-white/40 bg-white-warm/70 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center text-forest mb-3">
              <Mail className="w-4 h-4 text-sage" />
            </div>
            <span className="text-[9px] uppercase tracking-widest text-stone-light font-bold block mb-1">Direct Correspondence</span>
            <a href={`mailto:${contactInfo.email}`} className="text-xs font-serif font-bold text-forest hover:text-sage-dark block truncate">
              {contactInfo.email}
            </a>
            <p className="text-[10px] text-stone-light mt-1">Inquiries: {contactInfo.secondaryEmail}</p>
          </div>

          {/* Phone */}
          <div className="glass-card p-6 rounded-[24px] border border-white/40 bg-white-warm/70 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center text-forest mb-3">
              <Phone className="w-4 h-4 text-sage" />
            </div>
            <span className="text-[9px] uppercase tracking-widest text-stone-light font-bold block mb-1">Studio Telephone</span>
            <p className="text-xs font-serif font-bold text-forest">
              {contactInfo.phone}
            </p>
            <p className="text-[10px] text-stone-light mt-1">Pacific Time Zone (Mon–Thu)</p>
          </div>

          {/* Postal Studio Address */}
          <div className="glass-card p-6 rounded-[24px] border border-white/40 bg-white-warm/70 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center text-forest mb-3">
              <MapPin className="w-4 h-4 text-sage" />
            </div>
            <span className="text-[9px] uppercase tracking-widest text-stone-light font-bold block mb-1">Studio Address</span>
            <p className="text-xs font-serif font-bold text-forest">
              {contactInfo.studioName}
            </p>
            <p className="text-[10px] text-stone-light mt-1">{contactInfo.cityStateZip}, USA</p>
          </div>

          {/* Visiting Hours */}
          <div className="glass-card p-6 rounded-[24px] border border-white/40 bg-white-warm/70 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center text-forest mb-3">
              <Clock className="w-4 h-4 text-sage" />
            </div>
            <span className="text-[9px] uppercase tracking-widest text-stone-light font-bold block mb-1">Visits & Retreats</span>
            <p className="text-xs font-serif font-bold text-forest">
              Seasonal Equinoxes
            </p>
            <p className="text-[10px] text-stone-light mt-1">By prior appointment only</p>
          </div>
        </div>

        {/* POSTCARD WRAPPER WITH FROSTED GLASS OVERLAYS */}
        <div className="bg-[#ebd9c5]/60 backdrop-blur-md border border-white/20 shadow-[0_20px_50px_rgba(43,24,16,0.12)] p-4 sm:p-6 md:p-8 rounded-[40px] max-w-4xl mx-auto">
          
          <div className="bg-[#fcf8f0]/90 border border-white rounded-[30px] p-6 sm:p-8 md:p-10 shadow-inner grid grid-cols-1 md:grid-cols-12 gap-8 relative overflow-hidden">
            
            {/* Postcard center divider (Vintage line with a tiny leaf or emblem) */}
            <div className="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-px bg-beige-dark/60 hidden md:block z-0"></div>

            {/* LEFT SIDE: POSTCARD MESSAGE (The UI Contact Form) */}
            <div className="md:col-span-6 relative z-10 pr-0 md:pr-4">
              <span className="text-[10px] uppercase tracking-widest text-[#97a97c] font-bold block mb-4 border-b border-beige-dark/30 pb-2">
                Handwritten Postcard Message
              </span>

              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-forest text-white-warm mx-auto flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-6 h-6 text-sage-light" />
                  </div>
                  <h4 className="font-serif text-xl text-forest font-bold">Postcard Dispatched</h4>
                  <p className="text-xs text-stone-light max-w-xs mx-auto">
                    Your message has been stamped and logged in the studio guestbook. Thank you for your heartfelt words.
                  </p>
                </div>
              ) : (
                /* Form guidelines styled like lines */
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-stone-light block mb-1 font-semibold">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Julian Vance"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full bg-transparent border-b border-beige-dark/80 text-sm py-2 font-serif focus:border-sage focus:outline-none placeholder:text-stone-light/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-stone-light block mb-1 font-semibold">Your Email</label>
                    <input
                      type="email"
                      required
                      placeholder="E.g., julian@wilderness.org"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full bg-transparent border-b border-beige-dark/80 text-sm py-2 font-serif focus:border-sage focus:outline-none placeholder:text-stone-light/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-stone-light block mb-1 font-semibold">Your Reflection / Message</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Share a thought, a wild plant you saw, or a quiet moment from your day..."
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="w-full bg-transparent border-b border-beige-dark/80 text-sm py-2 font-serif focus:border-sage focus:outline-none placeholder:text-stone-light/50 resize-none transition-colors"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-forest hover:bg-forest-light text-white-warm text-xs uppercase tracking-widest py-3.5 px-6 rounded-full transition-all flex items-center justify-center gap-2 shadow-md font-bold"
                    id="send-postcard-button"
                  >
                    <Send className="w-3.5 h-3.5 text-sage-light" />
                    <span>Send Postcard to Studio</span>
                  </button>
                </form>
              )}
            </div>

            {/* RIGHT SIDE: POSTCARD RECIPIENT & VINTAGE STAMP */}
            <div className="md:col-span-6 relative z-10 pl-0 md:pl-8 flex flex-col justify-between min-h-[350px]">
              
              {/* TOP ROW: STAMP & CANCELLATION */}
              <div className="flex justify-between items-start">
                
                {/* Cancellation ink stamp */}
                <div className="w-24 h-24 rounded-full border border-stone-light/30 flex items-center justify-center text-center p-1 text-[9px] font-mono text-stone-light/60 uppercase select-none transform rotate-[-12deg] border-dashed">
                  <div>
                    <p className="font-semibold leading-tight">Mendocino</p>
                    <p className="scale-75 my-0.5">★★</p>
                    <p className="text-[7px]">02 JUL 2026</p>
                  </div>
                </div>

                {/* Scalloped Vintage Postage Stamp - themed colors */}
                <div className="w-16 h-20 bg-[#f4e6d4] border-2 border-stone-light/30 p-1 shadow-md transform rotate-6 hover:rotate-0 transition-transform">
                  <div className="w-full h-full border border-dashed border-stone-light/50 flex flex-col items-center justify-between p-1 bg-[#fffdf9]">
                    {/* Tiny Pine Cone Vector inside stamp */}
                    <svg className="w-8 h-8 text-sage" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C11 3 8 7 8 11C8 14 10 17 12 21C14 17 16 14 16 11C16 7 13 3 12 2Z" />
                    </svg>
                    <span className="text-[7px] font-mono text-stone font-bold">SERENITY 24¢</span>
                  </div>
                </div>

              </div>

              {/* MIDDLE ROW: PREFILLED STUDIO ADDRESS */}
              <div className="my-6 space-y-2 text-stone font-serif italic text-sm border-l-2 border-sage pl-4 py-2">
                <p className="font-semibold text-forest font-sans not-italic text-xs uppercase tracking-wider">Recipient Address</p>
                <p className="text-forest font-bold text-base">{contactInfo.name}</p>
                <p>{contactInfo.studioName}</p>
                <p>{contactInfo.addressLine1}</p>
                <p>{contactInfo.cityStateZip}</p>
                <p className="text-xs font-sans not-italic font-bold text-sage flex items-center gap-1 mt-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{contactInfo.email}</span>
                </p>
              </div>

              {/* BOTTOM ROW: SOCIAL LINKS & CREDITS */}
              <div className="pt-4 border-t border-beige-dark/30">
                <p className="text-[9px] uppercase tracking-widest text-[#97a97c] font-bold mb-2">Connect in the canopy</p>
                <div className="flex items-center gap-3">
                  {contactInfo.socials.map((soc) => (
                    <a
                      key={soc.platform}
                      href={soc.url}
                      title={`${soc.platform}: ${soc.handle}`}
                      className="px-3 py-1.5 rounded-full border border-beige-dark/80 flex items-center gap-1.5 text-stone hover:text-forest hover:border-forest hover:bg-forest/5 text-[10px] font-mono transition-all"
                    >
                      {soc.platform === 'Instagram' && <Instagram className="w-3.5 h-3.5" />}
                      {soc.platform === 'Flora Archive' && <Github className="w-3.5 h-3.5" />}
                      {soc.platform !== 'Instagram' && soc.platform !== 'Flora Archive' && <Sparkles className="w-3.5 h-3.5 text-sage" />}
                      <span>{soc.platform}</span>
                    </a>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Footer Credit & Sparkle */}
        <div className="mt-16 text-center text-[10px] text-stone-light/80 font-mono flex flex-col items-center gap-2 font-bold">
          <div className="flex items-center gap-1.5 text-forest/60">
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>Complete Living Biography Template</span>
          </div>
          <p>© 2026 {contactInfo.name}. Designed with unhurried intent in Mendocino. All rights reserved.</p>
        </div>

      </div>
    </section>
  );
}
