import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Copy,
  HelpCircle,
  QrCode,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  UserCircle,
  XCircle,
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { getBiographyTemplateRoute } from '../Templates/LifeJourney/templateRoutes';
import { authService } from '../services/authService';
import type { CurrentMembership, PaymentResponse, RefundResponse } from '../services/authService';

const WECHAT_PAYMENT_QR_URL = import.meta.env.VITE_WECHAT_PAYMENT_QR_URL?.trim() || '';
const WECHAT_RECEIVING_ACCOUNT =
  import.meta.env.VITE_WECHAT_RECEIVING_ACCOUNT?.trim() || 'Xinghuoji WeChat receiving account';
const REFUND_WINDOW_DAYS = 7;

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

const formatMoney = (amount?: number, currency?: string) => {
  if (!amount || !currency) {
    return 'RMB 360';
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

const getPaymentStatusMeta = (status: string) => {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === 'ACTIVE' || normalizedStatus === 'CONFIRMED') {
    return {
      label: normalizedStatus === 'ACTIVE' ? 'Membership Active' : 'Payment Confirmed',
      description: 'Admin verification is complete.',
      icon: CheckCircle2,
      badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      panelClass: 'border-emerald-100 bg-emerald-50/70',
    };
  }

  if (normalizedStatus === 'REJECTED' || normalizedStatus === 'FAILED') {
    return {
      label: normalizedStatus === 'REJECTED' ? 'Payment Rejected' : 'Payment Failed',
      description: 'Create a new payment request after checking the payment details.',
      icon: XCircle,
      badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
      panelClass: 'border-rose-100 bg-rose-50/70',
    };
  }

  if (normalizedStatus === 'REFUNDED' || normalizedStatus === 'CANCELLED') {
    return {
      label: normalizedStatus === 'REFUNDED' ? 'Payment Refunded' : 'Membership Cancelled',
      description: 'This payment is no longer active for publishing access.',
      icon: AlertCircle,
      badgeClass: 'border-slate-200 bg-slate-100 text-slate-700',
      panelClass: 'border-slate-200 bg-slate-50',
    };
  }

  return {
    label: normalizedStatus === 'PENDING' ? 'Pending Admin Review' : 'No Payment Request',
    description: 'Admin will confirm the payment after matching the WeChat payment remark.',
    icon: Clock3,
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
    panelClass: 'border-amber-100 bg-amber-50/70',
  };
};

const getRefundStatusMeta = (status?: string) => {
  const normalizedStatus = String(status || '').toUpperCase();

  if (normalizedStatus === 'APPROVED' || normalizedStatus === 'PROCESSING') {
    return {
      label: normalizedStatus === 'APPROVED' ? 'Refund Approved' : 'Refund Processing',
      description: 'The refund request has passed review and is being processed.',
      icon: Clock3,
      className: 'border-blue-200 bg-blue-50 text-blue-700',
    };
  }

  if (normalizedStatus === 'COMPLETED') {
    return {
      label: 'Refund Completed',
      description: 'The refund was completed and membership cancellation was requested.',
      icon: CheckCircle2,
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };
  }

  if (normalizedStatus === 'REJECTED' || normalizedStatus === 'FAILED') {
    return {
      label: normalizedStatus === 'REJECTED' ? 'Refund Rejected' : 'Refund Failed',
      description: 'The refund request was not completed. Contact support for the next step.',
      icon: XCircle,
      className: 'border-rose-200 bg-rose-50 text-rose-700',
    };
  }

  return {
    label: normalizedStatus === 'REQUESTED' ? 'Refund Requested' : 'No Refund Request',
    description: 'Refund requests are reviewed by the admin team.',
    icon: RotateCcw,
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  };
};

const getRefundWindowDeadline = (payment?: PaymentResponse | null, membership?: CurrentMembership | null) => {
  const startValue = payment?.verifiedAt || payment?.paidAt || membership?.startAt;
  if (!startValue) {
    return null;
  }

  const startDate = new Date(startValue);
  if (Number.isNaN(startDate.getTime())) {
    return null;
  }

  const deadline = new Date(startDate);
  deadline.setDate(deadline.getDate() + REFUND_WINDOW_DAYS);
  return deadline;
};

const isPastRefundWindow = (deadline: Date | null) =>
  Boolean(deadline && deadline.getTime() < Date.now());

export default function PaymentStatusPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const templateId = searchParams.get('templateId') || 'life-journey';
  const websiteId = searchParams.get('websiteId') || '';
  const paymentId = searchParams.get('paymentId') || '';
  const refundId = searchParams.get('refundId') || '';
  const templateRoute = getBiographyTemplateRoute(templateId);
  const biographyTitle = searchParams.get('title') || 'My Life Story';
  const returnTo =
    searchParams.get('returnTo') ||
    `/diy-dashboard/templates/${templateRoute.id}/edit${websiteId ? `?websiteId=${encodeURIComponent(websiteId)}` : ''}`;

  const [accountEmail, setAccountEmail] = React.useState('');
  const [accountName, setAccountName] = React.useState('');
  const [accountProfilePhoto, setAccountProfilePhoto] = React.useState('');
  const [membership, setMembership] = React.useState<CurrentMembership | null>(null);
  const [payment, setPayment] = React.useState<PaymentResponse | null>(null);
  const [refund, setRefund] = React.useState<RefundResponse | null>(null);
  const [refundReason, setRefundReason] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isSubmittingRefund, setIsSubmittingRefund] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [refundFormError, setRefundFormError] = React.useState('');
  const [refundMessage, setRefundMessage] = React.useState('');
  const [copiedPaymentRemark, setCopiedPaymentRemark] = React.useState(false);

  const loadStatus = React.useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage('');
      setRefundFormError('');

      try {
        const session = await authService.getCurrentUser();

        if (session.user?.email) {
          setAccountEmail(session.user.email);
        }

        if (session.user?.fullName) {
          setAccountName(session.user.fullName);
        }

        try {
          const dashboard = await authService.getDashboard();

          if (dashboard.user?.fullName) {
            setAccountName(dashboard.user.fullName);
          }

          if (dashboard.user?.profilePhoto) {
            setAccountProfilePhoto(dashboard.user.profilePhoto);
          }
        } catch {
          // Payment status can still be checked with a valid auth token.
        }

        const [membershipResponse, paymentResponse, refundResponse] = await Promise.all([
          authService.getCurrentMembership(),
          paymentId
            ? authService.getPayment(paymentId).catch(() => authService.getCurrentPayment())
            : authService.getCurrentPayment(),
          refundId ? authService.getRefund(refundId).catch(() => null) : Promise.resolve(null),
        ]);

        setMembership(membershipResponse);
        setPayment(paymentResponse);
        setRefund(refundResponse);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load payment status.';

        if (/unauthorized|forbidden|session|token/i.test(message)) {
          navigate('/login', { replace: true });
          return;
        }

        setErrorMessage(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [navigate, paymentId, refundId]
  );

  React.useEffect(() => {
    document.title = 'Payment Status | Xinghuoji';
    void loadStatus();
  }, [loadStatus]);

  const handleCopyPaymentRemark = async () => {
    const remark = payment?.paymentRemark || payment?.paymentReference || payment?.paymentId || '';

    if (!remark) {
      return;
    }

    try {
      await navigator.clipboard.writeText(remark);
      setCopiedPaymentRemark(true);
      window.setTimeout(() => setCopiedPaymentRemark(false), 1800);
    } catch {
      setErrorMessage('Unable to copy the payment remark. Please copy it manually.');
    }
  };

  const handleSubmitRefund = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!payment?.paymentId) {
      setRefundFormError('No confirmed payment found for this refund request.');
      setRefundMessage('');
      return;
    }

    const reason = refundReason.trim();

    if (reason.length < 10) {
      setRefundFormError('Please enter at least 10 characters for the refund reason.');
      setRefundMessage('');
      return;
    }

    setIsSubmittingRefund(true);
    setErrorMessage('');
    setRefundFormError('');
    setRefundMessage('');

    try {
      const nextRefund = await authService.createRefund({
        paymentId: payment.paymentId,
        reason,
      });

      setRefund(nextRefund);
      setRefundReason('');
      setRefundMessage('Refund request submitted. Admin will review it based on the 7-day refund window.');

      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set('refundId', nextRefund.refundId);
      setSearchParams(nextSearchParams, { replace: true });
    } catch (error) {
      setRefundFormError(error instanceof Error ? error.message : 'Unable to submit refund request.');
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  const buildPaymentUrl = () => {
    const paymentUrl = new URL('/payment', window.location.origin);

    if (websiteId) {
      paymentUrl.searchParams.set('websiteId', websiteId);
    }

    paymentUrl.searchParams.set('templateId', templateRoute.id);
    paymentUrl.searchParams.set('title', biographyTitle);
    paymentUrl.searchParams.set('returnTo', returnTo);

    return `${paymentUrl.pathname}${paymentUrl.search}`;
  };

  const hasActiveMembership = membership?.status?.toUpperCase() === 'ACTIVE';
  const displayStatus = hasActiveMembership ? 'ACTIVE' : payment?.status || 'NO_PAYMENT';
  const statusMeta = getPaymentStatusMeta(displayStatus);
  const StatusIcon = statusMeta.icon;
  const paymentRemark = payment?.paymentRemark || payment?.paymentReference || payment?.paymentId || '';
  const paymentReference = payment?.paymentReference || payment?.paymentId || 'Not available yet';
  const displayAmount = formatMoney(payment?.amount, payment?.currency);
  const profileButtonLabel = accountName || accountEmail || 'Profile';
  const refundDeadline = getRefundWindowDeadline(payment, membership);
  const refundWindowClosed = isPastRefundWindow(refundDeadline);
  const refundWindowOpen = Boolean(refundDeadline && !refundWindowClosed);
  const paymentStatus = payment?.status?.toUpperCase() || '';
  const canRequestRefund = Boolean(
    hasActiveMembership &&
    payment?.paymentId &&
    paymentStatus === 'CONFIRMED' &&
    !refund &&
    refundWindowOpen
  );
  const refundMeta = getRefundStatusMeta(refund?.status);
  const RefundIcon = refundMeta.icon;
  const refundReasonLength = refundReason.trim().length;

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-[0_12px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="relative mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:min-h-[88px] lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/diy-dashboard')}
            className="group flex min-w-0 items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-slate-50"
            aria-label="Xinghuoji dashboard"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 shadow-sm transition group-hover:border-[#B18625]">
              <BrandLogo variant="mark" className="w-9" />
            </span>
            <span className="hidden min-w-0 sm:block">
              <BrandLogo variant="mobile" className="w-36" />
              <span className="mt-[-10px] block text-[10px] font-bold uppercase text-[#B18625]">
                Payment Status
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate(returnTo)}
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
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-bold uppercase text-[#B18625]">Manual Review</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
            Payment Status
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Track the pending WeChat payment request. Publishing becomes available after the admin
            confirms payment and the backend activates the membership.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm leading-relaxed text-rose-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {refundMessage && (
          <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm leading-relaxed text-emerald-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{refundMessage}</p>
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className={`rounded-2xl border px-5 py-5 ${statusMeta.panelClass}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${statusMeta.badgeClass}`}>
                    <StatusIcon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                      Current Status
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950">{statusMeta.label}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{statusMeta.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void loadStatus(true)}
                  disabled={isRefreshing || isLoading}
                  className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Membership</p>
                <p className="mt-2 text-lg font-bold text-slate-950">
                  {membership?.status || 'No active membership'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {membership?.planName || 'Membership activates after admin confirmation.'}
                </p>
                {membership?.expiresAt && (
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    Expires {formatDateTime(membership.expiresAt)}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Payment</p>
                <p className="mt-2 text-lg font-bold text-slate-950">
                  {payment?.status || 'No payment request'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {payment?.createdAt
                    ? `Created ${formatDateTime(payment.createdAt)}`
                    : 'Create a payment request before paying through WeChat.'}
                </p>
                {payment?.verifiedAt && (
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    Verified {formatDateTime(payment.verifiedAt)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-5">
              <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
                <div>
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {WECHAT_PAYMENT_QR_URL ? (
                      <img
                        src={WECHAT_PAYMENT_QR_URL}
                        alt="WeChat payment QR code"
                        className="h-full w-full object-contain p-3"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center px-5 text-center">
                        <QrCode className="h-12 w-12 text-slate-300" />
                        <p className="mt-3 text-sm font-bold text-slate-700">WeChat QR Pending</p>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-center text-xs font-semibold text-slate-500">
                    Receiving account: {WECHAT_RECEIVING_ACCOUNT}
                  </p>
                </div>

                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <ReceiptText className="mt-0.5 h-5 w-5 shrink-0 text-[#B18625]" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-950">Payment Reference</p>
                      <p className="mt-1 break-all font-mono text-sm text-slate-700">{paymentReference}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                          WeChat Payment Remark
                        </p>
                        <p className="mt-2 break-all font-mono text-base font-bold text-slate-950">
                          {paymentRemark || 'Not available yet'}
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

                  <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Amount</dt>
                      <dd className="mt-1 text-lg font-bold text-slate-950">{displayAmount}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Method</dt>
                      <dd className="mt-1 text-lg font-bold text-slate-950">
                        {payment?.paymentMethod || 'WECHAT'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                <p>
                  The 7-day refund window starts after payment confirmation. After 7 days, the DIY
                  membership remains active until expiry and is no longer refundable.
                </p>
              </div>
            </div>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${refundMeta.className}`}>
                    <RefundIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                      7-Day Refund Window
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-slate-950">{refundMeta.label}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{refundMeta.description}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold ${
                    refundWindowClosed
                      ? 'border-slate-200 bg-slate-100 text-slate-600'
                      : refundWindowOpen
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  {refundWindowClosed ? 'Window Closed' : refundWindowOpen ? 'Window Open' : 'Waiting Confirmation'}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Refund Deadline
                  </p>
                  <p className="mt-2 text-base font-bold text-slate-950">
                    {refundDeadline ? formatDateTime(refundDeadline.toISOString()) : 'Waiting for payment confirmation'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Backend still validates final refund eligibility.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Refund Amount
                  </p>
                  <p className="mt-2 text-base font-bold text-slate-950">
                    {refund ? formatMoney(refund.amount, refund.currency) : displayAmount}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Full refund only for eligible confirmed payments.
                  </p>
                </div>
              </div>

              {refundMessage && (
                <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                  {refundMessage}
                </div>
              )}

              {refundFormError && (
                <div className="mt-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {refundFormError}
                </div>
              )}

              {refund ? (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Refund ID</dt>
                      <dd className="mt-1 break-all font-mono text-sm font-semibold text-slate-950">
                        {refund.refundId}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Status</dt>
                      <dd className="mt-1 text-sm font-bold text-slate-950">{refund.status}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Requested</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-700">
                        {formatDateTime(refund.requestedAt || refund.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Processed</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-700">
                        {formatDateTime(refund.processedAt)}
                      </dd>
                    </div>
                  </dl>
                  {refund.reason && (
                    <p className="mt-4 rounded-lg bg-white px-3 py-3 text-sm leading-relaxed text-slate-600">
                      {refund.reason}
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmitRefund} className="mt-5">
                  <label htmlFor="refund-reason" className="text-sm font-bold text-slate-950">
                    Cancellation / Refund Reason
                  </label>
                  <textarea
                    id="refund-reason"
                    value={refundReason}
                    onChange={(event) => {
                      setRefundReason(event.target.value);
                      if (refundFormError) {
                        setRefundFormError('');
                      }
                    }}
                    disabled={!canRequestRefund || isSubmittingRefund}
                    rows={4}
                    placeholder="Tell us why you want to cancel and request a refund."
                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#B18625] focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  <div className="mt-2 flex flex-col gap-1 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                      {canRequestRefund
                        ? 'Enter at least 10 characters before submitting.'
                        : 'Refund requests require an active membership, a confirmed payment, and an open refund window.'}
                    </p>
                    {canRequestRefund && (
                      <span className={refundReasonLength >= 10 ? 'text-emerald-700' : 'text-slate-400'}>
                        {Math.min(refundReasonLength, 10)}/10
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={!canRequestRefund || isSubmittingRefund}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {isSubmittingRefund ? 'Submitting Refund...' : 'Request Full Refund'}
                  </button>
                </form>
              )}
            </section>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <h2 className="text-xl font-bold text-slate-950">Biography Request</h2>
            <div className="mt-5 flex gap-4 border-t border-slate-200 pt-5">
              <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-amber-100 shadow-sm">
                {getInitials(biographyTitle)}
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-bold text-slate-950">{biographyTitle}</p>
                <p className="mt-1 text-xs text-slate-500">{templateRoute.title} template</p>
                <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}>
                  {statusMeta.label}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-200 pt-6">
              <button
                type="button"
                onClick={() => navigate(returnTo)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
              >
                <BookOpen className="h-4 w-4" />
                {hasActiveMembership ? 'Return to Publish' : 'Back to Editor'}
              </button>
              {!payment || displayStatus === 'REJECTED' || displayStatus === 'FAILED' ? (
                <button
                  type="button"
                  onClick={() => navigate(buildPaymentUrl())}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Create New Payment
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => navigate('/diy-dashboard')}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Dashboard
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
