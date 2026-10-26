import React from 'react';
import { useEventContext } from '../context/EventContext';
import {
  LayoutDashboard,
  Receipt,
  Briefcase,
  Users,
  Clock,
  Shield,
  Calendar,
  MapPin,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenVault: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onOpenVault }) => {
  const { activeEvent, budgetItems, guests, currentUser } = useEventContext();

  const totalSpent = budgetItems.reduce((acc, curr) => acc + (curr.actualAmount || curr.estimatedAmount), 0);
  const totalBudget = activeEvent?.totalBudget || 1;
  const budgetPercent = Math.min(Math.round((totalSpent / totalBudget) * 100), 100);

  const attendingGuests = guests.filter((g) => g.rsvpStatus === 'attending').reduce((acc, g) => acc + g.partySize, 0);

  // Calculate days remaining
  const daysUntil = React.useMemo(() => {
    if (!activeEvent?.date) return 0;
    const target = new Date(activeEvent.date).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [activeEvent]);

  const navItems = [
    { id: 'dashboard', label: 'Command Overview', icon: LayoutDashboard },
    { id: 'budget', label: 'Financials & Budget', icon: Receipt },
    { id: 'vendors', label: 'Vendor Directory', icon: Briefcase },
    { id: 'guests', label: 'RSVP & Seating Chart', icon: Users },
    { id: 'timeline', label: 'Run-of-Show Timeline', icon: Clock },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between h-[calc(100vh-57px)] sticky top-[57px] bg-slate-950/70 border-r border-slate-800/80 p-4">
      <div className="space-y-6">
        {/* Active Event Card */}
        {activeEvent && (
          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="capitalize">{activeEvent.type} Event</span>
              <span className="text-indigo-400 font-mono tabular-nums">{daysUntil} days left</span>
            </div>
            <h2 className="text-sm font-semibold text-white truncate leading-snug">{activeEvent.title}</h2>
            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{activeEvent.date}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{activeEvent.venue}</span>
              </div>
            </div>

            {/* Quick Budget Health Mini-bar */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Budget Spent</span>
                <span className="font-mono tabular-nums text-slate-300">
                  ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetPercent > 95 ? 'bg-rose-500' : budgetPercent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Session & Vault Status Footer */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <button
          onClick={onOpenVault}
          className="w-full flex items-center justify-between p-2.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 rounded-lg text-left transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
              {currentUser.avatarInitials}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 capitalize truncate">
                {currentUser.role.replace('_', ' ')}
              </p>
            </div>
          </div>
          <Shield className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
        </button>
      </div>
    </aside>
  );
};
