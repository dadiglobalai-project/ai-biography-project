import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, CalendarDays, LogOut, MessageSquareText, ClipboardList } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { authService } from '../services/authService';

export default function ProfessionalDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = React.useState<{ fullName?: string; email: string } | null>(null);

  React.useEffect(() => {
    let active = true;
    document.title = 'Professional Dashboard | Xinghuoji';

    authService.getCurrentUser()
      .then((response) => {
        if (active && response.user) {
          setCurrentUser(response.user);
        }
      })
      .catch(() => {
        if (active) {
          navigate('/login', { replace: true });
        }
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            className="flex items-center max-w-[150px] sm:max-w-[190px] cursor-pointer"
            onClick={() => navigate('/professional-dashboard')}
          >
            <BrandLogo variant="mobile" className="w-full h-auto" />
          </button>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm font-bold text-[#0A1128]">
              {currentUser?.fullName || 'User'}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-10 md:py-14 space-y-8">
        <section className="rounded-2xl border border-slate-100 bg-white p-8 md:p-10 shadow-sm">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#B18625]">
              <Award className="w-3.5 h-3.5" />
              Professional Biography Service
            </div>
            <h1 className="font-serif-display text-4xl md:text-5xl font-semibold text-[#0A1128] tracking-tight">
              Welcome Back, {currentUser?.fullName || 'User'}
            </h1>
            <p className="text-sm md:text-base text-slate-500 leading-relaxed">
              Your professional biography workspace is ready. This area will house consultant planning,
              writing milestones, content review, and publishing assistance as those tools become available.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Planning',
              description: 'Review onboarding details and prepare biography goals with the team.',
              icon: ClipboardList,
            },
            {
              title: 'Consultation',
              description: 'Coordinate interviews, milestones, and support sessions.',
              icon: CalendarDays,
            },
            {
              title: 'Messages',
              description: 'Track updates from the professional biography service team.',
              icon: MessageSquareText,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#B18625] flex items-center justify-center border border-amber-100 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="font-serif-display text-xl font-bold text-[#0A1128]">
                  {item.title}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {item.description}
                </p>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
