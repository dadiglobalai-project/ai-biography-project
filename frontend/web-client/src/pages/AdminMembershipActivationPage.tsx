import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  HelpCircle,
  Landmark,
  LogOut,
  MessageSquare,
  Monitor,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { authService } from '../services/authService';

type ActivationStatus = 'Pending Review' | 'Activated' | 'Rejected' | 'Needs Info';

type MembershipRequest = {
  id: string;
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
};

const initialRequests: MembershipRequest[] = [
  {
    id: 'REF-9821',
    userName: 'Arthur Ledger',
    email: 'arthur.l@example.com',
    biographyTitle: 'The Ledger Family Chronicle',
    plan: 'DIY Biography Website',
    amount: 'PHP 2,499',
    reference: 'BANK-0921-LEDGER',
    submittedAt: 'Aug 17, 2026 at 14:32 PHT',
    paymentMethod: 'Manual Confirmation (Bank Transfer)',
    status: 'Pending Review',
    notes: '',
  },
  {
    id: 'REF-9820',
    userName: 'Maria Santos',
    email: 'm.santos88@gmail.com',
    biographyTitle: 'Echoes of Manila',
    plan: 'DIY Biography Website',
    amount: 'PHP 2,499',
    reference: 'BANK-0920-SANTOS',
    submittedAt: 'Aug 17, 2026 at 11:18 PHT',
    paymentMethod: 'Manual Confirmation (Bank Transfer)',
    status: 'Pending Review',
    notes: '',
  },
  {
    id: 'REF-9819',
    userName: 'David Chen',
    email: 'david.chen@startup.io',
    biographyTitle: 'Building the Future',
    plan: 'DIY Biography Website',
    amount: 'PHP 2,499',
    reference: 'BANK-0919-CHEN',
    submittedAt: 'Aug 16, 2026 at 16:45 PHT',
    paymentMethod: 'Manual Confirmation (Bank Transfer)',
    status: 'Needs Info',
    notes: 'Receipt amount needs verification.',
  },
  {
    id: 'REF-9818',
    userName: 'Elena Rodriguez',
    email: 'elena.r@example.com',
    biographyTitle: 'A Garden of Years',
    plan: 'DIY Biography Website',
    amount: 'PHP 2,499',
    reference: 'BANK-0918-RODRIGUEZ',
    submittedAt: 'Aug 16, 2026 at 09:20 PHT',
    paymentMethod: 'Manual Confirmation (Bank Transfer)',
    status: 'Activated',
    notes: 'Activated after admin verification.',
  },
];

const statusStyles: Record<ActivationStatus, string> = {
  'Pending Review': 'border-amber-200 bg-amber-50 text-amber-800',
  Activated: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Rejected: 'border-rose-200 bg-rose-50 text-rose-700',
  'Needs Info': 'border-red-200 bg-red-50 text-red-700',
};

const statusOptions: Array<ActivationStatus | 'All'> = [
  'All',
  'Pending Review',
  'Activated',
  'Rejected',
  'Needs Info',
];

const planOptions = ['All', 'DIY Biography Website'];

const getCounts = (requests: MembershipRequest[]) => ({
  pending: requests.filter((request) => request.status === 'Pending Review').length,
  activatedToday: requests.filter((request) => request.status === 'Activated').length,
  needsAttention: requests.filter((request) => request.status === 'Needs Info').length,
  total: 1204,
});

