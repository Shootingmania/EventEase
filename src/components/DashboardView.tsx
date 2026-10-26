import React from 'react';
import { useEventContext } from '../context/EventContext';
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

interface DashboardViewProps {
  setCurrentView: (view: string) => void;
  onOpenNewEvent: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setCurrentView, onOpenNewEvent }) => {
  const {
    activeEvent,
    budgetItems,
    vendors,
    guests,
    tables,
    timeline,
    cycleTimelineStatus,
    auditLogs,
  } = useEventContext();

  if (!activeEvent) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-white mb-2">No Active Event Selected</h2>
        <p className="text-sm text-slate-400 mb-6">Create your first event or select an existing one to begin planning.</p>
        <button
          onClick={onOpenNewEvent}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Create New Event
        </button>
      </div>
    );
  }

  // Financial Calculations
  const totalBudget = activeEvent.totalBudget || 1;
  const committedActual = budgetItems.reduce((acc, b) => acc + (b.actualAmount || b.estimatedAmount), 0);
  const totalPaid = budgetItems.reduce((acc, b) => acc + b.paidAmount, 0);
  const remainingBudget = totalBudget - committedActual;
  const percentSpent = Math.min(Math.round((committedActual / totalBudget) * 100), 100);

  // Guest Calculations
  const totalInvited = guests.length;
  const attendingGuests = guests.filter((g) => g.rsvpStatus === 'attending');
  const attendingHeadcount = attendingGuests.reduce((acc, g) => acc + g.partySize, 0);
  const pendingGuests = guests.filter((g) => g.rsvpStatus === 'pending').length;
  const declinedGuests = guests.filter((g) => g.rsvpStatus === 'declined').length;
  const seatedGuestsCount = guests.filter((g) => g.tableId !== null && g.rsvpStatus === 'attending').length;
  const acceptanceRate = totalInvited > 0 ? Math.round((attendingGuests.length / totalInvited) * 100) : 0;

  // Vendor Calculations
  const signedVendors = vendors.filter((v) => v.status === 'contract_signed' || v.status === 'completed').length;
  const inNegotiationVendors = vendors.filter((v) => v.status === 'negotiation' || v.status === 'inquiry').length;
  const totalVendorContracts = vendors.reduce((acc, v) => acc + v.contractAmount, 0);

  // Timeline Next Cue
  const nextCue = timeline.find((t) => t.status === 'in_progress') || timeline.find((t) => t.status === 'upcoming') || timeline[0];

  // Days Countdown
  const daysUntil = React.useMemo(() => {
    const target = new Date(activeEvent.date).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [activeEvent.date]);

  // Category breakdown for budget
  const categoryTotals: { [key: string]: number } = {};
  budgetItems.forEach((b) => {
    categoryTotals[b.category] = (categoryTotals[b.category] || 0) + (b.actualAmount || b.estimatedAmount);
  });
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Event Header Banner */}
      <section className="relative overflow-hidden p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="capitalize text-indigo-400 font-semibold">{activeEvent.type} Event</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{activeEvent.status}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-emerald-400 tabular-nums">{daysUntil} days until launch</span>
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-white text-balance">
              {activeEvent.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{activeEvent.date}</span>
                <span className="font-mono tabular-nums text-slate-500">({activeEvent.startTime} - {activeEvent.endTime})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{activeEvent.venue}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
            <button
              onClick={() => setCurrentView('budget')}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5 text-indigo-400" />
              <span>Budget Ledger</span>
            </button>
            <button
              onClick={() => setCurrentView('guests')}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Floor Seating</span>
            </button>
            <button
              onClick={() => setCurrentView('timeline')}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Live Run of Show</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Budget Health */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Total Budget</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-xl md:text-2xl font-bold font-mono text-white tabular-nums">
              ${committedActual.toLocaleString()}
            </p>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              of ${totalBudget.toLocaleString()}
            </span>
          </div>
          <div className="space-y-1">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentSpent > 100 ? 'bg-rose-500' : percentSpent > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${percentSpent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 tabular-nums">
              <span>{percentSpent}% committed</span>
              <span className={remainingBudget < 0 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                ${remainingBudget.toLocaleString()} remaining
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Attendees & RSVPs */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Guest Headcount</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-xl md:text-2xl font-bold font-mono text-white tabular-nums">
              {attendingHeadcount}
            </p>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              Target: {activeEvent.guestCountTarget}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
            <span className="text-emerald-400 font-medium">{attendingGuests.length} confirmed</span>
            <span aria-hidden="true">·</span>
            <span>{pendingGuests} pending</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500">{declinedGuests} declined</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Seating assigned: <span className="font-mono text-slate-300 tabular-nums">{seatedGuestsCount}/{attendingGuests.length}</span> attendees
          </p>
        </div>

        {/* Metric 3: Vendor Status */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Vendors & Partners</span>
            <Briefcase className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-xl md:text-2xl font-bold font-mono text-white tabular-nums">
              {vendors.length}
            </p>
            <span className="text-xs font-mono text-emerald-400 tabular-nums">
              {signedVendors} signed
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono tabular-nums">
            Contract volume: <span className="text-slate-200 font-medium">${totalVendorContracts.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {inNegotiationVendors} vendor proposals in review
          </p>
        </div>

        {/* Metric 4: Live Timeline Cue */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Active Schedule Cue</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          {nextCue ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-indigo-400 tabular-nums">{nextCue.time}</span>
                <span className="text-xs text-slate-500 capitalize">({nextCue.status.replace('_', ' ')})</span>
              </div>
              <p className="text-xs font-semibold text-slate-200 line-clamp-1">{nextCue.title}</p>
              <p className="text-[11px] text-slate-400 truncate">Lead: {nextCue.owner} · {nextCue.location}</p>
            </>
          ) : (
            <p className="text-xs text-slate-400 pt-2">No schedule cues scheduled</p>
          )}
        </div>
      </div>

      {/* Two-Column Primary Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Run-of-Show Schedule Preview */}
        <div className="lg:col-span-2 p-5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-white">Day-of Run-of-Show Timeline</h2>
              <p className="text-xs text-slate-400">Live minute-by-minute execution cues with 1-click status transitions</p>
            </div>
            <button
              onClick={() => setCurrentView('timeline')}
              className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>Full Schedule</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {timeline.slice(0, 5).map((cue) => {
              const isDone = cue.status === 'completed';
              const isLive = cue.status === 'in_progress';

              return (
                <div
                  key={cue.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border transition-all ${
                    isLive
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                      : isDone
                      ? 'bg-slate-900/30 border-slate-800/60 opacity-75'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      onClick={() => cycleTimelineStatus(cue.id)}
                      title="Click to advance status"
                      className={`p-1 rounded-md transition-colors ${
                        isDone
                          ? 'text-emerald-400 hover:text-emerald-300'
                          : isLive
                          ? 'text-indigo-400 hover:text-indigo-300'
                          : 'text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-slate-300 tabular-nums">{cue.time}</span>
                        {cue.endTime && <span className="font-mono text-slate-500 text-[11px] tabular-nums">- {cue.endTime}</span>}
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-400 font-medium">{cue.location}</span>
                      </div>
                      <p className={`text-xs font-medium mt-0.5 ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {cue.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs">
                    <span className="text-slate-400 text-[11px]">Lead: {cue.owner}</span>
                    <button
                      onClick={() => cycleTimelineStatus(cue.id)}
                      className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded border ${
                        isDone
                          ? 'border-emerald-800 text-emerald-400 bg-emerald-950/40'
                          : isLive
                          ? 'border-indigo-500 text-indigo-300 bg-indigo-950/60'
                          : 'border-slate-700 text-slate-400 bg-slate-800/60'
                      }`}
                    >
                      {cue.status.replace('_', ' ')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): Budget Categories & Audit Trail */}
        <div className="space-y-6">
          {/* Top Budget Allocation Categories */}
          <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Top Expense Allocations</h2>
              <button
                onClick={() => setCurrentView('budget')}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View Ledger
              </button>
            </div>

            <div className="space-y-3">
              {sortedCategories.map(([category, amount]) => {
                const percent = Math.min(Math.round((amount / totalBudget) * 100), 100);
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 truncate max-w-[170px]">{category}</span>
                      <span className="font-mono text-slate-300 tabular-nums">${amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security & Audit Trail Snippet */}
          <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Security Audit Log</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">LIVE</span>
            </div>
            <div className="space-y-2 text-xs">
              {auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="p-2 bg-slate-900/70 border border-slate-800/80 rounded-lg">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{log.action}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-0.5 truncate">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
