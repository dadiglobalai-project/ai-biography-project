import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock3,
  Copy,
  FileText,
  HelpCircle,
  Mail,
  QrCode,
  ReceiptText,
  ShieldCheck,
  UserCircle,
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { getBiographyTemplateRoute } from '../Templates/LifeJourney/templateRoutes';
import { authService } from '../services/authService';
import type { CurrentMembership, MembershipPlan, PaymentResponse } from '../services/authService';

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

const DEFAULT_PAYMENT_METHOD = 'WECHAT';
const WECHAT_PAYMENT_QR_URL = import.meta.env.VITE_WECHAT_PAYMENT_QR_URL?.trim() || '';
const WECHAT_RECEIVING_ACCOUNT =
  import.meta.env.VITE_WECHAT_RECEIVING_ACCOUNT?.trim() || 'Xinghuoji WeChat receiving account';

const fallbackPrice = 'RMB 360';

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

const formatMoney = (amount: number, currency: string) => {
  if (!amount || !currency) {
    return fallbackPrice;
  }

  if (currency.toUpperCase() === 'CNY') {
    return `RMB ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return 'Not available yet';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not available yet';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('templateId') || 'life-journey';
  const websiteId = searchParams.get('websiteId') || '';
  const planIdFromQuery = searchParams.get('planId') || '';
  const templateRoute = getBiographyTemplateRoute(templateId);
  const biographyTitle = searchParams.get('title') || 'My Life Story';
  const returnTo =
    searchParams.get('returnTo') ||
    `/diy-dashboard/templates/${templateRoute.id}/edit${websiteId ? `?websiteId=${encodeURIComponent(websiteId)}` : ''}`;

  const [accountEmail, setAccountEmail] = React.useState('');
  const [accountName, setAccountName] = React.useState('');
  const [accountProfilePhoto, setAccountProfilePhoto] = React.useState('');
  const [membership, setMembership] = React.useState<CurrentMembership | null>(null);
  const [plans, setPlans] = React.useState<MembershipPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = React.useState('');
  const [currentPayment, setCurrentPayment] = React.useState<PaymentResponse | null>(null);
  const [isLoadingBilling, setIsLoadingBilling] = React.useState(true);
  const [isCreatingPayment, setIsCreatingPayment] = React.useState(false);
  const [copiedPaymentRemark, setCopiedPaymentRemark] = React.useState(false);
  const [paymentMessage, setPaymentMessage] = React.useState('');
  const [paymentError, setPaymentError] = React.useState('');

  React.useEffect(() => {
    document.title = 'Manual Payment Confirmation | Xinghuoji';

    let active = true;
    const loadPaymentData = async () => {
      setIsLoadingBilling(true);
      setPaymentError('');

      try {
        const session = await authService.getCurrentUser();
        if (!active) {
          return;
        }

        if (session.user?.email) {
          setAccountEmail(session.user.email);
        }

        if (session.user?.fullName) {
          setAccountName(session.user.fullName);
        }

        try {
          const dashboard = await authService.getDashboard();
          if (!active) {
            return;
          }

          if (dashboard.user?.fullName) {
            setAccountName(dashboard.user.fullName);
          }

          if (dashboard.user?.profilePhoto) {
            setAccountProfilePhoto(dashboard.user.profilePhoto);
          }
        } catch {
          // The payment endpoints can still load as long as the JWT session is valid.
        }

        const [membershipResponse, plansResponse, paymentResponse] = await Promise.all([
          authService.getCurrentMembership(),
          authService.getMembershipPlans(),
          authService.getCurrentPayment(),
        ]);

        if (!active) {
          return;
        }

        setMembership(membershipResponse);
        setPlans(plansResponse);
        setCurrentPayment(paymentResponse);
        setSelectedPlanId((currentPlanId) => {
          if (currentPlanId) {
            return currentPlanId;
          }

          const queryPlan = planIdFromQuery
            ? plansResponse.find((plan) => plan.planId === planIdFromQuery)
            : undefined;
          const activeDiyPlan = plansResponse.find(
            (plan) => plan.active && /diy/i.test(plan.name)
          );
          const firstActivePlan = plansResponse.find((plan) => plan.active);

          return queryPlan?.planId || activeDiyPlan?.planId || firstActivePlan?.planId || plansResponse[0]?.planId || '';
        });
      } catch (error) {
        if (!active) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Unable to load membership payment data.';
        if (/unauthorized|forbidden|session|token/i.test(message)) {
          navigate('/login', { replace: true });
          return;
        }

        setPaymentError(message);
      } finally {
        if (active) {
          setIsLoadingBilling(false);
        }
      }
    };

    void loadPaymentData();

    return () => {
      active = false;
    };
  }, [navigate, planIdFromQuery]);

  const handleReturnToEditor = () => {
    navigate(returnTo);
  };

  const handleCopyPaymentRemark = async () => {
    const remark =
      currentPayment?.paymentRemark || currentPayment?.paymentReference || currentPayment?.paymentId || '';

    if (!remark) {
      return;
    }

    try {
      await navigator.clipboard.writeText(remark);
      setCopiedPaymentRemark(true);
      window.setTimeout(() => setCopiedPaymentRemark(false), 1800);
    } catch {
      setPaymentError('Unable to copy the payment remark. Please copy it manually.');
    }
  };

  const getPaymentStatusUrl = (payment?: PaymentResponse | null) => {
    const statusUrl = new URL('/payment/status', window.location.origin);

    if (websiteId) {
      statusUrl.searchParams.set('websiteId', websiteId);
    }

    if (payment?.paymentId) {
      statusUrl.searchParams.set('paymentId', payment.paymentId);
    }

    statusUrl.searchParams.set('templateId', templateRoute.id);
    statusUrl.searchParams.set('title', biographyTitle);
    statusUrl.searchParams.set('returnTo', returnTo);

    return `${statusUrl.pathname}${statusUrl.search}`;
  };

  const handleCreatePaymentRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (membership?.status === 'ACTIVE') {
      setPaymentMessage('Your membership is already active. You can return to the editor and continue publishing.');
      setPaymentError('');
      return;
    }

    const selectedPlan = plans.find((plan) => plan.planId === selectedPlanId);
    if (!selectedPlan) {
      setPaymentError('Please select a membership plan before creating a payment request.');
      setPaymentMessage('');
      return;
    }

    setIsCreatingPayment(true);
    setPaymentError('');
    setPaymentMessage('');

    try {
      const payment = await authService.createPayment({
        planId: selectedPlan.planId,
        paymentMethod: DEFAULT_PAYMENT_METHOD,
      });
      setCurrentPayment(payment);
      setPaymentMessage('Payment request created. Pay through WeChat using the exact payment remark below, then wait for admin confirmation.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create payment request.';

      if (/duplicate|pending|conflict|409/i.test(message)) {
        try {
          const payment = await authService.getCurrentPayment();
          setCurrentPayment(payment);
          setPaymentMessage('You already have a pending payment request. Continue with the payment details shown here.');
          setPaymentError('');
        } catch {
          setPaymentError(message);
        }
      } else {
        setPaymentError(message);
      }
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const selectedPlan = plans.find((plan) => plan.planId === selectedPlanId);
  const hasActiveMembership = membership?.status === 'ACTIVE';
  const normalizedPaymentStatus = currentPayment?.status?.toUpperCase() || '';
  const isPendingPayment = normalizedPaymentStatus === 'PENDING';
  const displayAmount = currentPayment
    ? formatMoney(currentPayment.amount, currentPayment.currency)
    : selectedPlan
      ? formatMoney(selectedPlan.standardPrice, selectedPlan.currency)
      : fallbackPrice;
  const paymentReferenceCode =
    currentPayment?.paymentReference || currentPayment?.paymentId || websiteId || 'Generated after payment request';
  const paymentRemark = currentPayment?.paymentRemark || currentPayment?.paymentReference || currentPayment?.paymentId || '';
  const canShowWechatInstructions = Boolean(currentPayment?.paymentId && normalizedPaymentStatus !== 'REJECTED' && normalizedPaymentStatus !== 'FAILED');
  const canViewStatus = Boolean(currentPayment?.paymentId || hasActiveMembership);
  const membershipStatus = membership?.status || 'No active membership';
  const paymentStatus = currentPayment?.status || 'No payment request yet';
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
              <BrandLogo variant="mark" className="w-9" />
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
                DIY Membership Payment
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                Complete WeChat Payment
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Create a payment request, pay RMB 360 through WeChat, then wait for admin
                verification. Once confirmed, your DIY membership becomes active for 1 year.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4 text-sm leading-relaxed text-amber-900">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B18625]" />
                <p>
                  Enter the exact payment remark shown below when paying through WeChat. The
                  admin will match that remark to your pending payment request before activating
                  your membership.
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
                    {membership?.status === 'ACTIVE' ? 'Membership active' : paymentStatus}
                  </p>
                  {membership?.expiresAt && (
                    <p className="mt-2 text-xs text-slate-500">
                      Expires {formatDateTime(membership.expiresAt)}
                    </p>
                  )}
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
                    <span className="text-2xl font-bold text-slate-950">{displayAmount}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Amount and currency come from the selected backend membership plan or the current payment record.
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
                onSubmit={handleCreatePaymentRequest}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-950">Manual Payment Instructions</h2>
                      <ShieldCheck className="h-4 w-4 text-[#B18625]" />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      Create a backend payment request first, then use the generated reference
                      and payment remark for the manual WeChat payment.
                    </p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                    <Clock3 className="h-4 w-4" />
                    Admin Review
                  </span>
                </div>

                {paymentError && (
                  <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm leading-relaxed text-rose-700">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                      <p>{paymentError}</p>
                    </div>
                  </div>
                )}

                {paymentMessage && (
                  <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm leading-relaxed text-emerald-800">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                      <p>{paymentMessage}</p>
                    </div>
                  </div>
                )}

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Current Membership
                    </p>
                    <p className="mt-2 text-base font-bold text-slate-950">{membershipStatus}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {membership?.planName || 'No current valid membership returned by backend.'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Current Payment
                    </p>
                    <p className="mt-2 text-base font-bold text-slate-950">{paymentStatus}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {currentPayment?.createdAt
                        ? `Created ${formatDateTime(currentPayment.createdAt)}`
                        : 'No current payment returned by backend.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                      Membership Plan
                    </h3>
                    {isLoadingBilling && (
                      <span className="text-xs font-semibold text-slate-500">Loading plans...</span>
                    )}
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {plans.length > 0 ? (
                      plans.map((plan) => {
                        const isSelected = selectedPlanId === plan.planId;

                        return (
                          <button
                            key={plan.planId}
                            type="button"
                            onClick={() => setSelectedPlanId(plan.planId)}
                            disabled={!plan.active || isCreatingPayment}
                            className={`rounded-2xl border px-4 py-4 text-left transition ${
                              isSelected
                                ? 'border-[#B18625] bg-amber-50 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            <span className="flex items-start justify-between gap-3">
                              <span>
                                <span className="block text-sm font-bold text-slate-950">{plan.name}</span>
                                <span className="mt-1 block text-xs text-slate-500">
                                  {plan.durationMonths} months, {plan.refundWindowDays} day refund window
                                </span>
                              </span>
                              {isSelected && <CheckCircle2 className="h-5 w-5 shrink-0 text-[#B18625]" />}
                            </span>
                            <span className="mt-3 block text-lg font-bold text-slate-950">
                              {formatMoney(plan.standardPrice, plan.currency)}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500 sm:col-span-2">
                        No active membership plans returned yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      title: 'Create Request',
                      description: 'Backend creates a pending payment with a reference.',
                    },
                    {
                      title: 'Pay via WeChat',
                      description: 'Scan the QR code and enter the exact payment remark.',
                    },
                    {
                      title: 'Admin Confirms',
                      description: 'Admin matches the remark and activates your membership.',
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

                <div className="mt-8 grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {WECHAT_PAYMENT_QR_URL ? (
                        <img
                          src={WECHAT_PAYMENT_QR_URL}
                          alt="WeChat payment QR code"
                          className="h-full w-full object-contain p-3"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
                          <QrCode className="h-14 w-14 text-slate-300" />
                          <p className="mt-4 text-sm font-bold text-slate-700">WeChat QR Pending</p>
                          <p className="mt-2 text-xs leading-relaxed text-slate-500">
                            Add the official QR image URL as VITE_WECHAT_PAYMENT_QR_URL.
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-center text-xs font-semibold text-slate-500">
                      Receiving account: {WECHAT_RECEIVING_ACCOUNT}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#B18625]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-950">Backend Payment Reference</p>
                        <p className="mt-1 break-all font-mono text-sm text-slate-700">{paymentReferenceCode}</p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                            WeChat Payment Remark
                          </p>
                          <p className="mt-2 break-all font-mono text-base font-bold text-slate-950">
                            {paymentRemark || 'Create a payment request to generate this remark'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyPaymentRemark}
                          disabled={!paymentRemark}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-800 transition hover:border-[#B18625] hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Copy className="h-4 w-4" />
                          {copiedPaymentRemark ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {!canShowWechatInstructions && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold leading-relaxed text-slate-500">
                        Create a payment request first so the admin has a backend record to match
                        against the WeChat payment remark.
                      </div>
                    )}

                    <ol className="mt-5 space-y-2 text-sm leading-relaxed text-slate-600">
                      <li>1. Create a payment request if no pending request exists.</li>
                      <li>2. Scan the WeChat QR code and pay {displayAmount}.</li>
                      <li>3. Put the exact payment remark in the WeChat payment remarks field.</li>
                      <li>4. Wait for admin verification and membership activation.</li>
                    </ol>
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
                        readOnly
                        placeholder="you@example.com"
                        className="min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Payment Method</p>
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-950">
                      {DEFAULT_PAYMENT_METHOD}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                    <p>
                      The 7-day period is a refund window after payment confirmation, not a free
                      trial. Refunds are full refunds only within the backend-validated refund window.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={
                      isLoadingBilling ||
                      isCreatingPayment ||
                      !selectedPlan ||
                      hasActiveMembership ||
                      isPendingPayment
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ReceiptText className="h-4 w-4" />
                    {isCreatingPayment
                      ? 'Creating Request...'
                      : isPendingPayment
                        ? 'Payment Request Created'
                        : 'Create Payment Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(getPaymentStatusUrl(currentPayment))}
                    disabled={!canViewStatus}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {hasActiveMembership ? 'View Membership Status' : 'View Payment Status'}
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
