import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  HelpCircle,
  Mail,
  ReceiptText,
  ShieldCheck,
  UploadCloud,
  UserCircle,
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { getBiographyTemplateRoute } from '../Templates/LifeJourney/templateRoutes';
import { authService } from '../services/authService';

type ManualNoticeStatus = 'idle' | 'saved';

const activationSteps = [
  { label: 'Edit', description: 'Biography content complete', status: 'complete' },
  { label: 'Payment', description: 'Manual confirmation required', status: 'active' },
  { label: 'Activation', description: 'Admin activates membership', status: 'pending' },
] as const;

const includedFeatures = [
  'Biography website publishing access',
  'Shareable public website link',
  'Saved biography draft access',
  'Media gallery support',
  'AI writing assistant access',
];

const price = 2499;
const formattedPrice = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
}).format(price);

const getInitials = (name: string) => {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return initials || 'X';
};

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('templateId') || 'life-journey';
  const websiteId = searchParams.get('websiteId') || '';
  const templateRoute = getBiographyTemplateRoute(templateId);
  const biographyTitle = searchParams.get('title') || 'My Life Story';
  const returnTo =
    searchParams.get('returnTo') ||
    `/diy-dashboard/templates/${templateRoute.id}/edit${websiteId ? `?websiteId=${encodeURIComponent(websiteId)}` : ''}`;

  const [accountEmail, setAccountEmail] = React.useState('');
  const [accountName, setAccountName] = React.useState('');
  const [accountProfilePhoto, setAccountProfilePhoto] = React.useState('');
  const [paymentReference, setPaymentReference] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [proofFileName, setProofFileName] = React.useState('');
  const [noticeStatus, setNoticeStatus] = React.useState<ManualNoticeStatus>('idle');

  React.useEffect(() => {
    document.title = 'Manual Payment Confirmation | Xinghuoji';

    let active = true;
    authService
      .getCurrentUser()
      .then((session) => {
        if (!active) {
          return;
        }

        if (session.user?.email) {
          setAccountEmail(session.user.email);
        }

        if (session.user?.fullName) {
          setAccountName(session.user.fullName);
        }
      })
      .catch(() => {
        if (active) {
          setAccountEmail('');
        }
      });

    authService
      .getDashboard()
      .then((dashboard) => {
        if (!active) {
          return;
        }

        if (dashboard.user?.fullName) {
          setAccountName(dashboard.user.fullName);
        }

        if (dashboard.user?.profilePhoto) {
          setAccountProfilePhoto(dashboard.user.profilePhoto);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const handleReturnToEditor = () => {
    navigate(returnTo);
  };

  const handleSaveManualNotice = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNoticeStatus('saved');
  };

  const paymentReferenceCode = websiteId || 'Generated after the biography is saved';
  const profileButtonLabel = accountName || accountEmail || 'Profile';

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-[0_12px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="relative mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:min-h-[88px] lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="group flex min-w-0 items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-slate-50"
            aria-label="Xinghuoji homepage"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 shadow-sm transition group-hover:border-[#B18625]">
              <BrandLogo variant="mobile" className="w-10" />
            </span>
            <span className="hidden min-w-0 sm:block">
              <BrandLogo variant="mobile" className="w-36" />
              <span className="mt-[-10px] block text-[10px] font-bold uppercase text-[#B18625]">
                Manual Activation
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={handleReturnToEditor}
            className="absolute left-1/2 hidden h-11 -translate-x-1/2 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 md:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </button>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="hidden h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 sm:inline-flex"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </button>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#B18625] hover:text-slate-950 sm:hidden"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/account-settings')}
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-950 text-white shadow-sm transition hover:border-[#B18625] hover:bg-slate-800"
              aria-label="Open profile and account settings"
              title="Profile & Account Settings"
            >
              {accountProfilePhoto ? (
                <img
                  src={accountProfilePhoto}
                  alt={`${profileButtonLabel} profile`}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : accountName ? (
                <span className="text-sm font-bold">{getInitials(accountName)}</span>
              ) : (
                <UserCircle className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        <div className="border-t border-slate-100 px-4 py-2 md:hidden">
          <button
            type="button"
            onClick={handleReturnToEditor}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </button>
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-80px)] lg:grid-cols-[256px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white px-5 py-5 lg:border-b-0 lg:border-r lg:py-10">
          <div>
            <p className="text-lg font-bold text-slate-950">Publish Progress</p>
            <p className="mt-1 text-sm text-slate-500">Step 2 of 3</p>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {activationSteps.map((step) => (
              <div
                key={step.label}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 ${
                  step.status === 'active'
                    ? 'bg-amber-50 text-[#8A6500]'
                    : step.status === 'complete'
                      ? 'text-slate-700'
                      : 'text-slate-400'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    step.status === 'complete'
                      ? 'bg-emerald-100 text-emerald-700'
                      : step.status === 'active'
                        ? 'bg-[#8A6500] text-white'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step.status === 'complete' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{step.label}</span>
                  <span className="mt-0.5 hidden text-xs sm:block lg:block">{step.description}</span>
                </span>
              </div>
            ))}
          </div>
        </aside>

        <section className="px-5 py-8 lg:px-16 lg:py-12">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="font-mono text-xs font-bold uppercase text-[#B18625]">
                Manual Payment Confirmation
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                Awaiting Admin Activation
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Payment gateway integration is paused for now. After payment is confirmed manually,
                the administrator will activate the user's membership in the system.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4 text-sm leading-relaxed text-amber-900">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B18625]" />
                <p>
                  China payment flow uses manual member activation. Philippine and international
                  payment integrations are temporarily suspended until the final payment methods are confirmed.
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
              <aside className="order-first rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:order-last lg:sticky lg:top-28">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-slate-950">Request Summary</h2>
                  <ReceiptText className="h-5 w-5 text-[#B18625]" />
                </div>
                <div className="mt-5 border-t border-slate-200 pt-5">
                  <div className="flex gap-4">
                    <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-amber-100 shadow-sm">
                      {getInitials(biographyTitle)}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-bold text-slate-950">{biographyTitle}</p>
                      <p className="mt-1 text-xs text-slate-500">{templateRoute.title} template</p>
                      <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        Manual Activation
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-700">
                    <Clock3 className="h-4 w-4" />
                    {noticeStatus === 'saved' ? 'Notice recorded locally' : 'Pending payment confirmation'}
                  </p>
                </div>

                <ul className="mt-5 space-y-3 border-t border-slate-200 pt-5">
                  {includedFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-[#8A6500]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 border-t border-slate-200 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-500">Amount</span>
                    <span className="text-2xl font-bold text-slate-950">{formattedPrice}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    This amount is displayed for the manual confirmation flow. Final payment
                    instructions should come from the administrator.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReturnToEditor}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <BookOpen className="h-4 w-4" />
                  Return to Editor
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/diy-dashboard')}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Dashboard
                </button>
              </aside>

              <form
                id="manual-payment-form"
                onSubmit={handleSaveManualNotice}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-950">Manual Payment Instructions</h2>
                      <ShieldCheck className="h-4 w-4 text-[#B18625]" />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      Follow the administrator's payment instructions. This page records the payment
                      notice only; membership activation is still handled manually by the admin.
                    </p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                    <Clock3 className="h-4 w-4" />
                    Admin Review
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      title: 'Send Payment',
                      description: 'Use the payment channel confirmed by the administrator.',
                    },
                    {
                      title: 'Share Reference',
                      description: 'Provide the website ID or receipt reference for checking.',
                    },
                    {
                      title: 'Wait for Activation',
                      description: 'Admin activates membership after confirming payment.',
                    },
                  ].map((item, index) => (
                    <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <p className="mt-3 text-sm font-bold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#B18625]" />
                    <div>
                      <p className="text-sm font-bold text-slate-950">Payment Reference Code</p>
                      <p className="mt-1 break-all font-mono text-sm text-slate-700">{paymentReferenceCode}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="account-email" className="text-sm font-semibold text-slate-700">
                      Account Email
                    </label>
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-[#B18625] focus-within:ring-4 focus-within:ring-amber-100">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <input
                        id="account-email"
                        type="email"
                        value={accountEmail}
                        onChange={(event) => setAccountEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="payment-reference" className="text-sm font-semibold text-slate-700">
                      Receipt / Transfer Reference
                    </label>
                    <input
                      id="payment-reference"
                      value={paymentReference}
                      onChange={(event) => setPaymentReference(event.target.value)}
                      placeholder="Optional"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#B18625] focus:ring-4 focus:ring-amber-100"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center transition hover:border-[#B18625] hover:bg-amber-50/40">
                    <UploadCloud className="h-6 w-6 text-[#B18625]" />
                    <span className="mt-3 text-sm font-bold text-slate-950">
                      {proofFileName || 'Attach payment proof'}
                    </span>
                    <span className="mt-1 text-xs text-slate-500">Optional receipt image or PDF</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/png,image/jpeg,application/pdf"
                      onChange={(event) => setProofFileName(event.target.files?.[0]?.name || '')}
                    />
                  </label>
                </div>

                <div className="mt-5">
                  <label htmlFor="payment-notes" className="text-sm font-semibold text-slate-700">
                    Notes for Admin
                  </label>
                  <textarea
                    id="payment-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    placeholder="Optional notes, payment channel, or confirmation details"
                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-[#B18625] focus:ring-4 focus:ring-amber-100"
                  />
                </div>

                {noticeStatus === 'saved' && (
                  <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm leading-relaxed text-emerald-800">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                      <p>
                        Payment notice recorded locally for testing. Final membership activation
                        still requires admin confirmation in the system.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                    <p>
                      This page does not process live payments. Once the membership status endpoint
                      is available, the frontend can show whether the user is pending or activated.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
                  >
                    <ReceiptText className="h-4 w-4" />
                    Record Payment Notice
                  </button>
                  <button
                    type="button"
                    onClick={handleReturnToEditor}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Return to Editor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-5 py-5 text-center text-xs text-slate-500">
        (c) 2026 Xinghuoji AI Biography Platform. Manual activation flow.
      </footer>
    </div>
  );
}
