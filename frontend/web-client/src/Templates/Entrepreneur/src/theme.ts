/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TemplateStyle } from './types';

export interface ThemeStyles {
  bodyBg: string;
  sectionBgAlt: string;
  cardBg: string;
  textTitle: string;
  textSubtitle: string;
  textBody: string;
  textMuted: string;
  accentBg: string;
  accentBgHover: string;
  accentText: string;
  accentBorder: string;
  borderLight: string;
  borderHeavy: string;
  fontTitle: string;
  fontBody: string;
  fontMono: string;
  shadow: string;
  rounded: string;
  badgeBg: string;
  badgeText: string;
}

export const themeStylesMap: Record<TemplateStyle, ThemeStyles> = {
  heritage: {
    bodyBg: "bg-[#F5F2ED]", // Warm Luxury Ivory Page
    sectionBgAlt: "bg-[#0A1F44] text-white", // Prestige Navy section backgrounds
    cardBg: "bg-white",
    textTitle: "text-[#0A1F44] font-serif",
    textSubtitle: "text-[#C5A059] font-sans tracking-[0.2em] uppercase font-bold",
    textBody: "text-[#1A1A1A]/80 leading-relaxed font-sans",
    textMuted: "text-[#1A1A1A]/60 font-sans",
    accentBg: "bg-[#0A1F44] hover:bg-[#C5A059] text-white transition-colors duration-200",
    accentBgHover: "hover:bg-[#C5A059]",
    accentText: "text-[#C5A059]",
    accentBorder: "border-[#C5A059]",
    borderLight: "border-[#1A1A1A]/10",
    borderHeavy: "border-[#0A1F44]/20",
    fontTitle: "font-serif",
    fontBody: "font-sans",
    fontMono: "font-mono",
    shadow: "shadow-sm border border-[#1A1A1A]/5 hover:border-[#C5A059]/30 transition-all duration-300",
    rounded: "rounded-none", // Sharp gallery-style corners for luxury/prestige
    badgeBg: "bg-[#F5F2ED]",
    badgeText: "text-[#0A1F44] font-mono"
  },
  modern: {
    bodyBg: "bg-zinc-50", // Slate grey minimal page
    sectionBgAlt: "bg-zinc-900 text-white", // Dark charcoal section background
    cardBg: "bg-white",
    textTitle: "text-zinc-900 font-sans font-bold tracking-tight",
    textSubtitle: "text-emerald-600 font-sans tracking-wider uppercase font-bold",
    textBody: "text-zinc-600 leading-relaxed font-sans",
    textMuted: "text-zinc-400 font-sans",
    accentBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
    accentBgHover: "hover:bg-emerald-700",
    accentText: "text-emerald-600",
    accentBorder: "border-zinc-300",
    borderLight: "border-zinc-200",
    borderHeavy: "border-zinc-800",
    fontTitle: "font-sans",
    fontBody: "font-sans",
    fontMono: "font-mono",
    shadow: "shadow-sm hover:shadow-md border border-zinc-200 transition-all duration-200",
    rounded: "rounded-md",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-800"
  },
  editorial: {
    bodyBg: "bg-[#fbfaf6]", // Premium editorial cream
    sectionBgAlt: "bg-stone-950 text-white", // Off-black section background
    cardBg: "bg-[#fbfaf6] border border-stone-800/25",
    textTitle: "text-stone-950 font-serif font-semibold italic",
    textSubtitle: "text-stone-800 font-mono tracking-widest uppercase",
    textBody: "text-stone-800 leading-relaxed font-serif",
    textMuted: "text-stone-500 font-mono text-xs",
    accentBg: "bg-stone-950 hover:bg-stone-800 text-stone-100 border border-stone-800",
    accentBgHover: "hover:bg-stone-900",
    accentText: "text-stone-900 underline decoration-1 underline-offset-4",
    accentBorder: "border-stone-400",
    borderLight: "border-stone-200",
    borderHeavy: "border-stone-900/60",
    fontTitle: "font-serif",
    fontBody: "font-serif",
    fontMono: "font-mono",
    shadow: "shadow-none border border-stone-900/10 hover:border-stone-900/40 transition-colors duration-200",
    rounded: "rounded-none", // Sharp editorial edges
    badgeBg: "bg-stone-200/50",
    badgeText: "text-stone-900"
  }
};
