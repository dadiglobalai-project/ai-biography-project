import React from 'react';
import { AdminHeader, AdminNavigation } from '../components/AdminNavigation';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { authService } from '../services/authService';
import type { AdminRefundResponse, AdminRefundStatus } from '../services/authService';

type RefundStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

type RefundRequest = {
  id: string;
  paymentId: string;
  userName: string;
  email: string;
  amount: string;
  reason: string;
  status: RefundStatus;
  requestedAt: string;
  processedAt?: string;
  refundMethod?: string;
  externalRefundReference?: string;
};

const refundStatusOptions: Array<RefundStatus | 'All'> = [
  'All',
  'REQUESTED',
  'APPROVED',
  'PROCESSING',
  'COMPLETED',
  'REJECTED',
  'FAILED',
];

const refundStatusLabels: Record<RefundStatus, string> = {
  REQUESTED: 'Requested',
  APPROVED: 'Approved',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  FAILED: 'Failed',
};

const refundStatusStyles: Record<RefundStatus, string> = {
  REQUESTED: 'border-amber-200 bg-amber-50 text-amber-800',
  APPROVED: 'border-blue-200 bg-blue-50 text-blue-700',
  PROCESSING: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  COMPLETED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-700',
  FAILED: 'border-red-200 bg-red-50 text-red-700',
};

