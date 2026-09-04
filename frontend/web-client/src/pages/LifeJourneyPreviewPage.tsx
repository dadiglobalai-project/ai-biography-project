import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, PenTool } from 'lucide-react';
import BiographyTemplateRenderer from '../Templates/BiographyTemplateRenderer';
import { loadDraft, saveDraft } from '../Templates/LifeJourney/draftStorage';
import { getBiographyTemplateRoute } from '../Templates/LifeJourney/templateRoutes';
import {
  collectMediaAssetIdsFromBackendSections,
  hydrateDraftFromBackendSections,
} from '../Templates/LifeJourney/backendSectionHydration';
import { authService } from '../services/authService';
import type { BiographyWebsiteSection } from '../services/authService';
import {
  getTemplatePreviewProgressKey,
  getWebsitePreviewProgressKey,
  markDiyPreviewedProgressKey,
} from '../utils/diyProgress';

const loadBackendSectionMediaAccessUrls = async (
  websiteId: string,
  sections: BiographyWebsiteSection[]
) => {
  const mediaAssetIds = collectMediaAssetIdsFromBackendSections(sections);
  const entries = await Promise.all(
    mediaAssetIds.map(async (mediaAssetId) => {
      const accessUrl = await authService.getBiographyWebsiteMediaAccessUrl(websiteId, mediaAssetId);
      return accessUrl ? ([mediaAssetId, accessUrl] as const) : null;
    })
  );

  return Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => Boolean(entry)));
};

export default function LifeJourneyPreviewPage() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const templateRoute = getBiographyTemplateRoute(templateId);
  const websiteId = searchParams.get('websiteId') || '';
  const [isPublishReadyPreview, setIsPublishReadyPreview] = React.useState(
    () => searchParams.get('publishReady') === '1'
  );
  const [previewDraft, setPreviewDraft] = React.useState(() =>
    loadDraft(templateRoute.id, templateRoute.categoryKey, websiteId)
  );

  React.useEffect(() => {
    document.title = `${templateRoute.title} Preview | Xinghuoji`;
  }, [templateRoute.title]);

  React.useEffect(() => {
    markDiyPreviewedProgressKey(
      websiteId ? getWebsitePreviewProgressKey(websiteId) : getTemplatePreviewProgressKey(templateRoute.id)
    );
  }, [templateRoute.id, websiteId]);

  React.useEffect(() => {
    if (searchParams.get('publishReady') !== '1') {
      return;
    }

    setIsPublishReadyPreview(true);

    const timeout = window.setTimeout(() => {
      setIsPublishReadyPreview(false);

      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.delete('publishReady');
      setSearchParams(nextSearchParams, { replace: true });
    }, 4500);

    return () => window.clearTimeout(timeout);
  }, [searchParams, setSearchParams]);

  React.useEffect(() => {
    setPreviewDraft(loadDraft(templateRoute.id, templateRoute.categoryKey, websiteId));
  }, [templateRoute.categoryKey, templateRoute.id, websiteId]);

  React.useEffect(() => {
    if (!websiteId || websiteId.startsWith('local-')) {
      return;
    }

    let active = true;

    const loadBackendPreviewContent = async () => {
      const sections = await authService.getBiographyWebsiteSections(websiteId);
      const detailedSections = await Promise.all(
        sections.map(async (section) => {
          const sectionDetail = await authService.getBiographyWebsiteSection(websiteId, section.id);
          return sectionDetail || section;
        })
      );

      if (!active || detailedSections.length === 0) {
        return;
      }

      const mediaAccessUrls = await loadBackendSectionMediaAccessUrls(websiteId, detailedSections);

      if (!active) {
        return;
      }

      setPreviewDraft((currentDraft) => {
        const hydratedDraft = hydrateDraftFromBackendSections(currentDraft, detailedSections, mediaAccessUrls);
        saveDraft(templateRoute.id, hydratedDraft, websiteId);
        return hydratedDraft;
      });
    };

    loadBackendPreviewContent();

    return () => {
      active = false;
    };
  }, [templateRoute.id, websiteId]);

  const editorPageUrl = React.useMemo(() => {
    const url = new URL(`/diy-dashboard/templates/${templateRoute.id}/edit`, window.location.origin);
    const websiteId = searchParams.get('websiteId');
    if (websiteId) {
      url.searchParams.set('websiteId', websiteId);
    }
    const backendTemplateId = searchParams.get('apiTemplateId');
    if (backendTemplateId) {
      url.searchParams.set('apiTemplateId', backendTemplateId);
    }

    return url.toString();
  }, [searchParams, templateRoute.id]);

  return (
    <div className="relative min-h-screen bg-[#FAF6F0]">
      {isPublishReadyPreview && (
        <div className="fixed left-1/2 top-5 z-[90] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-emerald-100 bg-white/95 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-xl backdrop-blur-md">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p>
              Membership active. Payment is not required for this biography.
            </p>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-[80] flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate('/diy-dashboard')}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white/95 px-4 py-3 text-xs font-bold uppercase tracking-wide text-stone-800 shadow-lg backdrop-blur-md transition hover:border-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>
        <a
          href={editorPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-900 bg-stone-900 px-4 py-3 text-xs font-bold uppercase tracking-wide text-amber-50 shadow-lg transition hover:bg-stone-800"
        >
          <PenTool className="h-4 w-4" />
          Edit
        </a>
      </div>

      <BiographyTemplateRenderer
        templateId={templateRoute.id}
        categoryKey={templateRoute.categoryKey}
        dataOverride={previewDraft}
        websiteId={websiteId}
      />
    </div>
  );
}
