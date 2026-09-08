import React from 'react';
import { AdminHeader, AdminNavigation } from '../components/AdminNavigation';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Landmark,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { authService } from '../services/authService';
import type {
  AdminMembershipResponse,
  AdminPaymentResponse,
  AdminPaymentStatus,
} from '../services/authService';

type ActivationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'FAILED' | 'REFUNDED';

type MembershipRequest = {
  id: string;
  userId?: string;
  userName: string;
  email: string;
  biographyTitle: string;
  plan: string;
  amount: string;
  reference: string;
  submittedAt: string;
  paymentMethod: string;
  status: ActivationStatus;
  notes: string;
  proofOfPaymentUrl?: string;
  paidAt?: string;
  verifiedAt?: string;
  membership?: AdminMembershipResponse | null;
};

const statusOptions: Array<ActivationStatus | 'All'> = [
  'All',
  'PENDING',
  'CONFIRMED',
  'REJECTED',
  'FAILED',
  'REFUNDED',
];

const statusLabels: Record<ActivationStatus, string> = {
  PENDING: 'Pending Review',
  CONFIRMED: 'Confirmed',
  REJECTED: 'Rejected',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

const statusStyles: Record<ActivationStatus, string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
  CONFIRMED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-700',
  FAILED: 'border-red-200 bg-red-50 text-red-700',
  REFUNDED: 'border-slate-200 bg-slate-50 text-slate-600',
};

