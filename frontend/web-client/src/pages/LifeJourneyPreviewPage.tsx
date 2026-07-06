import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PenTool } from 'lucide-react';
import LifeJourneyTemplate from '../Templates/LifeJourney/LifeJourneyTemplate';

export default function LifeJourneyPreviewPage() {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = 'Life Journey Preview | Xinghuoji';
  }, []);

  return (
    <div className="relative min-h-screen bg-[#FAF6F0]">
      <div className="fixed bottom-6 right-6 z-[80] flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate('/diy-dashboard')}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white/95 px-4 py-3 text-xs font-bold uppercase tracking-wide text-stone-800 shadow-lg backdrop-blur-md transition hover:border-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>
        <button
          type="button"
          onClick={() => navigate('/diy-dashboard/templates/life-journey/edit')}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-900 bg-stone-900 px-4 py-3 text-xs font-bold uppercase tracking-wide text-amber-50 shadow-lg transition hover:bg-stone-800"
        >
          <PenTool className="h-4 w-4" />
          Edit
        </button>
      </div>

      <LifeJourneyTemplate />
    </div>
  );
}
