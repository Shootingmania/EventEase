import React from 'react';

interface BottomNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onStartPlanning: () => void;
  onOpenConcierge: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  setCurrentView,
  onStartPlanning,
  onOpenConcierge,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFF9F2]/95 backdrop-blur-xl border-t border-[#E3D5CA]/60 shadow-[0_-4px_20px_-2px_rgba(122,30,58,0.06)] px-2 py-1">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {/* Plan / Questionnaire */}
        <button
          onClick={onStartPlanning}
          className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[48px] px-2 py-1 rounded-xl text-[#5E514D] hover:text-[#7A1E3A] transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
          <span className="text-[11px] font-medium">New Plan</span>
        </button>

        {/* Active Plan Dashboard */}
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[48px] px-2 py-1 rounded-xl transition-all ${
            currentView === 'dashboard'
              ? 'text-[#7A1E3A] font-semibold bg-[#FFD9DF]/40'
              : 'text-[#5E514D] hover:text-[#7A1E3A]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">dashboard</span>
          <span className="text-[11px]">Dashboard</span>
        </button>

        {/* My Plans */}
        <button
          onClick={() => setCurrentView('my-plans')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[48px] px-2 py-1 rounded-xl transition-all ${
            currentView === 'my-plans'
              ? 'text-[#7A1E3A] font-semibold bg-[#FFD9DF]/40'
              : 'text-[#5E514D] hover:text-[#7A1E3A]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">folder_special</span>
          <span className="text-[11px]">My Plans</span>
        </button>

        {/* AI Concierge */}
        <button
          onClick={onOpenConcierge}
          className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[48px] px-2 py-1 rounded-xl text-[#5E514D] hover:text-[#7A1E3A] transition-all"
        >
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">forum</span>
            <span className="w-2 h-2 rounded-full bg-[#2A9D8F] absolute -top-0.5 -right-0.5 ring-2 ring-[#FFF9F2]" />
          </div>
          <span className="text-[11px]">Concierge</span>
        </button>
      </div>
    </nav>
  );
};
