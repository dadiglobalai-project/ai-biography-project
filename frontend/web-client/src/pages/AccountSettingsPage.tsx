import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Camera,
  CheckCircle2,
  Database,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Save,
  Shield,
  UserRound,
  X,
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { authService } from '../services/authService';
import type { BiographyWebsite, ServiceType, SubjectType } from '../services/authService';
import { getDashboardPath } from '../utils/dashboardRouting';

type SettingsSection = 'profile' | 'security' | 'preferences' | 'storage' | 'account';

type StoredAccountPreferences = {
  defaultSubjectType: SubjectType;
  defaultTemplate: string;
};

const ACCOUNT_PREFERENCES_STORAGE_KEY = 'xinghuoji.account.preferences';

const subjectOptions: Array<{ value: SubjectType; label: string }> = [
  { value: 'SELF', label: 'Myself' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'GRANDPARENT', label: 'Grandparent' },
  { value: 'CHILD', label: 'Child' },
  { value: 'SPOUSE', label: 'Spouse' },
  { value: 'LOVED_ONE', label: 'Loved One' },
];

const getPreferencesStorageKey = (email?: string) =>
  `${ACCOUNT_PREFERENCES_STORAGE_KEY}:${email?.trim().toLowerCase() || 'anonymous'}`;

const readStoredPreferences = (email?: string): StoredAccountPreferences => {
  try {
    const storedValue = window.localStorage.getItem(getPreferencesStorageKey(email));
    if (!storedValue) {
      return { defaultSubjectType: 'SELF', defaultTemplate: 'Life Journey' };
    }

    const parsedValue = JSON.parse(storedValue) as Partial<StoredAccountPreferences>;
    const validSubject = subjectOptions.some((option) => option.value === parsedValue.defaultSubjectType);

    return {
      defaultSubjectType: validSubject ? parsedValue.defaultSubjectType as SubjectType : 'SELF',
      defaultTemplate: parsedValue.defaultTemplate || 'Life Journey',
    };
  } catch {
    window.localStorage.removeItem(getPreferencesStorageKey(email));
    return { defaultSubjectType: 'SELF', defaultTemplate: 'Life Journey' };
  }
};

const writeStoredPreferences = (email: string | undefined, preferences: StoredAccountPreferences) => {
  window.localStorage.setItem(getPreferencesStorageKey(email), JSON.stringify(preferences));
};

const getInitials = (name: string) => {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return initials || 'U';
};

const formatServiceType = (serviceType?: ServiceType | string) =>
  serviceType === 'PROFESSIONAL' ? 'Professional' : serviceType === 'DIY' ? 'DIY' : 'Not selected';

