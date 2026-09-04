import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
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
  QrCode,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import archiveHeroImage from '../assets/images/celestial_library_1781657848291.jpg';
import lifeJourneyThumbnail from '../Templates/LifeJourney/assets/images/life-journey-thumbnail.png';
import vintageFamilyImage from '../Templates/LifeJourney/assets/images/vintage_family_1782780785598.jpg';
import vintageWriterImage from '../Templates/LifeJourney/assets/images/vintage_writer_1782780772321.jpg';

const workflowSteps = [
  {
    step: '01',
    title: 'Choose a Template',
    description: 'Start with a guided biography layout such as Life Journey.',
    icon: Layers3,
  },
  {
    step: '02',
    title: 'Write the Story',
    description: 'Add milestones, memories, photos, and reflections in the editor.',
    icon: PenLine,
  },
  {
    step: '03',
    title: 'Improve With AI',
    description: 'Generate, rewrite, improve grammar, or expand biography text.',
    icon: Brain,
  },
  {
    step: '04',
    title: 'Save and Publish',
    description: 'Save drafts first, then publish once membership is active.',
    icon: CheckCircle2,
  },
];

const templates = [
  {
    title: 'Life Journey',
    subtitle: 'Personal biography, memories, timeline, and gallery.',
    image: lifeJourneyThumbnail,
  },
  {
    title: 'Family Chronicle',
    subtitle: 'A warm archive for family history and shared moments.',
    image: vintageFamilyImage,
  },
  {
    title: 'Founder Story',
    subtitle: 'A structured narrative for builders, leaders, and creators.',
    image: vintageWriterImage,
  },
];

const platformTools = [
  {
    title: 'Biography Editor',
    description: 'Edit the hero story, timeline, gallery, memories, and contact sections in one workspace.',
    icon: FileText,
  },
  {
    title: 'Media Gallery',
    description: 'Upload biography images and reuse them across the published website.',
    icon: ImageIcon,
  },
  {
    title: 'AI Writing Assistant',
    description: 'Ask for suggestions while keeping the biography inside the editor flow.',
    icon: Sparkles,
  },
];

const membershipPoints = [
  'DIY Membership: RMB 360 per year',
  'Manual WeChat payment confirmation',
  '7-day refund window after confirmed payment',
  'Publishing access while membership is active',
];

const trustPoints = [
  {
    title: 'Draft First',
    description: 'Users can begin with a saved biography draft before payment.',
    icon: BookOpen,
  },
  {
    title: 'Manual Review',
    description: 'Admins match payment remarks and confirm membership activation.',
    icon: ReceiptText,
  },
  {
    title: 'Protected Publishing',
    description: 'Publishing is checked against membership status and content readiness.',
    icon: ShieldCheck,
  },
];

