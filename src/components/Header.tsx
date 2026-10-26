import React from 'react';
import { useEventContext } from '../context/EventContext';
import { Plus, Lock, ShieldCheck, ChevronDown, Calendar, MapPin } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenNewEvent: () => void;
  onOpenVault: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  onOpenNewEvent,
  onOpenVault,
}) => {
  const { activeEvent, events, setActiveEventId, currentUser, lockVault } = useEventContext();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 md:gap-8 px-4 md:px-8 py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Brand Wordmark & Active Event Switcher */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-sm shadow-indigo-500/20">
            E
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors whitespace-nowrap">
              EventEase
            </span>
          </div>
        </button>

        {/* Quick Event Switcher */}
        <div className="relative group hidden sm:block">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-md cursor-pointer hover:border-slate-700 transition-colors">
            <span className="max-w-[140px] md:max-w-[180px] truncate">{activeEvent?.title || 'Select Event'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
          <select
            value={activeEvent?.id || ''}
            onChange={(e) => setActiveEventId(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label="Select active event"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            currentView === 'dashboard' ? 'text-white border-b-2 border-indigo-500 pb-0.5' : ''
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setCurrentView('budget')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            currentView === 'budget' ? 'text-white border-b-2 border-indigo-500 pb-0.5' : ''
          }`}
        >
          Budget Ledger
        </button>
        <button
          onClick={() => setCurrentView('vendors')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            currentView === 'vendors' ? 'text-white border-b-2 border-indigo-500 pb-0.5' : ''
          }`}
        >
          Vendors
        </button>
        <button
          onClick={() => setCurrentView('guests')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            currentView === 'guests' ? 'text-white border-b-2 border-indigo-500 pb-0.5' : ''
          }`}
        >
          Guest Seating
        </button>
        <button
          onClick={() => setCurrentView('timeline')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            currentView === 'timeline' ? 'text-white border-b-2 border-indigo-500 pb-0.5' : ''
          }`}
        >
          Run of Show
        </button>
      </nav>

      {/* Zone 3: Primary Action & Security Vault */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Security Vault Trigger */}
        <button
          onClick={onOpenVault}
          title="Security Vault & Encrypted Backups"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors focus:outline-none"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline font-mono text-[11px] text-slate-400">AES-256</span>
        </button>

        {/* Lock Vault */}
        <button
          onClick={lockVault}
          title="Lock Workspace Vault"
          className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
        >
          <Lock className="w-3.5 h-3.5" />
        </button>

        {/* Primary CTA */}
        <button
          onClick={onOpenNewEvent}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-all shadow-sm shadow-indigo-600/30 whitespace-nowrap shrink-0 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Event</span>
        </button>
      </div>
    </header>
  );
};
