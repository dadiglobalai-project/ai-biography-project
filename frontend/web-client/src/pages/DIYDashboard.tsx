import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Lightbulb, 
  Check, 
  CheckCircle2,
  ArrowRight, 
  Plus, 
  LogOut, 
  ChevronRight,
  BookOpen,
  PenTool,
  Eye,
  AlertCircle,
  CalendarClock,
  Clock3,
} from 'lucide-react';
import { authService, BiographyTemplate, BiographyWebsite, DashboardResponse, SubjectType } from '../services/authService';
import BrandLogo from '../components/BrandLogo';
import lifeJourneyPreviewImage from '../Templates/LifeJourney/assets/images/life-journey-thumbnail.png';

type RelationType = 'Myself' | 'Parent' | 'Grandparent' | 'Child' | 'Spouse' | 'Loved One';
const BIOGRAPHY_LIST_REFRESH_KEY = 'xinghuoji.biographies.changed';
const BIOGRAPHY_LAST_OPENED_STORAGE_KEY = 'xinghuoji.biographies.lastOpenedAt';

const SUBJECT_TYPE_BY_RELATION: Record<RelationType, SubjectType> = {
  Myself: 'SELF',
  Parent: 'PARENT',
  Grandparent: 'GRANDPARENT',
  Child: 'CHILD',
  Spouse: 'SPOUSE',
  'Loved One': 'LOVED_ONE',
};

interface Template {
  id: string;
  backendTemplateId?: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  tag: string;
  previewPath?: string;
  editPath?: string;
}

const readBiographyLastOpened = (): Record<string, string> => {
  try {
    const storedValue = window.localStorage.getItem(BIOGRAPHY_LAST_OPENED_STORAGE_KEY);
    if (!storedValue) {
      return {};
    }

    const parsedValue = JSON.parse(storedValue);
    return parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)
      ? parsedValue as Record<string, string>
      : {};
  } catch {
    window.localStorage.removeItem(BIOGRAPHY_LAST_OPENED_STORAGE_KEY);
    return {};
  }
};

const writeBiographyLastOpened = (history: Record<string, string>) => {
  window.localStorage.setItem(BIOGRAPHY_LAST_OPENED_STORAGE_KEY, JSON.stringify(history));
};