const defaultViewport = { once: true, amount: 0.2 };

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const staggerGroup = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function HomePage() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const revealInitial = shouldReduceMotion ? false : 'hidden';
  const revealAnimate = shouldReduceMotion ? undefined : 'visible';
  const hoverLift = shouldReduceMotion ? {} : { y: -4 };

  return (
    <div className="min-h-screen bg-[#F7FBFD] font-sans text-[#0A1128]">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-44 sm:w-48"
            aria-label="Xinghuoji homepage"
          >
            <BrandLogo variant="mobile" />
          </button>

          <nav className="hidden items-center gap-7 text-xs font-bold uppercase text-slate-600 md:flex">
            <a href="#how-it-works" className="transition hover:text-[#0A1128]">How It Works</a>
            <a href="#templates" className="transition hover:text-[#0A1128]">Templates</a>
            <a href="#membership" className="transition hover:text-[#0A1128]">Membership</a>
            <a href="#tools" className="transition hover:text-[#0A1128]">Tools</a>
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
              Start Draft
            </button>
          </div>
        </div>
      </header>

      <main>
        <section
          className="relative min-h-[calc(100svh-7rem)] overflow-hidden bg-cover bg-center"
        >
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${archiveHeroImage})` }}
            initial={shouldReduceMotion ? false : { scale: 1 }}
            animate={shouldReduceMotion ? undefined : { scale: 1.05 }}
            transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
          />
          <div className="absolute inset-0 bg-[#07111F]/72" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />

          <div className="relative mx-auto flex min-h-[calc(100svh-7rem)] max-w-7xl items-end px-5 py-14 md:items-center md:py-20">
            <motion.div
              className="max-w-4xl text-white"
              initial={revealInitial}
              animate={revealAnimate}
              variants={staggerGroup}
            >
              <motion.p
                className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase text-amber-100 backdrop-blur"
                variants={fadeUp}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                <Sparkles className="h-4 w-4" />
                AI Biography & Digital Legacy Platform
              </motion.p>
              <motion.h1
                className="font-serif-display text-5xl font-semibold leading-none tracking-normal md:text-7xl"
                variants={fadeUp}
                transition={{ duration: 0.65, ease: 'easeOut' }}
              >
                Preserve a Life Story as a Digital Legacy
              </motion.h1>
              <motion.p
                className="mt-6 max-w-2xl text-base leading-relaxed text-slate-100 md:text-lg"
                variants={fadeUp}
                transition={{ duration: 0.65, ease: 'easeOut' }}
              >
                Turn memories, photos, milestones, and personal reflections into a beautiful biography website with AI-assisted writing and guided publishing.
              </motion.p>
              <motion.div
                className="mt-8 flex flex-col gap-3 sm:flex-row"
                variants={fadeUp}
                transition={{ duration: 0.65, ease: 'easeOut' }}
              >
                <motion.button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FED362] px-6 py-3 text-sm font-bold text-[#0A1128] shadow-lg shadow-black/20 transition hover:bg-amber-300"
                  whileHover={hoverLift}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                >
                  Begin Your Biography
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
                <motion.a
                  href="#templates"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                  whileHover={hoverLift}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                >
                  View Templates
                </motion.a>
              </motion.div>

              <motion.div
                className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3"
                variants={staggerGroup}
              >
                {['Template editor', 'AI writing help', 'Manual publishing access'].map((item) => (
                  <motion.div key={item} variants={fadeIn} className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <CheckCircle2 className="h-4 w-4 text-[#FED362]" />
                    {item}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="how-it-works" className="bg-white px-5 py-18 md:py-20">
          <motion.div
            className="mx-auto max-w-7xl"
            initial={revealInitial}
            whileInView={revealAnimate}
            viewport={defaultViewport}
            variants={fadeUp}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-[#B18625]">
                  How It Works
                </p>
                <h2 className="mt-3 font-serif-display text-3xl font-semibold tracking-normal md:text-4xl">
                  From Blank Page to Published Biography
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-slate-600">
                Xinghuoji keeps the process clear: choose a structure, write the story, save progress, and publish only after membership confirmation.
              </p>
            </div>

            <motion.div className="grid gap-4 md:grid-cols-4" variants={staggerGroup}>
              {workflowSteps.map((item) => {
                const Icon = item.icon;

                return (
                  <motion.article
                    key={item.step}
                    className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-5 shadow-sm transition-shadow hover:shadow-md"
                    variants={fadeUp}
                    whileHover={hoverLift}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-xs font-bold text-white">
                        {item.step}
                      </span>
                      <Icon className="h-5 w-5 text-[#B18625]" />
                    </div>
                    <h3 className="mt-5 text-sm font-bold">{item.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.description}</p>
                  </motion.article>
                );
              })}
            </motion.div>
          </motion.div>
        </section>

        <section id="templates" className="bg-[#F1F7FA] px-5 py-18 md:py-20">
          <motion.div
            className="mx-auto max-w-7xl"
            initial={revealInitial}
            whileInView={revealAnimate}
            viewport={defaultViewport}
            variants={fadeUp}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-[#B18625]">
                  Biography Templates
                </p>
                <h2 className="mt-3 font-serif-display text-3xl font-semibold tracking-normal md:text-4xl">
                  Start With a Real Story Structure
                </h2>
              </div>
              <motion.button
                type="button"
                onClick={() => navigate('/register')}
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase text-slate-700 transition hover:border-black hover:text-black"
                whileHover={hoverLift}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                Use a Template
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>

            <motion.div className="grid gap-4 md:grid-cols-3" variants={staggerGroup}>
              {templates.map((template) => (
                <motion.article
                  key={template.title}
                  className="group rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-lg"
                  variants={fadeUp}
                  whileHover={hoverLift}
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-md bg-slate-100">
                    <img
                      src={template.image}
                      alt={`${template.title} preview`}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="px-1 py-4">
                    <h3 className="font-serif-display text-xl font-bold">{template.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{template.subtitle}</p>
                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase text-[#8A650E] transition hover:text-black"
                    >
                      Preview Template
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </motion.div>
        </section>

        <section id="membership" className="bg-white px-5 py-18 md:py-20">
          <motion.div
            className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center"
            initial={revealInitial}
            whileInView={revealAnimate}
            viewport={defaultViewport}
            variants={staggerGroup}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.55, ease: 'easeOut' }}>
              <p className="text-[10px] font-bold uppercase text-[#B18625]">
                Membership and Publishing
              </p>
              <h2 className="mt-3 max-w-2xl font-serif-display text-3xl font-semibold leading-tight tracking-normal md:text-5xl">
                Draft freely. Publish after manual membership activation.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                The current flow uses manual WeChat payment confirmation. Users create a payment request, pay using the exact payment remark, and wait for admin verification before membership is activated.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {membershipPoints.map((point) => (
                  <motion.div
                    key={point}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 bg-[#F8FAFC] p-4 transition-shadow hover:shadow-md"
                    whileHover={hoverLift}
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#B18625]" />
                    <span className="text-sm font-semibold text-slate-700">{point}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="rounded-lg border border-slate-200 bg-[#0A1128] p-6 text-white shadow-xl"
              variants={fadeUp}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              whileHover={shouldReduceMotion ? undefined : { y: -5, boxShadow: '0 28px 70px rgba(15, 23, 42, 0.22)' }}
            >
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase text-[#FED362]">DIY Membership</p>
                  <p className="mt-2 font-serif-display text-4xl font-semibold">RMB 360</p>
                  <p className="text-sm text-slate-300">per year</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white text-[#0A1128]">
                  <QrCode className="h-7 w-7" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex gap-3">
                  <ReceiptText className="mt-1 h-5 w-5 shrink-0 text-[#FED362]" />
                  <div>
                    <h3 className="text-sm font-bold">Payment request first</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-300">
                      The backend creates a pending payment with a reference and payment remark.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <QrCode className="mt-1 h-5 w-5 shrink-0 text-[#FED362]" />
                  <div>
                    <h3 className="text-sm font-bold">User pays through WeChat</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-300">
                      The exact remark helps the admin match the payment to the user account.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#FED362]" />
                  <div>
                    <h3 className="text-sm font-bold">Admin confirms membership</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-300">
                      Once verified, membership becomes active for one year and publishing is allowed.
                    </p>
                  </div>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={() => navigate('/register')}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#FED362] px-5 py-3 text-sm font-bold text-[#0A1128] transition hover:bg-amber-300"
                whileHover={hoverLift}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                Start Membership Flow
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.div>
          </motion.div>
        </section>

        <section id="tools" className="bg-[#F7FBFD] px-5 py-18 md:py-20">
          <motion.div
            className="mx-auto max-w-7xl"
            initial={revealInitial}
            whileInView={revealAnimate}
            viewport={defaultViewport}
            variants={fadeUp}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[10px] font-bold uppercase text-[#B18625]">
                Platform Tools
              </p>
              <h2 className="mt-3 font-serif-display text-3xl font-semibold tracking-normal md:text-4xl">
                Everything Needed for the First Biography
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                The front-end experience focuses on writing, saving, previewing, payment status, and membership-gated publishing.
              </p>
            </div>

            <motion.div className="mt-10 grid gap-4 md:grid-cols-3" variants={staggerGroup}>
              {platformTools.map((item, index) => {
                const Icon = item.icon;
                const featured = index === 0;

                return (
                  <motion.article
                    key={item.title}
                    className={`rounded-lg border p-6 ${
                      featured
                        ? 'border-black bg-black text-white'
                        : 'border-slate-200 bg-white text-[#0A1128]'
                    }`}
                    variants={fadeUp}
                    whileHover={hoverLift}
                  >
                    <div className={`mb-10 flex h-11 w-11 items-center justify-center rounded-lg ${
                      featured ? 'bg-[#FED362] text-[#0A1128]' : 'bg-[#F1F7FA] text-[#B18625]'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-serif-display text-2xl font-bold">{item.title}</h3>
                    <p className={`mt-3 text-sm leading-relaxed ${featured ? 'text-slate-200' : 'text-slate-600'}`}>
                      {item.description}
                    </p>
                  </motion.article>
                );
              })}
            </motion.div>
          </motion.div>
        </section>

        <section className="bg-white px-5 py-18 md:py-20">
          <motion.div
            className="mx-auto max-w-7xl"
            initial={revealInitial}
            whileInView={revealAnimate}
            viewport={defaultViewport}
            variants={staggerGroup}
          >
            <div className="grid gap-4 md:grid-cols-3">
              {trustPoints.map((item) => {
                const Icon = item.icon;

                return (
                  <motion.article
                    key={item.title}
                    className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-6 transition-shadow hover:shadow-md"
                    variants={fadeUp}
                    whileHover={hoverLift}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[#B18625] shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 font-serif-display text-xl font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
                  </motion.article>
                );
              })}
            </div>
          </motion.div>
        </section>

        <section className="bg-black px-5 py-18 text-white md:py-20">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={revealInitial}
            whileInView={revealAnimate}
            viewport={defaultViewport}
            variants={fadeUp}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <LockKeyhole className="mx-auto h-8 w-8 text-[#FED362]" />
            <h2 className="mt-5 font-serif-display text-4xl font-semibold leading-tight tracking-normal md:text-5xl">
              Create the first draft of a life story today.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Begin with a template and save your biography draft. Publishing can happen later after membership is active.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <motion.button
                type="button"
                onClick={() => navigate('/register')}
                className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-[#FED362]"
                whileHover={hoverLift}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                Create Account
              </motion.button>
              <motion.button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-lg border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                whileHover={hoverLift}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                Sign In
              </motion.button>
            </div>
            <p className="mt-5 text-[10px] font-bold uppercase text-slate-500">
              No payment required to begin a draft
            </p>
          </motion.div>
        </section>
      </main>

      <footer className="bg-white px-5 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 border-t border-slate-100 pt-8 md:grid-cols-[1.2fr_2fr]">
          <div>
            <BrandLogo variant="mobile" className="w-40" />
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-slate-500">
              Preserving the human narrative through biography, memory, and digital legacy.
            </p>
          </div>
          <div className="grid gap-6 text-xs sm:grid-cols-3">
            <div>
              <p className="font-bold uppercase text-slate-900">Platform</p>
              <div className="mt-3 grid gap-2 text-slate-500">
                <a href="#how-it-works" className="hover:text-[#0A1128]">How It Works</a>
                <a href="#templates" className="hover:text-[#0A1128]">Templates</a>
                <a href="#membership" className="hover:text-[#0A1128]">Membership</a>
              </div>
            </div>
            <div>
              <p className="font-bold uppercase text-slate-900">Account</p>
              <div className="mt-3 grid gap-2 text-slate-500">
                <button type="button" onClick={() => navigate('/register')} className="w-fit hover:text-[#0A1128]">Register</button>
                <button type="button" onClick={() => navigate('/login')} className="w-fit hover:text-[#0A1128]">Login</button>
                <button type="button" onClick={() => navigate('/forgot-password')} className="w-fit hover:text-[#0A1128]">Forgot Password</button>
              </div>
            </div>
            <div>
              <p className="font-bold uppercase text-slate-900">Experience</p>
              <p className="mt-3 text-slate-500">
                Build, edit, save, and publish a biography website from one focused workspace.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