const formatMoney = (amount: number, currency: string) => {
  if (!amount || !currency) {
    return 'Not available yet';
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

const getStatusFromPayment = (status?: string): ActivationStatus => {
  const normalizedStatus = String(status || '').toUpperCase();
  return statusOptions.includes(normalizedStatus as ActivationStatus)
    ? normalizedStatus as ActivationStatus
    : 'PENDING';
};

const getPaymentUserName = (payment: AdminPaymentResponse) =>
  payment.userName || payment.userEmail || 'Unknown user';

const mapPaymentToRequest = (
  payment: AdminPaymentResponse,
  membership?: AdminMembershipResponse | null
): MembershipRequest => ({
  id: payment.paymentId,
  userId: payment.userId,
  userName: getPaymentUserName(payment),
  email: payment.userEmail || 'No email returned',
  biographyTitle: payment.biographyTitle || 'No biography title returned',
  plan: payment.planName || payment.planId || 'Membership plan',
  amount: formatMoney(payment.amount, payment.currency),
  reference: payment.paymentReference || payment.paymentId,
  submittedAt: formatDateTime(payment.createdAt),
  paymentMethod: payment.paymentMethod || 'Not available yet',
  status: getStatusFromPayment(payment.status),
  notes: payment.paymentRemark || '',
  proofOfPaymentUrl: payment.proofOfPaymentUrl,
  paidAt: payment.paidAt,
  verifiedAt: payment.verifiedAt,
  membership,
});

const getCounts = (requests: MembershipRequest[]) => ({
  pending: requests.filter((request) => request.status === 'PENDING').length,
  confirmed: requests.filter((request) => request.status === 'CONFIRMED').length,
  needsAttention: requests.filter((request) =>
    request.status === 'FAILED' || request.status === 'REJECTED'
  ).length,
  total: requests.length,
});

const upsertRequest = (requests: MembershipRequest[], nextRequest: MembershipRequest) =>
  requests.some((request) => request.id === nextRequest.id)
    ? requests.map((request) => (request.id === nextRequest.id ? nextRequest : request))
    : [nextRequest, ...requests];

export default function AdminMembershipActivationPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = React.useState<MembershipRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<ActivationStatus | 'All'>('PENDING');
  const [planFilter, setPlanFilter] = React.useState('All');
  const [adminNotes, setAdminNotes] = React.useState('');
  const [isActivationModalOpen, setIsActivationModalOpen] = React.useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = React.useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = React.useState(false);
  const [isUpdatingRequest, setIsUpdatingRequest] = React.useState(false);
  const [pageMessage, setPageMessage] = React.useState('');
  const [pageError, setPageError] = React.useState('');

  React.useEffect(() => {
    document.title = 'Membership Activation | Xinghuoji';
  }, []);

  const selectedRequest = React.useMemo(
    () => requests.find((request) => request.id === selectedRequestId) || requests[0],
    [requests, selectedRequestId]
  );

  const planOptions = React.useMemo(() => {
    const plans = Array.from(new Set(requests.map((request) => request.plan).filter(Boolean)));
    return ['All', ...plans];
  }, [requests]);

  const loadPaymentMembership = React.useCallback(async (payment: AdminPaymentResponse) => {
    if (!payment.userId) {
      return null;
    }

    try {
      return await authService.getAdminUserMembership(payment.userId);
    } catch {
      return null;
    }
  }, []);

  const loadPayments = React.useCallback(async () => {
    setIsLoadingRequests(true);
    setPageError('');
    setPageMessage('');

    try {
      const payments = await authService.getAdminPayments(
        statusFilter === 'All' ? undefined : statusFilter as AdminPaymentStatus
      );
      const nextRequests = payments.map((payment) => mapPaymentToRequest(payment));

      setRequests(nextRequests);
      setSelectedRequestId((currentId) =>
        nextRequests.some((request) => request.id === currentId)
          ? currentId
          : nextRequests[0]?.id || ''
      );

      if (!nextRequests.length) {
        setAdminNotes('');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load admin payments.';
      if (/unauthorized|forbidden|session|token/i.test(message)) {
        navigate('/login', { replace: true });
        return;
      }

      setPageError(message);
      setRequests([]);
      setSelectedRequestId('');
    } finally {
      setIsLoadingRequests(false);
    }
  }, [navigate, statusFilter]);

  React.useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  React.useEffect(() => {
    setAdminNotes(selectedRequest?.notes || '');
  }, [selectedRequest?.id, selectedRequest?.notes]);

  const hydratePaymentDetails = React.useCallback(
    async (request: MembershipRequest) => {
      setIsLoadingDetails(true);
      setPageError('');

      try {
        const payment = await authService.getAdminPayment(request.id);
        const membership = await loadPaymentMembership(payment);
        const nextRequest = mapPaymentToRequest(payment, membership);

        setRequests((currentRequests) => upsertRequest(currentRequests, nextRequest));
        setSelectedRequestId(nextRequest.id);
      } catch (error) {
        setPageError(error instanceof Error ? error.message : 'Unable to load payment details.');
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [loadPaymentMembership]
  );

  const filteredRequests = React.useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch =
        !normalizedSearch ||
        [request.userName, request.email, request.biographyTitle, request.reference, request.id]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
      const matchesPlan = planFilter === 'All' || request.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [planFilter, requests, searchQuery, statusFilter]);

  const counts = React.useMemo(() => getCounts(requests), [requests]);

  const handleSelectRequest = (request: MembershipRequest) => {
    setSelectedRequestId(request.id);
    setPageMessage('');
    void hydratePaymentDetails(request);
  };

  const handleConfirmActivation = async () => {
    if (!selectedRequest) {
      return;
    }

    setIsUpdatingRequest(true);
    setPageError('');
    setPageMessage('');

    try {
      const payment = await authService.confirmAdminPayment(selectedRequest.id);
      const membership = await loadPaymentMembership(payment);
      const nextRequest = mapPaymentToRequest(payment, membership);

      setRequests((currentRequests) => upsertRequest(currentRequests, nextRequest));
      setSelectedRequestId(nextRequest.id);
      setIsActivationModalOpen(false);
      setPageMessage(`${nextRequest.userName} payment has been confirmed and membership activation was requested.`);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to confirm payment.');
    } finally {
      setIsUpdatingRequest(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) {
      return;
    }

    setIsUpdatingRequest(true);
    setPageError('');
    setPageMessage('');

    try {
      const payment = await authService.rejectAdminPayment(selectedRequest.id);
      const membership = await loadPaymentMembership(payment);
      const nextRequest = mapPaymentToRequest(payment, membership);

      setRequests((currentRequests) => upsertRequest(currentRequests, nextRequest));
      setSelectedRequestId(nextRequest.id);
      setPageMessage('Payment request has been rejected.');
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to reject payment.');
    } finally {
      setIsUpdatingRequest(false);
    }
  };

  const handleSaveNotes = () => {
    setPageMessage('Admin notes need a backend update endpoint before they can be saved.');
    setPageError('');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Logout still clears the local session in authService.
    }

    navigate('/login');
  };

  const summaryCards = [
    {
      label: 'Pending Review',
      value: counts.pending,
      icon: Clock3,
      className: 'text-slate-950',
      iconClassName: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Confirmed',
      value: counts.confirmed,
      icon: BadgeCheck,
      className: 'text-slate-950',
      iconClassName: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Needs Attention',
      value: counts.needsAttention,
      icon: AlertTriangle,
      className: 'border-rose-200 text-red-700',
      iconClassName: 'bg-rose-100 text-rose-700',
    },
    {
      label: 'Loaded Payments',
      value: counts.total.toLocaleString(),
      icon: Users,
      className: 'text-slate-950',
      iconClassName: 'bg-slate-100 text-slate-700',
    },
  ];

  return (
    <div className="admin-page">
      <AdminHeader />
      <div className="admin-layout">
        <AdminNavigation onLogout={handleLogout} />

        <main className="admin-main">
          <div className="admin-main-content">
            <div>
              <p className="admin-eyebrow">COMMUNITY OPERATIONS</p>
              <h1 className="admin-title">
                Membership Activation
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
                Review payments, verify the details, and welcome new members.
              </p>
            </div>

            {pageMessage && (
              <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {pageMessage}
              </div>
            )}

            {pageError && (
              <div className="mt-6 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {pageError}
              </div>
            )}

            <div className="admin-summary">
              {summaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className={`admin-stat ${card.className}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-semibold leading-snug text-slate-500">{card.label}</p>
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconClassName}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <p className="mt-5 text-3xl font-semibold leading-none tracking-tight tabular-nums">{card.value}</p>
                  </div>
                );
              })}
            </div>

            <section className="admin-queue">
              <div className="admin-queue-heading"><div><h2>Request queue</h2><p>Select a request to review its details.</p></div><span>Live records</span></div>
              <div className="admin-filters">
                <label className="flex min-h-12 flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-500">
                  <Search className="h-5 w-5 shrink-0" />
                  <input
                    aria-label="Search requests" value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by user, email, title, or reference"
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none"
                  />
                </label>
                <select
                  aria-label="Filter by status" value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as ActivationStatus | 'All')}
                  className="min-h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#B18625] focus:ring-4 focus:ring-amber-100"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      Status: {status === 'All' ? 'All' : statusLabels[status]}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter by plan" value={planFilter}
                  onChange={(event) => setPlanFilter(event.target.value)}
                  className="min-h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#B18625] focus:ring-4 focus:ring-amber-100"
                >
                  {planOptions.map((plan) => (
                    <option key={plan} value={plan}>
                      Plan: {plan}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void loadPayments()}
                  disabled={isLoadingRequests}
                  className="flex min-h-12 items-center justify-center rounded-lg border border-slate-200 px-4 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Refresh admin payments"
                >
                  {isLoadingRequests ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-700">
                    <tr>
                      <th className="px-5 py-4 font-bold">User</th>
                      <th className="px-5 py-4 font-bold">Biography Title</th>
                      <th className="px-5 py-4 font-bold">Plan</th>
                      <th className="px-5 py-4 font-bold">Amount</th>
                      <th className="px-5 py-4 font-bold">Submitted</th>
                      <th className="px-5 py-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRequests.map((request) => {
                      const isSelected = selectedRequest?.id === request.id;

                      return (
                        <tr
                          key={request.id}
                          onClick={() => handleSelectRequest(request)}
                          tabIndex={0}
                          aria-selected={isSelected}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleSelectRequest(request);
                            }
                          }}
                          className={`cursor-pointer transition ${
                            isSelected ? 'bg-amber-50/60' : 'bg-white hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-5 py-5">
                            <p className="font-bold text-[#07142e]">{request.userName}</p>
                            <p className="mt-1 text-sm text-slate-500">{request.email}</p>
                          </td>
                          <td className="px-5 py-5 font-semibold text-slate-800">{request.biographyTitle}</td>
                          <td className="px-5 py-5 text-slate-700">{request.plan}</td>
                          <td className="px-5 py-5 font-bold text-slate-900">{request.amount}</td>
                          <td className="px-5 py-5 text-slate-700">{request.submittedAt}</td>
                          <td className="px-5 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[request.status]}`}
                            >
                              {statusLabels[request.status]}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid divide-y divide-slate-200 lg:hidden">
                {filteredRequests.map((request) => (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => handleSelectRequest(request)}
                    className={`p-5 text-left transition ${
                      selectedRequest?.id === request.id ? 'bg-amber-50/60' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">{request.userName}</p>
                        <p className="mt-1 text-sm text-slate-500">{request.email}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[request.status]}`}>
                        {statusLabels[request.status]}
                      </span>
                    </div>
                    <p className="mt-3 font-semibold text-slate-800">{request.biographyTitle}</p>
                    <p className="mt-2 text-sm text-slate-500">{request.amount} - {request.submittedAt}</p>
                  </button>
                ))}
              </div>

              {isLoadingRequests && (
                <div role="status" className="flex items-center justify-center gap-2 border-t border-slate-200 px-5 py-10 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />Loading requests...
                </div>
              )}

              {!isLoadingRequests && filteredRequests.length === 0 && (
                <div className="border-t border-slate-200 px-5 py-12 text-center text-sm text-slate-500">
                  No admin payments found for the selected filters.
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {filteredRequests.length ? 1 : 0} to {filteredRequests.length} of {filteredRequests.length} entries
                </span>
                <button
                  type="button"
                  onClick={() => void loadPayments()}
                  className="inline-flex items-center justify-center gap-2 rounded border border-slate-200 px-3 py-2 font-semibold transition hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </section>
          </div>
        </main>

        <aside className="admin-details" aria-label="Request details">
          {selectedRequest ? (
            <div className="admin-details-content">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-7">
                <div>
                  <h2 className="text-lg font-semibold">Payment details</h2>
                  {isLoadingDetails && (
                    <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading latest details
                    </p>
                  )}
                </div>
                <span className="rounded bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
                  #{selectedRequest.id}
                </span>
              </div>

              <div className="admin-details-body px-6 py-7">
                <span className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-bold ${statusStyles[selectedRequest.status]}`}>
                  {statusLabels[selectedRequest.status]}
                </span>
                <p className="mt-4 text-slate-600">Submitted on {selectedRequest.submittedAt}</p>

                <div className="mt-8 space-y-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">User</p>
                    <p className="mt-2 text-lg font-bold">{selectedRequest.userName}</p>
                    <p className="text-slate-600">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Biography Title</p>
                    <p className="mt-2 text-lg font-semibold">{selectedRequest.biographyTitle}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Plan</p>
                      <p className="mt-2 font-semibold">{selectedRequest.plan}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Amount</p>
                      <p className="mt-2 font-bold">{selectedRequest.amount}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-500">User Membership</p>
                  <p className="mt-2 text-base font-bold">
                    {selectedRequest.membership?.status || 'No membership details returned'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedRequest.membership?.planName || 'Membership lookup runs when a payment includes userId.'}
                  </p>
                  {selectedRequest.membership?.expiresAt && (
                    <p className="mt-1 text-xs text-slate-500">
                      Expires {formatDateTime(selectedRequest.membership.expiresAt)}
                    </p>
                  )}
                </div>

                <div className="mt-8 border-t border-slate-200 pt-7">
                  <p className="text-sm font-semibold text-slate-500">Payment Method</p>
                  <p className="mt-2 flex items-center gap-2 font-semibold">
                    <Landmark className="h-5 w-5" />
                    {selectedRequest.paymentMethod}
                  </p>
                  <p className="mt-2 break-all font-mono text-sm text-slate-500">{selectedRequest.reference}</p>
                  {selectedRequest.paidAt && (
                    <p className="mt-2 text-sm text-slate-500">Paid at {formatDateTime(selectedRequest.paidAt)}</p>
                  )}
                  {selectedRequest.verifiedAt && (
                    <p className="mt-1 text-sm text-slate-500">Verified at {formatDateTime(selectedRequest.verifiedAt)}</p>
                  )}
                </div>

                <div className="mt-8">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-700">Proof of Payment Preview</p>
                    {selectedRequest.proofOfPaymentUrl && (
                      <a
                        href={selectedRequest.proofOfPaymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#8A6500] hover:text-[#07142e]"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Expand
                      </a>
                    )}
                  </div>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-[#f7f3ea] p-4 shadow-inner">
                    {selectedRequest.proofOfPaymentUrl ? (
                      <img
                        src={selectedRequest.proofOfPaymentUrl}
                        alt="Proof of payment"
                        className="max-h-64 w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                        No proof image field was returned by this endpoint.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <label htmlFor="admin-notes" className="font-semibold text-slate-700">
                    Admin Notes
                  </label>
                  <textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(event) => setAdminNotes(event.target.value)}
                    rows={4}
                    className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#B18625] focus:ring-4 focus:ring-amber-100"
                    placeholder="Admin notes are UI-only until a backend notes endpoint is available."
                  />
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Save Notes
                  </button>
                </div>

                <div className="admin-action-footer mt-8 space-y-3">
                  <button
                    type="button"
                    onClick={() => setIsActivationModalOpen(true)}
                    disabled={selectedRequest.status !== 'PENDING' || isUpdatingRequest}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-4 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {isUpdatingRequest ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-5 w-5" />
                    )}
                    Confirm Payment and Activate
                  </button>
                  <div className="admin-secondary-actions">
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={selectedRequest.status !== 'PENDING' || isUpdatingRequest}
                      className="rounded-lg border border-slate-200 px-4 py-3 font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-detail-empty">
              <ShieldCheck className="mx-auto mb-4 h-9 w-9 text-slate-300" />
              {isLoadingRequests ? 'Loading admin payments...' : 'Select a payment request to review.'}
            </div>
          )}
        </aside>
      </div>

      {isActivationModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <button
            type="button"
            onClick={() => setIsActivationModalOpen(false)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            aria-label="Close activation confirmation"
          />
          <section className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsActivationModalOpen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-2xl font-bold">Confirm Payment?</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              This calls the admin confirm endpoint for {selectedRequest.userName}. The backend will
              mark the payment confirmed and activate the associated membership.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setIsActivationModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmActivation()}
                disabled={isUpdatingRequest}
                className="rounded-lg bg-black px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdatingRequest ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