const getDateTime = (value?: string) => {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const formatBiographyDateTime = (value?: string) => {
  const timestamp = getDateTime(value);
  if (!timestamp) {
    return 'Not available yet';
  }

  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isSameDay = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();
  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  if (isSameDay(date, today)) {
    return `Today, ${time}`;
  }

  if (isSameDay(date, yesterday)) {
    return `Yesterday, ${time}`;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export default function DIYDashboard() {
  const navigate = useNavigate();
  const templateChooserRef = React.useRef<HTMLDivElement | null>(null);
  const [currentUser, setCurrentUser] = useState<{ fullName?: string; email: string } | null>(null);
  const [selectedRelation, setSelectedRelation] = useState<RelationType>('Loved One');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateSelectionMessage, setTemplateSelectionMessage] = useState('');
  const [dashboardSummary, setDashboardSummary] = useState<DashboardResponse | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [backendTemplates, setBackendTemplates] = useState<BiographyTemplate[]>([]);
  const [biographies, setBiographies] = useState<BiographyWebsite[]>([]);
  const [isLoadingBiographies, setIsLoadingBiographies] = useState(false);
  const [biographyError, setBiographyError] = useState<string | null>(null);
  const [openingWebsiteId, setOpeningWebsiteId] = useState<string | null>(null);
  const [lastOpenedByWebsiteId, setLastOpenedByWebsiteId] = useState<Record<string, string>>(
    () => readBiographyLastOpened()
  );
  
  // Custom dialog or modal states
  const [modalContent, setModalContent] = useState<{ title: string; desc: string } | null>(null);

  const loadTemplates = React.useCallback(async () => {
    const templates = await authService.getBiographyTemplates();
    setBackendTemplates(templates);
  }, []);

  const loadBiographies = React.useCallback(async () => {
    setIsLoadingBiographies(true);
    setBiographyError(null);

    try {
      const websites = await authService.getBiographyWebsites();
      setBiographies(websites);
    } catch (err: any) {
      const message = err?.message || 'Unable to load biographies.';
      if (/unauthorized|forbidden|session|token/i.test(message)) {
        navigate('/login', { replace: true });
        return;
      }

      setBiographyError(message);
    } finally {
      setIsLoadingBiographies(false);
    }
  }, [navigate]);

  React.useEffect(() => {
    let active = true;
    document.title = "DIY Dashboard | Xinghuoji";

    const loadDashboard = async () => {
      try {
        const session = await authService.getCurrentUser();
        if (!active) {
          return;
        }

        if (session.user) {
          setCurrentUser(session.user);
        }
      } catch {
        if (active) {
          navigate('/login', { replace: true });
        }
        return;
      }

      try {
        const dashboard = await authService.getDashboard();
        if (!active) {
          return;
        }

        setDashboardSummary(dashboard);
        if (dashboard.user) {
          setCurrentUser((previousUser) => ({
            email: dashboard.user?.email || previousUser?.email || '',
            fullName: dashboard.user?.fullName || previousUser?.fullName,
          }));
        }
        setDashboardError(null);
      } catch (err: any) {
        if (!active) {
          return;
        }

        const message = err?.message || 'Unable to load dashboard.';
        if (/unauthorized|forbidden|session|token/i.test(message)) {
          navigate('/login', { replace: true });
          return;
        }

        setDashboardError(message);
      }

      await loadTemplates();
      await loadBiographies();
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [loadBiographies, loadTemplates, navigate]);

  React.useEffect(() => {
    const refreshBiographies = () => {
      void loadBiographies();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === BIOGRAPHY_LIST_REFRESH_KEY) {
        refreshBiographies();
      }
    };

    window.addEventListener('focus', refreshBiographies);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('focus', refreshBiographies);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadBiographies]);

  React.useEffect(() => {
    if (!templateSelectionMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setTemplateSelectionMessage('');
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [templateSelectionMessage]);

  const relations: RelationType[] = ['Myself', 'Parent', 'Grandparent', 'Child', 'Spouse', 'Loved One'];

  // Map each selected relation option to a recommended template
  const getRecommendation = (relation: RelationType): { name: string; id: string } => {
    switch (relation) {
      case 'Myself':
        return { name: 'Personal Memoir', id: 'personal-memoir' };
      case 'Parent':
        return { name: 'Family Legacy', id: 'life-journey' };
      case 'Grandparent':
        return { name: 'Ancestor Chronicles', id: 'ancestor-chronicles' };
      case 'Child':
        return { name: 'Growth & Dreams', id: 'growth-dreams' };
      case 'Spouse':
        return { name: 'Love & Union', id: 'love-union' };
      case 'Loved One':
      default:
        return { name: 'Family Legacy', id: 'life-journey' };
    }
  };

  const recommended = getRecommendation(selectedRelation);
  const displayName = currentUser?.fullName || 'User';
  const selectedSubjectType = SUBJECT_TYPE_BY_RELATION[selectedRelation];

  const baseTemplates: Template[] = [
    {
      id: 'visionary-legacy',
      title: 'Visionary Legacy',
      subtitle: 'The Visionary who changed the way WE LIVE',
      description: 'A high-contrast, bold template designed for leaders, innovators, and creators who forged new paths.',
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
      tag: 'Bold & Creative',
      previewPath: '/diy-dashboard/templates/visionary-legacy/preview',
      editPath: '/diy-dashboard/templates/visionary-legacy/edit'
    },
    {
      id: 'life-journey',
      title: 'Life Journey',
      subtitle: 'A journey through the land',
      description: 'Complete autobiography template emphasizing chronologies, personal milestones, and wisdom gathered.',
      imageUrl: lifeJourneyPreviewImage,
      tag: 'Classic Memoir',
      previewPath: '/diy-dashboard/templates/life-journey/preview',
      editPath: '/diy-dashboard/templates/life-journey/edit'
    },
    {
      id: 'entrepreneur-story',
      title: 'Entrepreneur Story',
      subtitle: 'Document your business adventures',
      description: 'Tailored for founders, pathfinders, and industry pioneers to archive their ventures, failures, and triumphs.',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
      tag: 'Professional',
      previewPath: '/diy-dashboard/templates/entrepreneur-story/preview',
      editPath: '/diy-dashboard/templates/entrepreneur-story/edit'
    }
  ];

  const templates = React.useMemo(() => {
    return baseTemplates.map((template) => {
      const backendTemplate = backendTemplates.find(
        (item) => item.layoutKey === template.id || item.templateId === template.id
      );

      if (!backendTemplate) {
        return template;
      }

      return {
        ...template,
        backendTemplateId: backendTemplate.templateId,
        title: backendTemplate.name || template.title,
        description: backendTemplate.description || template.description,
        imageUrl: backendTemplate.thumbnailUrl || template.imageUrl,
        tag: backendTemplate.category || template.tag,
      };
    });
  }, [backendTemplates]);

  const buildTemplatePageUrl = (
    path: string,
    options: { website?: BiographyWebsite; subjectType?: SubjectType; template?: Template } = {}
  ) => {
    const url = new URL(path, window.location.origin);
    if (options.website?.id) {
      url.searchParams.set('websiteId', options.website.id);
    }
    if (options.subjectType) {
      url.searchParams.set('subjectType', options.subjectType);
    }
    if (options.template?.backendTemplateId) {
      url.searchParams.set('apiTemplateId', options.template.backendTemplateId);
    }

    return url.toString();
  };

  const openTemplatePage = (
    path: string,
    options: { website?: BiographyWebsite; subjectType?: SubjectType; template?: Template } = {}
  ) => {
    const pageUrl = buildTemplatePageUrl(path, options);

    const link = document.createElement('a');
    link.href = pageUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleApplyRecommendation = () => {
    const matched = templates.find(t => t.id === recommended.id);
    if (matched) {
      setSelectedTemplateId(matched.id);
      setTemplateSelectionMessage(`${matched.title} selected for ${selectedRelation}.`);
    } else {
      setTemplateSelectionMessage(`${recommended.name} selected for ${selectedRelation}.`);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
    navigate('/login');
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplateId(template.id);
    setTemplateSelectionMessage(`${template.title} selected. You can now Preview or Edit.`);
  };

  const handlePreviewTemplate = (template: Template) => {
    if (template.previewPath) {
      openTemplatePage(template.previewPath, { template });
      return;
    }

    setModalContent({
      title: `${template.title} Preview`,
      desc: 'This template preview is not wired yet. Life Journey is available now.'
    });
  };

  const getTemplateByIdentifier = (templateId: string) => {
    return templates.find(
      (template) => template.id === templateId || template.backendTemplateId === templateId
    );
  };

  const getEditorPath = (templateId: string) => {
    return getTemplateByIdentifier(templateId)?.editPath || '';
  };

  const recordBiographyOpened = (website: BiographyWebsite) => {
    if (!website.id) {
      return;
    }

    const openedAt = new Date().toISOString();
    setLastOpenedByWebsiteId((currentHistory) => {
      const nextHistory = {
        ...currentHistory,
        [website.id]: openedAt,
      };
      writeBiographyLastOpened(nextHistory);
      return nextHistory;
    });
  };

  const handleOpenBiography = (website: BiographyWebsite) => {
    if (!website.id) {
      setModalContent({
        title: 'Unable to Open Biography',
        desc: 'This biography does not have a website id from the backend yet.'
      });
      return;
    }

    const editPath = getEditorPath(website.templateId);

    if (!editPath) {
      setModalContent({
        title: website.title,
        desc: 'This biography was loaded, but its template editor is not wired yet.'
      });
      return;
    }

    setOpeningWebsiteId(website.id);
    recordBiographyOpened(website);
    openTemplatePage(editPath, { website });
    setOpeningWebsiteId(null);
  };

  const handleEditTemplate = (template: Template) => {
    if (!template.editPath) {
      setModalContent({
        title: `${template.title} Editor`,
        desc: 'This template editor is not wired yet. Life Journey is available now.'
      });
      return;
    }

    setSelectedTemplateId(template.id);
    openTemplatePage(template.editPath, { subjectType: selectedSubjectType, template });
  };

  const handleCreateNew = () => {
    const defaultTemplate = templates.find((template) => template.id === 'life-journey');
    if (defaultTemplate) {
      handleEditTemplate(defaultTemplate);
    }
  };

  const handleContinueDraft = () => {
    const draft = biographies.find((website) => website.status.toUpperCase() === 'DRAFT') || biographies[0];

    if (draft) {
      handleOpenBiography(draft);
      return;
    }

    setModalContent({
      title: "No Drafts Yet",
      desc: "Create a biography first, then your draft will appear here."
    });
  };

  const defaultCreateTemplate = templates.find((template) => template.id === 'life-journey');
  const createNewUrl = defaultCreateTemplate?.editPath
    ? buildTemplatePageUrl(defaultCreateTemplate.editPath, {
        subjectType: selectedSubjectType,
        template: defaultCreateTemplate,
      })
    : '';
  const dashboardLatestDraft = dashboardSummary?.actions?.latestDraftId
    ? biographies.find((website) => website.id === dashboardSummary.actions?.latestDraftId)
    : undefined;
  const latestDraft =
    dashboardLatestDraft ||
    biographies.find((website) => website.status.toUpperCase() === 'DRAFT') ||
    biographies[0];
  const latestDraftEditPath = latestDraft ? getEditorPath(latestDraft.templateId) : '';
  const continueDraftUrl = latestDraft?.id && latestDraftEditPath
    ? buildTemplatePageUrl(latestDraftEditPath, { website: latestDraft })
    : '';
  const displayedBiographies = React.useMemo(() => {
    return [...biographies].sort((firstWebsite, secondWebsite) => {
      const firstActivityDate = Math.max(
        getDateTime(firstWebsite.updatedAt),
        getDateTime(firstWebsite.createdAt),
        getDateTime(lastOpenedByWebsiteId[firstWebsite.id])
      );
      const secondActivityDate = Math.max(
        getDateTime(secondWebsite.updatedAt),
        getDateTime(secondWebsite.createdAt),
        getDateTime(lastOpenedByWebsiteId[secondWebsite.id])
      );

      return secondActivityDate - firstActivityDate;
    });
  }, [biographies, lastOpenedByWebsiteId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans selection:bg-amber-200">
      
      {/* 1. Header Navigation matches Mockup 100% */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer max-w-[150px] sm:max-w-[190px]" 
            onClick={() => navigate('/preserve-story')}
          >
            <BrandLogo variant="mobile" className="w-full h-auto" />
          </div>

          {/* Nav links containing ONLY DIY Dashboard link with bold active line */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <button 
              onClick={() => navigate('/diy-dashboard')}
              className="text-[#0A1128] font-bold border-b-2 border-[#FED362] pb-1 transition-all cursor-pointer"
            >
              DIY Dashboard
            </button>
          </nav>

          {/* User Session Profile with Name & Avatar & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="font-sans text-sm font-bold text-[#0A1128]">
                {displayName}
              </span>
              <div className="relative w-8.5 h-8.5 rounded-full overflow-hidden border border-slate-200/80 shadow-sm bg-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150" 
                  alt={`${displayName} profile`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-10 md:py-14 space-y-12">
        
        {/* Welcome Back Greeting Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2 max-w-2xl">
            <h1 className="font-serif-display text-4xl md:text-5xl font-semibold text-[#0A1128] tracking-tight leading-tight">
              Welcome Back, {displayName}
            </h1>
            <p className="text-slate-500 italic text-sm md:text-base font-sans">
              "Every story preserved today becomes a legacy for tomorrow."
            </p>
          </div>

          {/* Action buttons (Right-aligned in desktop) */}
          <div className="flex items-center gap-3 shrink-0">
            {createNewUrl ? (
              <a
                href={createNewUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (defaultCreateTemplate) {
                    setSelectedTemplateId(defaultCreateTemplate.id);
                  }
                }}
                className="px-6 py-3 bg-black hover:bg-slate-900 active:scale-[0.98] text-white rounded-xl text-xs font-bold tracking-wide transition-all duration-150 shadow-sm cursor-pointer"
              >
                Create New Biography
              </a>
            ) : (
              <button
                onClick={handleCreateNew}
                className="px-6 py-3 bg-black hover:bg-slate-900 active:scale-[0.98] text-white rounded-xl text-xs font-bold tracking-wide transition-all duration-150 shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Create New Biography
              </button>
            )}
            {continueDraftUrl && !isLoadingBiographies ? (
              <a
                href={continueDraftUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (latestDraft?.id) {
                    recordBiographyOpened(latestDraft);
                    setOpeningWebsiteId(latestDraft.id);
                    window.setTimeout(() => setOpeningWebsiteId(null), 300);
                  }
                }}
                className="px-6 py-3 bg-white border border-slate-200 hover:border-slate-800 active:scale-[0.98] text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold tracking-wide transition-all duration-150 shadow-sm cursor-pointer"
              >
                Continue Draft
              </a>
            ) : (
              <button
                onClick={handleContinueDraft}
                disabled={isLoadingBiographies || Boolean(openingWebsiteId)}
                className="px-6 py-3 bg-white border border-slate-200 hover:border-slate-800 active:scale-[0.98] text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold tracking-wide transition-all duration-150 shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {openingWebsiteId ? 'Opening Draft...' : 'Continue Draft'}
              </button>
            )}
          </div>
        </div>

        {dashboardError && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-3">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{dashboardError}</span>
          </div>
        )}

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div className="space-y-1">
              <h2 className="font-serif-display text-2xl md:text-3xl font-semibold text-[#0A1128] tracking-tight">
                My Biographies
              </h2>
              <p className="text-slate-500 text-sm">
                Your saved biography website drafts from the backend.
              </p>
            </div>
            <button
              type="button"
              onClick={loadBiographies}
              disabled={isLoadingBiographies}
              className="self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoadingBiographies ? 'Refreshing...' : 'Refresh List'}
            </button>
          </div>

          {biographyError && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-start gap-3">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{biographyError}</span>
            </div>
          )}

          {isLoadingBiographies && biographies.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-white px-5 py-5 text-sm text-slate-500 shadow-sm">
              Loading biographies...
            </div>
          ) : displayedBiographies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedBiographies.map((website) => {
                const isOpening = openingWebsiteId === website.id;
                const websiteTemplate = getTemplateByIdentifier(website.templateId);
                const editPath = website.id ? getEditorPath(website.templateId) : '';
                const biographyUrl = editPath ? buildTemplatePageUrl(editPath, { website }) : '';
                const lastEditedValue = website.updatedAt || website.createdAt;
                const lastEditedLabel = website.updatedAt ? 'Last edited' : 'Created';
                const lastOpenedValue = lastOpenedByWebsiteId[website.id];
                const biographyCard = (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-2">
                        <div className="flex items-center gap-2 text-[#B18625]">
                          <BookOpen className="w-4 h-4 shrink-0" />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                            {websiteTemplate?.title || website.templateId || 'Template'}
                          </span>
                        </div>
                        <h3 className="font-serif-display text-xl font-semibold text-[#0A1128] truncate">
                          {website.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {website.subjectType} - {website.subdomain || 'No subdomain yet'}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {isOpening ? 'Opening' : website.status}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:grid-cols-2">
                      <span className="inline-flex items-center gap-2">
                        <CalendarClock className="h-3.5 w-3.5 shrink-0 text-[#B18625]" />
                        <span>
                          <span className="font-semibold text-slate-700">{lastEditedLabel}:</span>{' '}
                          {formatBiographyDateTime(lastEditedValue)}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="h-3.5 w-3.5 shrink-0 text-[#B18625]" />
                        <span>
                          <span className="font-semibold text-slate-700">Last opened:</span>{' '}
                          {lastOpenedValue ? formatBiographyDateTime(lastOpenedValue) : 'Not opened yet'}
                        </span>
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      <span>Open Editor</span>
                      <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-[#B18625]" />
                    </div>
                  </>
                );

                return biographyUrl ? (
                  <a
                    key={website.id || `${website.templateId}-${website.title}`}
                    href={biographyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (website.id) {
                        recordBiographyOpened(website);
                        setOpeningWebsiteId(website.id);
                        window.setTimeout(() => setOpeningWebsiteId(null), 300);
                      }
                    }}
                    className="group rounded-xl border border-slate-100 bg-white p-5 text-left shadow-sm transition hover:border-[#FED362] hover:shadow-md"
                  >
                    {biographyCard}
                  </a>
                ) : (
                  <button
                    key={website.id || `${website.templateId}-${website.title}`}
                    type="button"
                    onClick={() => handleOpenBiography(website)}
                    disabled={isOpening}
                    className="group rounded-xl border border-slate-100 bg-white p-5 text-left shadow-sm transition hover:border-[#FED362] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {biographyCard}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-5 py-6 text-sm text-slate-500">
              No biographies yet. Start with a template below to create your first draft.
            </div>
          )}
        </section>

        {/* Interactive "Let AI Recommend a Template" Dark Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0A192F] rounded-3xl p-8 md:p-10 text-white relative overflow-hidden border border-slate-800 shadow-[0_20px_50px_rgba(10,25,47,0.15)]"
        >
          {/* Subtle top brand decoration line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FED362] to-amber-500" />
          
          <div className="absolute -right-24 -bottom-24 w-72 h-72 bg-amber-400/[0.04] rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-8 relative z-10">
            
            {/* Header info */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner">
                <Lightbulb className="w-5 h-5 fill-current" />
              </div>
              <h2 className="text-xl md:text-2xl font-serif-display font-semibold tracking-tight text-slate-100">
                Let AI Recommend a Template
              </h2>
            </div>

            {/* Question description */}
            <div className="space-y-4">
              <p className="text-slate-300 font-sans text-sm font-medium">
                Who are you creating this biography for?
              </p>

              {/* Grid of relative relation buttons */}
              <div className="flex flex-wrap gap-2.5">
                {relations.map((relation) => {
                  const isActive = selectedRelation === relation;
                  return (
                    <button
                      key={relation}
                      onClick={() => setSelectedRelation(relation)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide border transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'bg-[#B18625] border-[#B18625] text-white shadow-md shadow-[#B18625]/20 scale-[1.03]' 
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {relation}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-white/10 pt-1" />

            {/* Live updated Recommended Template feedback info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono uppercase tracking-widest">
                  Recommended Template:
                </span>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={recommended.name}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 5 }}
                    className="text-sm font-semibold text-[#FED362] flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {recommended.name}
                  </motion.span>
                </AnimatePresence>
              </div>

              <button
                onClick={handleApplyRecommendation}
                className="flex items-center gap-1 text-xs font-bold text-[#FED362] hover:text-amber-300 tracking-wider uppercase transition-colors cursor-pointer self-start sm:self-auto group"
              >
                Apply Recommendation 
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

          </div>
        </motion.div>

        {/* "Choose a Biography Template" Main Showcase List */}
        <div ref={templateChooserRef} className="scroll-mt-24 space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif-display text-2xl md:text-3xl font-semibold text-[#0A1128] tracking-tight">
              Choose a Biography Template
            </h2>
            <p className="text-slate-500 text-sm">
              Start with a professionally designed template tailored to your life story.
            </p>
          </div>

          {templateSelectionMessage && (
            <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{templateSelectionMessage}</span>
            </div>
          )}

          {/* Biography Templates Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {templates.map((template) => {
              const isSelected = selectedTemplateId === template.id;
              const previewUrl = template.previewPath
                ? buildTemplatePageUrl(template.previewPath, { template })
                : '';
              const editUrl = template.editPath
                ? buildTemplatePageUrl(template.editPath, { subjectType: selectedSubjectType, template })
                : '';
              return (
                <div
                  key={template.id}
                  className={`bg-white rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-300 relative group cursor-pointer ${
                    isSelected 
                      ? 'border-[#FED362] shadow-[0_12px_35px_rgba(254,211,98,0.15)] ring-1 ring-[#FED362]' 
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-xl'
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                >
                  
                  {/* Image container & overlay with 100% styled screenshot layout */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                    <img 
                      src={template.imageUrl} 
                      alt={template.title}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark gradient overlay for typography readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                    {/* Top tag badge */}
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] font-mono font-bold tracking-wider bg-black/60 backdrop-blur-md text-[#FED362] px-2.5 py-1 rounded-full border border-white/10 uppercase">
                        {template.tag}
                      </span>
                    </div>

                    {/* Overlay Title & Description Texts */}
                    <div className="absolute bottom-5 inset-x-5 space-y-1">
                      <p className="text-[11px] font-sans text-slate-300 font-bold uppercase tracking-wider italic leading-none opacity-90">
                        "{template.subtitle}"
                      </p>
                      <h3 className="font-serif-display text-lg font-bold text-white leading-tight">
                        {template.title}
                      </h3>
                    </div>

                    {/* Selection halo check */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border border-white/20 shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Template body detail card area */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      {template.description}
                    </p>

                    <div className="pt-3 border-t border-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold tracking-wide text-[#B18625] uppercase">
                          {isSelected ? 'Selected Active' : 'Select Theme'}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-100 group-hover:bg-[#FED362] group-hover:text-slate-900 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {previewUrl ? (
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold uppercase tracking-wide text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Preview
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handlePreviewTemplate(template);
                            }}
                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold uppercase tracking-wide text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Preview
                          </button>
                        )}
                        {editUrl ? (
                          <a
                            href={editUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedTemplateId(template.id);
                            }}
                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-black px-3 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-900"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            Edit
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleEditTemplate(template);
                            }}
                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-black px-3 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* 3. Black Square Floating Action Button (FAB) matching the mockup */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => {
            setModalContent({
              title: "Create Custom Legacy",
              desc: "Configure an adaptive layout. You can define custom typography, color boards, and archive options entirely tailored to your preferences."
            });
          }}
          className="w-12 h-12 rounded-xl bg-black hover:bg-slate-900 active:scale-[0.95] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-150 cursor-pointer group"
          title="Add Custom Template"
        >
          <Plus className="w-6 h-6 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      {/* 4. Elegant Platform Footer */}
      <footer className="border-t border-slate-100 py-6 text-center select-none bg-white">
        <p className="text-[11px] text-slate-400 font-medium">
          &copy; 2026 Xinghuoji. The Eternal Spark. All rights reserved.
        </p>
      </footer>

      {/* Modern Pop-up / Modal Component for interactive user feedback */}
      <AnimatePresence>
        {modalContent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalContent(null)}
              className="absolute inset-0 bg-[#0A1128]/40 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 max-w-sm w-full shadow-2xl relative z-10 text-center space-y-5"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 fill-current" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif-display text-xl font-bold text-[#0A1128]">
                  {modalContent.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed font-sans">
                  {modalContent.desc}
                </p>
              </div>

              <button
                onClick={() => setModalContent(null)}
                className="w-full py-3 rounded-xl bg-black hover:bg-slate-900 text-white font-sans text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
