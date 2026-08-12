import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Layers3,
  Library,
  LockKeyhole,
  PenLine,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import lifeJourneyThumbnail from '../Templates/LifeJourney/assets/images/life-journey-thumbnail.png';
import vintageChildhoodImage from '../Templates/LifeJourney/assets/images/vintage_childhood_1782780756418.jpg';
import vintageFamilyImage from '../Templates/LifeJourney/assets/images/vintage_family_1782780785598.jpg';
import vintageWriterImage from '../Templates/LifeJourney/assets/images/vintage_writer_1782780772321.jpg';

const steps = [
  {
    step: '01',
    title: 'Choose Your Path',
    description: 'Begin with DIY building or professional biography support.',
    icon: Layers3,
  },
  {
    step: '02',
    title: 'Select a Template',
    description: 'Start from a structured layout designed for life stories.',
    icon: BookOpen,
  },
  {
    step: '03',
    title: 'Edit With AI Assistance',
    description: 'Shape the writing, timeline, images, and memories in one workspace.',
    icon: Sparkles,
  },
  {
    step: '04',
    title: 'Save and Publish',
    description: 'Preserve the biography as a living digital archive.',
    icon: CheckCircle2,
  },
];

const tools = [
  {
    title: 'Biography Website',
    description: 'A dedicated space for long-form stories, milestones, photos, and family memories.',
    icon: FileText,
  },
  {
    title: 'Media Library',
    description: 'Upload and reuse biography images across profile, gallery, timeline, and story sections.',
    icon: ImageIcon,
  },
  {
    title: 'AI Writing Assistant',
    description: 'Generate, rewrite, improve, and expand biography text without leaving the editor.',
    icon: Brain,
  },
];

const templates = [
  {
    title: 'Life Journey',
    subtitle: 'Complete personal memoir',
    image: lifeJourneyThumbnail,
  },
  {
    title: 'Visionary Legacy',
    subtitle: 'For leaders and creators',
    image: vintageWriterImage,
  },
  {
    title: 'Entrepreneur Story',
    subtitle: 'For founders and pioneers',
    image: vintageFamilyImage,
  },
];

