import React from 'react';

interface TopNavBarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onStartPlanning: () => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentView,
  setCurrentView,
  onStartPlanning,
  selectedCity,
  setSelectedCity,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFF9F2]/95 backdrop-blur-md border-b border-[#E3D5CA]/50 shadow-[0_2px_12px_rgba(122,30,58,0.04)]">
      <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo + Tagline */}
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-[#7A1E3A] flex items-center justify-center text-[#F2A900] shadow-sm group-hover:scale-105 transition-transform">
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              celebration
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold text-[#7A1E3A] tracking-tight leading-tight">
              EventEase
            </span>
            <span className="text-[10px] font-semibold text-[#5E514D] tracking-wide uppercase">
              AI Event Planning Assistant
            </span>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => setCurrentView('landing')}
            className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-all ${
              currentView === 'landing'
                ? 'text-[#7A1E3A] bg-[#F5ECE1]'
                : 'text-[#5E514D] hover:text-[#7A1E3A] hover:bg-[#F5ECE1]/60'
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => setCurrentView('my-plans')}
            className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-all ${
              currentView === 'my-plans'
                ? 'text-[#7A1E3A] bg-[#F5ECE1]'
                : 'text-[#5E514D] hover:text-[#7A1E3A] hover:bg-[#F5ECE1]/60'
            }`}
          >
            My Plans
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-all ${
              currentView === 'dashboard'
                ? 'text-[#7A1E3A] bg-[#F5ECE1]'
                : 'text-[#5E514D] hover:text-[#7A1E3A] hover:bg-[#F5ECE1]/60'
            }`}
          >
            Sample Plan
          </button>
        </nav>

        {/* Right Action Group */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Region Selector */}
          <div className="relative group">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF3EB] border border-[#E3D5CA]/70 text-xs font-semibold text-[#5E514D] hover:border-[#7A1E3A]/40 transition-colors">
              <span
                className="material-symbols-outlined text-sm text-[#7A1E3A]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                location_on
              </span>
              <span>{selectedCity}</span>
              <span className="material-symbols-outlined text-xs">expand_more</span>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              aria-label="Select City"
            >
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Jaipur">Jaipur</option>
            </select>
          </div>

          <button
            onClick={onStartPlanning}
            className="inline-flex items-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#7A1E3A] text-white text-xs sm:text-sm font-semibold shadow-sm hover:bg-[#5C0325] transition-all hover:shadow-md active:scale-95"
          >
            Start Planning (Free)
          </button>
        </div>
      </div>
    </header>
  );
};