const formatMoney = (amount: number, currency: string) => {
  if (!amount || !currency) {
    return 'Not available yet';
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

const getStatusFromRefund = (status?: string): RefundStatus => {
  const normalizedStatus = String(status || '').toUpperCase();
  return refundStatusOptions.includes(normalizedStatus as RefundStatus)
    ? normalizedStatus as RefundStatus
    : 'REQUESTED';
};

const mapRefundToRequest = (refund: AdminRefundResponse): RefundRequest => ({
  id: refund.refundId,
  paymentId: refund.paymentId,
  userName: refund.userName || refund.userEmail || 'Unknown user',
  email: refund.userEmail || 'No email returned',
  amount: formatMoney(refund.amount, refund.currency),
  reason: refund.reason || 'No refund reason returned',
  status: getStatusFromRefund(refund.status),
  requestedAt: formatDateTime(refund.requestedAt || refund.createdAt),
  processedAt: refund.processedAt,
  refundMethod: refund.refundMethod,
  externalRefundReference: refund.externalRefundReference,
});

const getCounts = (refunds: RefundRequest[]) => ({
  requested: refunds.filter((refund) => refund.status === 'REQUESTED').length,
  approved: refunds.filter((refund) => refund.status === 'APPROVED' || refund.status === 'PROCESSING').length,
  completed: refunds.filter((refund) => refund.status === 'COMPLETED').length,
  needsAttention: refunds.filter((refund) => refund.status === 'FAILED' || refund.status === 'REJECTED').length,
});

const upsertRefund = (refunds: RefundRequest[], nextRefund: RefundRequest) =>
  refunds.some((refund) => refund.id === nextRefund.id)
    ? refunds.map((refund) => (refund.id === nextRefund.id ? nextRefund : refund))
    : [nextRefund, ...refunds];

export default function AdminRefundRequestsPage() {
  const navigate = useNavigate();
  const [refunds, setRefunds] = React.useState<RefundRequest[]>([]);
  const [selectedRefundId, setSelectedRefundId] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<RefundStatus | 'All'>('REQUESTED');
  const [refundMethod, setRefundMethod] = React.useState('WECHAT');
  const [externalRefundReference, setExternalRefundReference] = React.useState('');
  const [isLoadingRefunds, setIsLoadingRefunds] = React.useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = React.useState(false);
  const [isUpdatingRefund, setIsUpdatingRefund] = React.useState(false);
  const [pageMessage, setPageMessage] = React.useState('');
  const [pageError, setPageError] = React.useState('');

  React.useEffect(() => {
    document.title = 'Refund Requests | Xinghuoji';
  }, []);

  const selectedRefund = React.useMemo(
    () => refunds.find((refund) => refund.id === selectedRefundId) || refunds[0],
    [refunds, selectedRefundId]
  );

  const loadRefunds = React.useCallback(async () => {
    setIsLoadingRefunds(true);
    setPageError('');
    setPageMessage('');

    try {
      const response = await authService.getAdminRefunds(
        statusFilter === 'All' ? undefined : statusFilter as AdminRefundStatus
      );
      const nextRefunds = response.map(mapRefundToRequest);

      setRefunds(nextRefunds);
      setSelectedRefundId((currentId) =>
        nextRefunds.some((refund) => refund.id === currentId)
          ? currentId
          : nextRefunds[0]?.id || ''
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load admin refunds.';
      if (/unauthorized|forbidden|session|token/i.test(message)) {
        navigate('/login', { replace: true });
        return;
      }

      setPageError(message);
      setRefunds([]);
      setSelectedRefundId('');
    } finally {
      setIsLoadingRefunds(false);
    }
  }, [navigate, statusFilter]);

  React.useEffect(() => {
    void loadRefunds();
  }, [loadRefunds]);

  React.useEffect(() => {
    setRefundMethod(selectedRefund?.refundMethod || 'WECHAT');
    setExternalRefundReference(selectedRefund?.externalRefundReference || '');
  }, [selectedRefund?.externalRefundReference, selectedRefund?.id, selectedRefund?.refundMethod]);

  const hydrateRefundDetails = React.useCallback(async (refund: RefundRequest) => {
    setIsLoadingDetails(true);
    setPageError('');

    try {
      const detail = await authService.getAdminRefund(refund.id);
      const nextRefund = mapRefundToRequest(detail);

      setRefunds((currentRefunds) => upsertRefund(currentRefunds, nextRefund));
      setSelectedRefundId(nextRefund.id);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to load refund details.');
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  const filteredRefunds = React.useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return refunds.filter((refund) => {
      const matchesSearch =
        !normalizedSearch ||
        [refund.userName, refund.email, refund.paymentId, refund.id, refund.reason]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesStatus = statusFilter === 'All' || refund.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [refunds, searchQuery, statusFilter]);

  const counts = React.useMemo(() => getCounts(refunds), [refunds]);

  const handleSelectRefund = (refund: RefundRequest) => {
    setSelectedRefundId(refund.id);
    setPageMessage('');
    void hydrateRefundDetails(refund);
  };

  const updateRefundInList = (refund: AdminRefundResponse, message: string) => {
    const nextRefund = mapRefundToRequest(refund);
    setRefunds((currentRefunds) => upsertRefund(currentRefunds, nextRefund));
    setSelectedRefundId(nextRefund.id);
    setPageMessage(message);
  };

  const handleApproveRefund = async () => {
    if (!selectedRefund) {
      return;
    }

    setIsUpdatingRefund(true);
    setPageError('');
    setPageMessage('');

    try {
      const refund = await authService.approveAdminRefund(selectedRefund.id);
      updateRefundInList(refund, 'Refund request has been approved.');
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to approve refund.');
    } finally {
      setIsUpdatingRefund(false);
    }
  };

  const handleRejectRefund = async () => {
    if (!selectedRefund) {
      return;
    }

    setIsUpdatingRefund(true);
    setPageError('');
    setPageMessage('');

    try {
      const refund = await authService.rejectAdminRefund(selectedRefund.id);
      updateRefundInList(refund, 'Refund request has been rejected.');
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to reject refund.');
    } finally {
      setIsUpdatingRefund(false);
    }
  };

  const handleCompleteRefund = async () => {
    if (!selectedRefund) {
      return;
    }

    setIsUpdatingRefund(true);
    setPageError('');
    setPageMessage('');

    try {
      const refund = await authService.completeAdminRefund(selectedRefund.id, {
        refundMethod,
        externalRefundReference: externalRefundReference.trim() || undefined,
      });
      updateRefundInList(refund, 'Refund has been completed and membership cancellation was requested.');
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to complete refund.');
    } finally {
      setIsUpdatingRefund(false);
    }
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
      label: 'Requested',
      value: counts.requested,
      icon: RotateCcw,
      className: 'text-slate-950',
      iconClassName: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Approved / Processing',
      value: counts.approved,
      icon: Clock3,
      className: 'text-slate-950',
      iconClassName: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Completed',
      value: counts.completed,
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
                Refund Requests
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
                Review 7-day cancellation requests and complete manual refunds after verification.
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
                    placeholder="Search by user, email, payment ID, refund ID, or reason"
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none"
                  />
                </label>
                <select
                  aria-label="Filter by status" value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as RefundStatus | 'All')}
                  className="min-h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#B18625] focus:ring-4 focus:ring-amber-100"
                >
                  {refundStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      Status: {status === 'All' ? 'All' : refundStatusLabels[status]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void loadRefunds()}
                  disabled={isLoadingRefunds}
                  className="flex min-h-12 items-center justify-center rounded-lg border border-slate-200 px-4 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Refresh admin refunds"
                >
                  {isLoadingRefunds ? (
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
                      <th className="px-5 py-4 font-bold">Payment ID</th>
                      <th className="px-5 py-4 font-bold">Refund ID</th>
                      <th className="px-5 py-4 font-bold">Amount</th>
                      <th className="px-5 py-4 font-bold">Requested</th>
                      <th className="px-5 py-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRefunds.map((refund) => {
                      const isSelected = selectedRefund?.id === refund.id;

                      return (
                        <tr
                          key={refund.id}
                          onClick={() => handleSelectRefund(refund)}
                          tabIndex={0}
                          aria-selected={isSelected}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleSelectRefund(refund);
                            }
                          }}
                          className={`cursor-pointer transition ${
                            isSelected ? 'bg-amber-50/60' : 'bg-white hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-5 py-5">
                            <p className="font-bold text-[#07142e]">{refund.userName}</p>
                            <p className="mt-1 text-sm text-slate-500">{refund.email}</p>
                          </td>
                          <td className="px-5 py-5 font-mono text-sm text-slate-700">{refund.paymentId}</td>
                          <td className="px-5 py-5 font-mono text-sm text-slate-700">{refund.id}</td>
                          <td className="px-5 py-5 font-bold text-slate-900">{refund.amount}</td>
                          <td className="px-5 py-5 text-slate-700">{refund.requestedAt}</td>
                          <td className="px-5 py-5">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${refundStatusStyles[refund.status]}`}>
                              {refundStatusLabels[refund.status]}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid divide-y divide-slate-200 lg:hidden">
                {filteredRefunds.map((refund) => (
                  <button
                    key={refund.id}
                    type="button"
                    onClick={() => handleSelectRefund(refund)}
                    className={`p-5 text-left transition ${
                      selectedRefund?.id === refund.id ? 'bg-amber-50/60' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">{refund.userName}</p>
                        <p className="mt-1 text-sm text-slate-500">{refund.email}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${refundStatusStyles[refund.status]}`}>
                        {refundStatusLabels[refund.status]}
                      </span>
                    </div>
                    <p className="mt-3 font-mono text-sm text-slate-700">{refund.id}</p>
                    <p className="mt-2 text-sm text-slate-500">{refund.amount} - {refund.requestedAt}</p>
                  </button>
                ))}
              </div>

              {isLoadingRefunds && (
                <div role="status" className="flex items-center justify-center gap-2 border-t border-slate-200 px-5 py-10 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />Loading requests...
                </div>
              )}

              {!isLoadingRefunds && filteredRefunds.length === 0 && (
                <div className="border-t border-slate-200 px-5 py-12 text-center text-sm text-slate-500">
                  No admin refunds found for the selected filters.
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {filteredRefunds.length ? 1 : 0} to {filteredRefunds.length} of {filteredRefunds.length} entries
                </span>
                <button
                  type="button"
                  onClick={() => void loadRefunds()}
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
          {selectedRefund ? (
            <div className="admin-details-content">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-7">
                <div>
                  <h2 className="text-lg font-semibold">Refund details</h2>
                  {isLoadingDetails && (
                    <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading latest details
                    </p>
                  )}
                </div>
                <span className="rounded bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
                  #{selectedRefund.id}
                </span>
              </div>

              <div className="admin-details-body px-6 py-7">
                <span className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-bold ${refundStatusStyles[selectedRefund.status]}`}>
                  {refundStatusLabels[selectedRefund.status]}
                </span>
                <p className="mt-4 text-slate-600">Requested on {selectedRefund.requestedAt}</p>

                <div className="mt-8 space-y-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">User</p>
                    <p className="mt-2 text-lg font-bold">{selectedRefund.userName}</p>
                    <p className="text-slate-600">{selectedRefund.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Amount</p>
                      <p className="mt-2 font-bold">{selectedRefund.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Method</p>
                      <p className="mt-2 font-semibold">{selectedRefund.refundMethod || 'WECHAT'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">Payment ID</p>
                    <p className="mt-2 break-all font-mono text-sm text-slate-700">{selectedRefund.paymentId}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">Reason</p>
                    <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-relaxed text-slate-700">
                      {selectedRefund.reason}
                    </p>
                  </div>

                  {selectedRefund.processedAt && (
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Processed</p>
                      <p className="mt-2 text-sm text-slate-700">{formatDateTime(selectedRefund.processedAt)}</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <label htmlFor="refund-method" className="text-sm font-semibold text-slate-700">
                    Refund Method
                  </label>
                  <select
                    id="refund-method"
                    value={refundMethod}
                    onChange={(event) => setRefundMethod(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-[#B18625] focus:ring-4 focus:ring-amber-100"
                  >
                    <option value="WECHAT">WECHAT</option>
                    <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                    <option value="MANUAL">MANUAL</option>
                  </select>

                  <label htmlFor="external-refund-reference" className="mt-4 block text-sm font-semibold text-slate-700">
                    External Refund Reference
                  </label>
                  <input
                    id="external-refund-reference"
                    value={externalRefundReference}
                    onChange={(event) => setExternalRefundReference(event.target.value)}
                    placeholder="Optional, e.g. WX-REFUND-123456"
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#B18625] focus:ring-4 focus:ring-amber-100"
                  />
                </div>

                <div className="admin-action-footer mt-8 space-y-3">
                  <button
                    type="button"
                    onClick={() => void handleApproveRefund()}
                    disabled={selectedRefund.status !== 'REQUESTED' || isUpdatingRefund}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-4 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {isUpdatingRefund ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-5 w-5" />
                    )}
                    Approve Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCompleteRefund()}
                    disabled={
                      !['APPROVED', 'PROCESSING'].includes(selectedRefund.status) ||
                      isUpdatingRefund
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Complete Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRejectRefund()}
                    disabled={selectedRefund.status !== 'REQUESTED' || isUpdatingRefund}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <XCircle className="h-5 w-5" />
                    Reject Refund
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-detail-empty">
              <ShieldCheck className="mx-auto mb-4 h-9 w-9 text-slate-300" />
              {isLoadingRefunds ? 'Loading admin refunds...' : 'Select a refund request to review.'}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