const paths = [
  {
    title: 'Self-Guided Legacy',
    label: 'DIY Builder',
    description: 'Build your biography with templates, editing tools, AI writing, and media upload support.',
    items: ['Template-based biography website', 'AI writing assistant', 'Media library', 'Draft saving'],
    cta: 'Begin DIY Journey',
    featured: false,
  },
  {
    title: 'Concierge Heritage',
    label: 'Professional Service',
    description: 'Work with guided support for a more assisted biography planning and preservation process.',
    items: ['Professional dashboard path', 'Structured biography planning', 'Review-ready content flow', 'Publishing preparation'],
    cta: 'Explore Professional Path',
    featured: true,
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7FBFD] font-sans text-[#0A1128]">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-36 sm:w-40"
            aria-label="Xinghuoji homepage"
          >
            <BrandLogo variant="mobile" />
          </button>

          <nav className="hidden items-center gap-8 text-xs font-bold uppercase tracking-wide text-slate-600 md:flex">
            <a href="#why" className="transition hover:text-[#0A1128]">About</a>
            <a href="#templates" className="transition hover:text-[#0A1128]">Templates</a>
            <a href="#paths" className="transition hover:text-[#0A1128]">Services</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-900 hover:text-[#0A1128]"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="rounded-lg bg-black px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-900"
            >
              Start Your Biography
            </button>
          </div>
        </div>
      </header>

      <main>
        <section
          className="relative min-h-[620px] overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${vintageChildhoodImage})` }}
        >
          <div className="absolute inset-0 bg-[#07111F]/70" />
          <div className="relative mx-auto flex min-h-[620px] max-w-6xl items-end px-5 py-16 md:items-center md:py-24">
            <div className="max-w-3xl text-white">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-amber-100 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                AI Biography & Digital Legacy Platform
              </div>
              <h1 className="font-serif-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
                Preserve Your Story for Future Generations
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-100 md:text-lg">
                Turn meaningful memories, milestones, photos, and reflections into a living biography website that can be edited, saved, and shared.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FED362] px-6 py-3 text-sm font-bold text-[#0A1128] shadow-lg shadow-black/20 transition hover:bg-amber-300"
                >
                  Start Your Biography
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#templates"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Preview Templates
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="why" className="bg-white px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#B18625]">
                The Eternal Spark
              </p>
              <h2 className="mt-3 font-serif-display text-3xl font-semibold tracking-tight md:text-4xl">
                Why Legacy Matters
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                A biography gives memories structure, context, and a place where future generations can return.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: 'Where Do I Come From?',
                  description: 'Preserve the people, places, and choices that shaped your family story.',
                  icon: Library,
                },
                {
                  title: 'Who Am I?',
                  description: 'Gather personal values, milestones, and reflections in your own voice.',
                  icon: PenLine,
                },
                {
                  title: 'Where Am I Going?',
                  description: 'Create a future-facing archive that can continue to grow over time.',
                  icon: UsersRound,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="rounded-lg border border-slate-100 bg-[#F8FAFC] p-6 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[#B18625] shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 font-serif-display text-xl font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#EAF4F7] px-5 py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#B18625]">
                  A Journey of Remembrance
                </p>
                <h2 className="mt-3 font-serif-display text-3xl font-semibold tracking-tight md:text-4xl">
                  Steps 01-04
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-slate-600">
                The flow is simple enough for first-time users, but structured enough for a complete biography.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {steps.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.step} className="rounded-lg border border-white/80 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-xs font-bold text-white">
                        {item.step}
                      </span>
                      <Icon className="h-4 w-4 text-[#B18625]" />
                    </div>
                    <h3 className="mt-5 text-sm font-bold">{item.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-serif-display text-3xl font-semibold tracking-tight md:text-4xl">
              Advanced Preservation Tools
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {tools.map((item, index) => {
                const Icon = item.icon;
                const featured = index === 0;

                return (
                  <article
                    key={item.title}
                    className={`rounded-lg border p-6 ${
                      featured
                        ? 'border-black bg-black text-white'
                        : 'border-slate-100 bg-[#EAF4F7] text-[#0A1128]'
                    }`}
                  >
                    <div className={`mb-10 flex h-11 w-11 items-center justify-center rounded-lg ${
                      featured ? 'bg-[#FED362] text-[#0A1128]' : 'bg-white text-[#B18625]'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-serif-display text-2xl font-bold">{item.title}</h3>
                    <p className={`mt-3 text-sm leading-relaxed ${featured ? 'text-slate-200' : 'text-slate-600'}`}>
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="templates" className="bg-[#F7FBFD] px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#B18625]">
                  Elegance in Every Story
                </p>
                <h2 className="mt-3 font-serif-display text-3xl font-semibold tracking-tight md:text-4xl">
                  Biography Templates
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:border-black hover:text-black"
              >
                Start to Preview
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {templates.map((template) => (
                <article key={template.title} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="aspect-[4/3] overflow-hidden rounded-md bg-slate-100">
                    <img
                      src={template.image}
                      alt={`${template.title} preview`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="px-1 py-4">
                    <h3 className="font-serif-display text-xl font-bold">{template.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{template.subtitle}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-serif-display text-3xl italic leading-snug text-[#0A1128] md:text-4xl">
              “A life story becomes easier to share when memories, images, and milestones finally have one place to live.”
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF4F7] text-sm font-bold">
                X
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Xinghuoji Team</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">Digital Legacy Platform</p>
              </div>
            </div>
          </div>
        </section>

        <section id="paths" className="bg-[#F7FBFD] px-5 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="font-serif-display text-3xl font-semibold tracking-tight md:text-4xl">
                Choose Your Path
              </h2>
              <p className="mt-3 text-sm text-slate-500">Start with the level of guidance that fits your story.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {paths.map((path) => (
                <article
                  key={path.title}
                  className={`rounded-lg border p-6 shadow-sm ${
                    path.featured
                      ? 'border-black bg-black text-white'
                      : 'border-slate-200 bg-white text-[#0A1128]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wide ${path.featured ? 'text-[#FED362]' : 'text-[#B18625]'}`}>
                        {path.label}
                      </p>
                      <h3 className="mt-2 font-serif-display text-2xl font-bold">{path.title}</h3>
                    </div>
                    {path.featured && (
                      <span className="rounded-full bg-[#FED362] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0A1128]">
                        Guided
                      </span>
                    )}
                  </div>
                  <p className={`mt-4 text-sm leading-relaxed ${path.featured ? 'text-slate-200' : 'text-slate-600'}`}>
                    {path.description}
                  </p>
                  <ul className="mt-5 space-y-3">
                    {path.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className={`h-4 w-4 ${path.featured ? 'text-[#FED362]' : 'text-[#B18625]'}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition ${
                      path.featured
                        ? 'bg-[#FED362] text-[#0A1128] hover:bg-amber-300'
                        : 'border border-slate-300 bg-white text-[#0A1128] hover:border-black'
                    }`}
                  >
                    {path.cta}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-black px-5 py-20 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <LockKeyhole className="mx-auto h-8 w-8 text-[#FED362]" />
            <h2 className="mt-5 font-serif-display text-4xl font-semibold leading-tight md:text-5xl">
              Every life is a masterpiece waiting to be told.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Begin your legacy journey today and turn your story into a lasting digital archive.
            </p>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="mt-8 rounded-lg bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-[#FED362]"
            >
              Begin Your Legacy Journey
            </button>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
              No credit card required to start
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-white px-5 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 border-t border-slate-100 pt-8 md:grid-cols-[1.2fr_2fr]">
          <div>
            <BrandLogo variant="mobile" className="w-40" />
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-slate-500">
              Preserving the human narrative through biography, memory, and digital legacy.
            </p>
          </div>
          <div className="grid gap-6 text-xs sm:grid-cols-3">
            <div>
              <p className="font-bold uppercase tracking-wide text-slate-900">Platform</p>
              <div className="mt-3 grid gap-2 text-slate-500">
                <a href="#why" className="hover:text-[#0A1128]">About</a>
                <a href="#templates" className="hover:text-[#0A1128]">Templates</a>
                <a href="#paths" className="hover:text-[#0A1128]">Services</a>
              </div>
            </div>
            <div>
              <p className="font-bold uppercase tracking-wide text-slate-900">Account</p>
              <div className="mt-3 grid gap-2 text-slate-500">
                <button type="button" onClick={() => navigate('/register')} className="w-fit hover:text-[#0A1128]">Register</button>
                <button type="button" onClick={() => navigate('/login')} className="w-fit hover:text-[#0A1128]">Login</button>
                <button type="button" onClick={() => navigate('/forgot-password')} className="w-fit hover:text-[#0A1128]">Forgot Password</button>
              </div>
            </div>
            <div>
              <p className="font-bold uppercase tracking-wide text-slate-900">Connect</p>
              <p className="mt-3 text-slate-500">Build, edit, and preserve a biography website from one workspace.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