const getLatestBiography = (websites: BiographyWebsite[]) =>
  [...websites].sort((first, second) => {
    const firstTime = new Date(first.updatedAt || first.createdAt || 0).getTime();
    const secondTime = new Date(second.updatedAt || second.createdAt || 0).getTime();
    return secondTime - firstTime;
  })[0];

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const sectionRefs = React.useRef<Record<SettingsSection, HTMLElement | null>>({
    profile: null,
    security: null,
    preferences: null,
    storage: null,
    account: null,
  });
  const [currentUser, setCurrentUser] = React.useState<{ fullName?: string; email: string } | null>(null);
  const [profileName, setProfileName] = React.useState('');
  const [profileEmail, setProfileEmail] = React.useState('');
  const [serviceType, setServiceType] = React.useState<ServiceType>('DIY');
  const [defaultSubjectType, setDefaultSubjectType] = React.useState<SubjectType>('SELF');
  const [defaultTemplate, setDefaultTemplate] = React.useState('Life Journey');
  const [biographies, setBiographies] = React.useState<BiographyWebsite[]>([]);
  const [mediaCount, setMediaCount] = React.useState(0);
  const [activeSection, setActiveSection] = React.useState<SettingsSection>('profile');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSavingPreferences, setIsSavingPreferences] = React.useState(false);
  const [isPasswordPanelOpen, setIsPasswordPanelOpen] = React.useState(false);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = React.useState(false);
  const [profileMessage, setProfileMessage] = React.useState('');
  const [preferencesMessage, setPreferencesMessage] = React.useState('');
  const [passwordResetMessage, setPasswordResetMessage] = React.useState('');
  const [passwordResetStatus, setPasswordResetStatus] = React.useState<'success' | 'error'>('success');
  const [passwordResetToken, setPasswordResetToken] = React.useState('');
  const [pageError, setPageError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    document.title = 'Profile & Account Settings | Xinghuoji';

    const loadSettings = async () => {
      setIsLoading(true);
      setPageError('');

      try {
        const session = await authService.getCurrentUser();
        if (!active || !session.user) {
          return;
        }

        const email = session.user.email;
        const fullName = session.user.fullName || 'User';
        const storedPreferences = readStoredPreferences(email);

        setCurrentUser(session.user);
        setProfileName(fullName);
        setProfileEmail(email);
        setDefaultSubjectType(storedPreferences.defaultSubjectType);
        setDefaultTemplate(storedPreferences.defaultTemplate);

        try {
          const dashboard = await authService.getDashboard();
          if (active) {
            setServiceType(dashboard.serviceType === 'PROFESSIONAL' ? 'PROFESSIONAL' : 'DIY');
          }
        } catch {
          if (active) {
            setServiceType(authService.getSavedServiceType(email) || 'DIY');
          }
        }

        const websites = await authService.getBiographyWebsites();
        if (!active) {
          return;
        }

        setBiographies(websites);
        const mediaLists = await Promise.all(
          websites
            .filter((website) => website.id && !website.id.startsWith('local-'))
            .map((website) => authService.getBiographyWebsiteMedia(website.id))
        );

        if (active) {
          setMediaCount(mediaLists.reduce((total, mediaItems) => total + mediaItems.length, 0));
        }
      } catch (error) {
        if (!active) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Unable to load account settings.';
        if (/unauthorized|forbidden|session|token/i.test(message)) {
          navigate('/login', { replace: true });
          return;
        }

        setPageError(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      active = false;
    };
  }, [navigate]);

  const setSectionRef = (section: SettingsSection) => (node: HTMLElement | null) => {
    sectionRefs.current[section] = node;
  };

  const scrollToSection = (section: SettingsSection) => {
    setActiveSection(section);
    sectionRefs.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSaveProfile = () => {
    setProfileMessage('Profile editing needs a backend account update endpoint before changes can be saved.');
  };

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);
    setPreferencesMessage('');

    try {
      await authService.saveServiceType(serviceType);
      writeStoredPreferences(profileEmail || currentUser?.email, {
        defaultSubjectType,
        defaultTemplate,
      });
      setPreferencesMessage('Preferences saved. Your selected dashboard will be used on the next login.');
    } catch (error) {
      setPreferencesMessage(error instanceof Error ? error.message : 'Unable to save preferences.');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleOpenPasswordPanel = () => {
    setIsPasswordPanelOpen(true);
    setPasswordResetMessage('');
    setPasswordResetStatus('success');
    setPasswordResetToken('');
  };

  const handleSendPasswordReset = async () => {
    const email = profileEmail || currentUser?.email || '';

    if (!email) {
      setPasswordResetMessage('Unable to send reset instructions because no account email was found.');
      setPasswordResetStatus('error');
      setPasswordResetToken('');
      return;
    }

    setIsSendingPasswordReset(true);
    setPasswordResetMessage('');
    setPasswordResetStatus('success');
    setPasswordResetToken('');

    try {
      const response = await authService.forgotPassword(email);
      setPasswordResetMessage(response.message || 'Password reset instructions were sent to your email.');
      setPasswordResetStatus('success');
      setPasswordResetToken(response.resetToken || '');
    } catch (error) {
      setPasswordResetMessage(error instanceof Error ? error.message : 'Unable to send password reset instructions.');
      setPasswordResetStatus('error');
    } finally {
      setIsSendingPasswordReset(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }

    navigate('/login');
  };

  const dashboardPath = getDashboardPath(serviceType);
  const latestBiography = getLatestBiography(biographies);
  const latestBiographyPath = latestBiography
    ? `/diy-dashboard/templates/life-journey/edit?websiteId=${encodeURIComponent(latestBiography.id)}`
    : '';
  const displayName = profileName || currentUser?.fullName || 'User';
  const navItems: Array<{ key: SettingsSection; label: string; icon: React.ElementType }> = [
    { key: 'profile', label: 'Profile', icon: UserRound },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'preferences', label: 'Biography Preferences', icon: BookOpen },
    { key: 'storage', label: 'Storage', icon: Database },
    { key: 'account', label: 'Account', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-[#F4F9FC] font-sans text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-slate-200 bg-[#EEF7FA] px-5 py-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col">
            <button
              type="button"
              onClick={() => navigate(dashboardPath)}
              className="mb-8 flex items-center gap-3 text-left"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-lg font-bold text-[#0A1128] shadow-sm">
                {getInitials(displayName)}
              </div>
              <div className="min-w-0">
                <BrandLogo variant="mobile" className="w-36 max-w-full" />
                <p className="mt-1 truncate text-xs text-slate-500">{displayName}</p>
              </div>
            </button>

            <nav className="grid gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => scrollToSection(item.key)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[#FED362] text-[#0A1128] shadow-sm'
                        : 'text-slate-600 hover:bg-white hover:text-[#0A1128]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 hidden flex-1 lg:block" />

            <div className="mt-8 space-y-3 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={() => navigate(dashboardPath)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#8A6F00] px-4 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#735d00]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        <main className="px-5 py-7 md:px-10 lg:px-16 lg:py-12">
          <div className="mx-auto max-w-6xl">
            <button
              type="button"
              onClick={() => navigate(dashboardPath)}
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 transition hover:text-[#0A1128]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <div className="mb-10 max-w-3xl">
              <h1 className="font-serif-display text-4xl font-semibold leading-tight tracking-tight text-[#0A1128] md:text-6xl">
                Profile & Account Settings
              </h1>
              <p className="mt-3 text-base leading-relaxed text-slate-600 md:text-lg">
                Manage your account details and biography preferences.
              </p>
            </div>

            {pageError && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {pageError}
              </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.84fr]">
              <div className="space-y-6">
                <section
                  ref={setSectionRef('profile')}
                  className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <UserRound className="h-5 w-5 text-[#8A6F00]" />
                    <h2 className="font-serif-display text-2xl font-bold text-[#0A1128]">
                      Profile Information
                    </h2>
                  </div>

                  <div className="grid gap-6 md:grid-cols-[160px_1fr]">
                    <div className="space-y-3">
                      <div className="flex h-36 w-36 items-center justify-center rounded-lg border-2 border-[#FED362] bg-amber-50 text-4xl font-bold text-[#0A1128]">
                        {getInitials(displayName)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setProfileMessage('Profile photo upload needs a backend profile media endpoint.')}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-[#8A6F00] hover:text-[#8A6F00]"
                      >
                        <Camera className="h-4 w-4" />
                        Change Photo
                      </button>
                    </div>

                    <div className="space-y-5">
                      <label className="block space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Full Name</span>
                        <input
                          value={profileName}
                          onChange={(event) => setProfileName(event.currentTarget.value)}
                          className="w-full border-b border-slate-300 bg-transparent px-0 py-2 text-lg text-slate-900 outline-none transition focus:border-[#8A6F00]"
                          placeholder="Your full name"
                        />
                      </label>
                      <label className="block space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Email Address</span>
                        <input
                          value={profileEmail}
                          readOnly
                          className="w-full border-b border-slate-300 bg-transparent px-0 py-2 text-lg text-slate-700 outline-none"
                        />
                      </label>
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Service Type</span>
                        <div>
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                            {formatServiceType(serviceType)}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-slate-100 pt-5">
                        <button
                          type="button"
                          onClick={handleSaveProfile}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#8A6F00] px-5 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#735d00]"
                        >
                          <Save className="h-4 w-4" />
                          Save Changes
                        </button>
                      </div>
                      {profileMessage && (
                        <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                          {profileMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section
                  ref={setSectionRef('security')}
                  className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8"
                >
                  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <KeyRound className="h-5 w-5 text-[#0A1128]" />
                      <h2 className="font-serif-display text-2xl font-bold text-[#0A1128]">Security</h2>
                    </div>
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                      <Shield className="h-3.5 w-3.5" />
                      Protected
                    </span>
                  </div>
                  <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
                    Protect your account by keeping your password updated. We will send secure reset instructions to your account email.
                  </p>

                  {!isPasswordPanelOpen ? (
                    <button
                      type="button"
                      onClick={handleOpenPasswordPanel}
                      className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-950 hover:text-white"
                    >
                      <KeyRound className="h-4 w-4" />
                      Change Password
                    </button>
                  ) : (
                    <div className="mt-6 rounded-lg border border-slate-200 bg-[#F8FAFC] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-bold text-[#0A1128]">Change Password</h3>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500">
                            We will send secure reset instructions to the email connected to this account.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsPasswordPanelOpen(false);
                            setPasswordResetMessage('');
                            setPasswordResetStatus('success');
                            setPasswordResetToken('');
                          }}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-900 hover:text-slate-900"
                          aria-label="Close password reset panel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <label className="mt-4 block space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Account Email</span>
                        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <input
                            value={profileEmail || currentUser?.email || ''}
                            readOnly
                            className="min-w-0 flex-1 bg-transparent outline-none"
                          />
                        </div>
                      </label>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={handleSendPasswordReset}
                          disabled={isSendingPasswordReset}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Mail className="h-4 w-4" />
                          {isSendingPasswordReset ? 'Sending...' : 'Send Change Password Link'}
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/forgot-password')}
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-950"
                        >
                          Open Reset Page
                        </button>
                      </div>

                      {passwordResetMessage && (
                        <div
                          className={`mt-4 rounded-lg border px-3 py-2 text-xs font-semibold leading-relaxed ${
                            passwordResetStatus === 'success'
                              ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                              : 'border-rose-100 bg-rose-50 text-rose-700'
                          }`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {passwordResetStatus === 'success' ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <AlertCircle className="h-3.5 w-3.5" />
                            )}
                            {passwordResetMessage}
                          </span>
                          {passwordResetToken && (
                            <p className="mt-2 break-all rounded-md bg-white/70 px-2 py-1 font-mono text-[11px] text-emerald-800">
                              Mock reset token: {passwordResetToken}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>

              <div className="space-y-6">
                <section
                  ref={setSectionRef('preferences')}
                  className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-[#8A6F00]" />
                    <h2 className="font-serif-display text-2xl font-bold text-[#0A1128]">
                      Biography Preferences
                    </h2>
                  </div>
                  <div className="space-y-5">
                    <label className="block space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Dashboard Focus</span>
                      <select
                        value={serviceType}
                        onChange={(event) => setServiceType(event.currentTarget.value as ServiceType)}
                        className="w-full rounded-lg border border-slate-300 bg-[#F4F9FC] px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#8A6F00] focus:ring-2 focus:ring-amber-100"
                      >
                        <option value="DIY">DIY Dashboard</option>
                        <option value="PROFESSIONAL">Professional Dashboard</option>
                      </select>
                    </label>
                    <label className="block space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Default Subject Focus</span>
                      <select
                        value={defaultSubjectType}
                        onChange={(event) => setDefaultSubjectType(event.currentTarget.value as SubjectType)}
                        className="w-full rounded-lg border border-slate-300 bg-[#F4F9FC] px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#8A6F00] focus:ring-2 focus:ring-amber-100"
                      >
                        {subjectOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Default Narrative Template</span>
                      <input
                        value={defaultTemplate}
                        onChange={(event) => setDefaultTemplate(event.currentTarget.value)}
                        className="w-full rounded-lg border border-slate-300 bg-[#F4F9FC] px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#8A6F00] focus:ring-2 focus:ring-amber-100"
                      />
                    </label>
                    <p className="text-xs leading-relaxed text-slate-500">
                      Templates define the core structure of the generated biography.
                    </p>
                    <div className="border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={handleSavePreferences}
                        disabled={isSavingPreferences}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#8A6F00] px-5 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#735d00] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save className="h-4 w-4" />
                        {isSavingPreferences ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                    {preferencesMessage && (
                      <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                        {preferencesMessage}
                      </p>
                    )}
                  </div>
                </section>

                <section
                  ref={setSectionRef('storage')}
                  className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-[#0A1128]" />
                      <h2 className="font-serif-display text-2xl font-bold text-[#0A1128]">Media Archive</h2>
                    </div>
                    <span className="text-2xl font-bold text-[#0A1128]">
                      {isLoading ? '...' : mediaCount}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Uploaded biography images and media assets connected to your saved drafts.
                  </p>
                  <button
                    type="button"
                    disabled={!latestBiographyPath}
                    onClick={() => latestBiographyPath && navigate(latestBiographyPath)}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#8A6F00] transition hover:text-[#5f4c00] disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Open Latest Biography
                    <BookOpen className="h-4 w-4" />
                  </button>
                </section>

                <section
                  ref={setSectionRef('account')}
                  className="scroll-mt-24 rounded-lg border border-rose-100 bg-white p-6 shadow-sm md:p-8"
                >
                  <h2 className="font-serif-display text-2xl font-bold text-rose-700">Account Actions</h2>
                  <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex w-full items-center justify-between rounded-lg border border-slate-300 bg-[#F4F9FC] px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900"
                    >
                      Log Out Securely
                      <LogOut className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled
                      className="inline-flex w-full items-center justify-center rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-400 opacity-70"
                      title="Requires backend account deactivation endpoint"
                    >
                      Deactivate Account
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