export default function AdminMembershipActivationPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = React.useState(initialRequests);
  const [selectedRequestId, setSelectedRequestId] = React.useState(initialRequests[0]?.id || '');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<ActivationStatus | 'All'>('All');
  const [planFilter, setPlanFilter] = React.useState('All');
  const [adminNotes, setAdminNotes] = React.useState(initialRequests[0]?.notes || '');
  const [isActivationModalOpen, setIsActivationModalOpen] = React.useState(false);
  const [pageMessage, setPageMessage] = React.useState('');

  React.useEffect(() => {
    document.title = 'Membership Activation | Xinghuoji';
  }, []);

  const selectedRequest =
    requests.find((request) => request.id === selectedRequestId) || requests[0];

  React.useEffect(() => {
    setAdminNotes(selectedRequest?.notes || '');
  }, [selectedRequest?.id, selectedRequest?.notes]);

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

  const updateRequestStatus = (status: ActivationStatus) => {
    if (!selectedRequest) {
      return;
    }

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === selectedRequest.id
          ? {
              ...request,
              status,
              notes: adminNotes,
            }
          : request
      )
    );
  };

  const handleSelectRequest = (request: MembershipRequest) => {
    setSelectedRequestId(request.id);
    setPageMessage('');
  };

  const handleConfirmActivation = () => {
    updateRequestStatus('Activated');
    setIsActivationModalOpen(false);
    setPageMessage(`${selectedRequest?.userName || 'User'} membership has been marked as activated.`);
  };

  const handleRequestInfo = () => {
    updateRequestStatus('Needs Info');
    setPageMessage('Request marked as needing more information.');
  };

  const handleReject = () => {
    updateRequestStatus('Rejected');
    setPageMessage('Request has been marked as rejected.');
  };

  const handleSaveNotes = () => {
    updateRequestStatus(selectedRequest?.status || 'Pending Review');
    setPageMessage('Admin notes saved locally.');
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
      label: 'Activated Today',
      value: counts.activatedToday,
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
      label: 'Total Members',
      value: counts.total.toLocaleString(),
      icon: Users,
      className: 'text-slate-950',
      iconClassName: 'bg-slate-100 text-slate-700',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#07142e]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-20 items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-2xl font-bold text-[#07142e] transition hover:text-[#8A6500]"
          >
            Xinghuoji
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              aria-label="Admin settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/account-settings')}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white p-1 shadow-sm transition hover:border-[#B18625]"
              aria-label="Admin profile"
            >
              <span className="flex h-full w-full items-center justify-center rounded-full bg-[#07142e] text-xs font-bold text-white">
                AD
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-80px)] lg:grid-cols-[320px_minmax(0,1fr)_420px]">
        <aside className="border-b border-slate-200 bg-[#f3f2f0] px-5 py-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#8A6500] shadow-sm">
              <Monitor className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xl font-bold">Admin Panel</p>
              <p className="text-sm text-slate-500">System Oversight</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPageMessage('Report generation needs a backend export endpoint.')}
            className="mt-6 flex w-full items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Generate Report
          </button>

          <nav className="mt-10 space-y-2">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg bg-[#FED362]/60 px-4 py-3 text-left font-bold text-[#07142e]"
            >
              <Monitor className="h-5 w-5" />
              Membership Activation
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-semibold text-slate-700 transition hover:bg-white hover:text-[#07142e]"
            >
              <Users className="h-5 w-5" />
              User Management
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-semibold text-slate-700 transition hover:bg-white hover:text-[#07142e]"
            >
              <BookOpen className="h-5 w-5" />
              Biography Management
            </button>
          </nav>

          <div className="mt-10 hidden lg:block" />
          <div className="mt-10 space-y-2 border-t border-slate-200 pt-6 lg:mt-[520px]">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-semibold text-slate-700 transition hover:bg-white hover:text-[#07142e]"
            >
              <HelpCircle className="h-5 w-5" />
              Support
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-semibold text-slate-700 transition hover:bg-white hover:text-[#07142e]"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </aside>

        <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="mx-auto max-w-4xl">
            <div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Membership Activation
              </h1>
              <p className="mt-3 text-lg text-slate-600">
                Review and process new user membership requests.
              </p>
            </div>

            {pageMessage && (
              <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {pageMessage}
              </div>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className={`min-h-40 rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${card.className}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="max-w-[110px] text-lg font-semibold leading-snug">{card.label}</p>
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconClassName}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <p className="mt-6 text-5xl font-semibold leading-none">{card.value}</p>
                  </div>
                );
              })}
            </div>

            <section className="mt-10 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 bg-white p-4 lg:flex-row">
                <label className="flex min-h-12 flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-500">
                  <Search className="h-5 w-5 shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by user, email, title, or reference"
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none"
                  />
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as ActivationStatus | 'All')}
                  className="min-h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#B18625] focus:ring-4 focus:ring-amber-100"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      Status: {status}
                    </option>
                  ))}
                </select>
                <select
                  value={planFilter}
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
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                    setPlanFilter('All');
                  }}
                  className="flex min-h-12 items-center justify-center rounded-lg border border-slate-200 px-4 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  aria-label="Refresh filters"
                >
                  <RefreshCw className="h-5 w-5" />
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
                          <td className="px-5 py-5 text-slate-700">{request.submittedAt.split(' at ')[0]}</td>
                          <td className="px-5 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[request.status]}`}
                            >
                              {request.status}
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
                        {request.status}
                      </span>
                    </div>
                    <p className="mt-3 font-semibold text-slate-800">{request.biographyTitle}</p>
                    <p className="mt-2 text-sm text-slate-500">{request.amount} · {request.submittedAt}</p>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {filteredRequests.length ? 1 : 0} to {filteredRequests.length} of {filteredRequests.length} entries
                </span>
                <div className="flex items-center gap-2">
                  <button type="button" className="rounded border border-slate-200 px-3 py-2 transition hover:bg-slate-50">
                    Prev
                  </button>
                  <button type="button" className="rounded border border-slate-950 bg-slate-950 px-3 py-2 text-white">
                    1
                  </button>
                  <button type="button" className="rounded border border-slate-200 px-3 py-2 transition hover:bg-slate-50">
                    2
                  </button>
                  <button type="button" className="rounded border border-slate-200 px-3 py-2 transition hover:bg-slate-50">
                    Next
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>

        <aside className="border-t border-slate-200 bg-white lg:border-l lg:border-t-0">
          {selectedRequest ? (
            <div className="sticky top-20">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-7">
                <h2 className="text-2xl font-bold">Request Details</h2>
                <span className="rounded bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
                  #{selectedRequest.id}
                </span>
              </div>

              <div className="max-h-[calc(100vh-160px)] overflow-y-auto px-6 py-7">
                <span className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-bold ${statusStyles[selectedRequest.status]}`}>
                  {selectedRequest.status}
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

                <div className="mt-8 border-t border-slate-200 pt-7">
                  <p className="text-sm font-semibold text-slate-500">Payment Method</p>
                  <p className="mt-2 flex items-center gap-2 font-semibold">
                    <Landmark className="h-5 w-5" />
                    {selectedRequest.paymentMethod}
                  </p>
                  <p className="mt-2 break-all font-mono text-sm text-slate-500">{selectedRequest.reference}</p>
                </div>

                <div className="mt-8">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-700">Proof of Payment Preview</p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#8A6500] hover:text-[#07142e]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Expand
                    </button>
                  </div>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-[#f7f3ea] p-4 shadow-inner">
                    <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                        <FileText className="h-5 w-5 text-[#8A6500]" />
                        <p className="text-sm font-bold">Xinghuoji Membership Receipt</p>
                      </div>
                      <dl className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">Reference</dt>
                          <dd className="text-right font-mono">{selectedRequest.reference}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">Amount</dt>
                          <dd className="font-bold">{selectedRequest.amount}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">Plan</dt>
                          <dd className="text-right">{selectedRequest.plan}</dd>
                        </div>
                      </dl>
                    </div>
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
                    placeholder="Add notes before activating, rejecting, or requesting more information."
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

                <div className="mt-8 space-y-3">
                  <button
                    type="button"
                    onClick={() => setIsActivationModalOpen(true)}
                    disabled={selectedRequest.status === 'Activated'}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-4 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Activate Membership
                  </button>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleReject}
                      className="rounded-lg border border-slate-200 px-4 py-3 font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestInfo}
                      className="rounded-lg border border-slate-200 px-4 py-3 font-bold text-[#8A6500] transition hover:border-amber-200 hover:bg-amber-50"
                    >
                      Request Info
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-slate-500">Select a membership request to review.</div>
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
            <h2 className="mt-5 text-2xl font-bold">Activate Membership?</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              This will mark {selectedRequest.userName} as active and allow publishing access after
              admin payment verification.
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
                onClick={handleConfirmActivation}
                className="rounded-lg bg-black px-4 py-3 font-bold text-white transition hover:bg-slate-800"
              >
                Confirm Activation
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
