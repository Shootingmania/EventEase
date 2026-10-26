import React, { useState, useMemo } from 'react';
import { useEventContext } from '../context/EventContext';
import { TimelineItem, TimelineStatus } from '../types/event';
import {
  Clock,
  Plus,
  CheckCircle2,
  Play,
  RotateCcw,
  Search,
  Filter,
  MapPin,
  User,
  Trash2,
  Edit2,
  AlertCircle,
} from 'lucide-react';

export const TimelineView: React.FC = () => {
  const { timeline, addTimelineItem, updateTimelineItem, deleteTimelineItem, cycleTimelineStatus } =
    useEventContext();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);

  // Form State
  const [formTime, setFormTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formOwner, setFormOwner] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formStatus, setFormStatus] = useState<TimelineStatus>('upcoming');

  const completedCount = timeline.filter((t) => t.status === 'completed').length;
  const inProgressCount = timeline.filter((t) => t.status === 'in_progress').length;
  const upcomingCount = timeline.filter((t) => t.status === 'upcoming').length;
  const progressPercent = timeline.length > 0 ? Math.round((completedCount / timeline.length) * 100) : 0;

  const filteredTimeline = useMemo(() => {
    return timeline
      .filter((item) => {
        const matchStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchSearch =
          searchQuery === '' ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchStatus && matchSearch;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [timeline, statusFilter, searchQuery]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTime('09:00 AM');
    setFormEndTime('');
    setFormTitle('');
    setFormDescription('');
    setFormOwner('Alexandra Vance');
    setFormLocation('Main Stage A');
    setFormStatus('upcoming');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TimelineItem) => {
    setEditingItem(item);
    setFormTime(item.time);
    setFormEndTime(item.endTime || '');
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormOwner(item.owner);
    setFormLocation(item.location);
    setFormStatus(item.status);
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formTime.trim()) return;

    if (editingItem) {
      updateTimelineItem(editingItem.id, {
        time: formTime.trim(),
        endTime: formEndTime.trim() || undefined,
        title: formTitle.trim(),
        description: formDescription.trim(),
        owner: formOwner.trim(),
        location: formLocation.trim(),
        status: formStatus,
      });
    } else {
      addTimelineItem({
        time: formTime.trim(),
        endTime: formEndTime.trim() || undefined,
        title: formTitle.trim(),
        description: formDescription.trim(),
        owner: formOwner.trim(),
        location: formLocation.trim(),
        status: formStatus,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Schedule Progress Strip */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">Live Day-of Run-of-Show Schedule</h2>
            <p className="text-xs text-slate-400">
              Coordinated production cues across audio, staging, catering, and speaking tracks
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-indigo-400 tabular-nums">
              {completedCount} of {timeline.length} Cues Executed ({progressPercent}%)
            </span>
            <div className="w-24 sm:w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums text-slate-400 pt-1 border-t border-slate-800/80">
          <span className="text-emerald-400">{completedCount} completed</span>
          <span aria-hidden="true">·</span>
          <span className="text-indigo-400">{inProgressCount} in progress</span>
          <span aria-hidden="true">·</span>
          <span>{upcomingCount} upcoming</span>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search schedule cues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            {['all', 'in_progress', 'upcoming', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white font-medium shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30 whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Schedule Cue</span>
        </button>
      </div>

      {/* Chronological Cue Timeline List */}
      <div className="space-y-3">
        {filteredTimeline.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-slate-900/40 border border-slate-800 rounded-xl">
            No schedule cues match your criteria.
          </div>
        ) : (
          filteredTimeline.map((item) => {
            const isCompleted = item.status === 'completed';
            const isLive = item.status === 'in_progress';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isLive
                    ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                    : isCompleted
                    ? 'bg-slate-900/30 border-slate-800/60 opacity-80'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Toggle Action Button */}
                  <button
                    onClick={() => cycleTimelineStatus(item.id)}
                    title="Advance cue status (Upcoming -> In Progress -> Completed)"
                    className={`mt-0.5 p-1.5 rounded-lg border transition-colors shrink-0 ${
                      isCompleted
                        ? 'border-emerald-800/80 bg-emerald-950/60 text-emerald-400'
                        : isLive
                        ? 'border-indigo-500 bg-indigo-950/80 text-indigo-300 animate-pulse'
                        : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <span className="font-mono font-bold text-white tabular-nums">{item.time}</span>
                      {item.endTime && (
                        <span className="font-mono text-slate-400 tabular-nums">
                          – {item.endTime}
                        </span>
                      )}
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="flex items-center gap-1 text-slate-400 font-medium">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{item.location}</span>
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-bold ${
                        isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Zone: Lead Owner & Status Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80 shrink-0 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-medium text-slate-300">{item.owner}</span>
                  </div>

                  <button
                    onClick={() => cycleTimelineStatus(item.id)}
                    className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded border transition-colors ${
                      isCompleted
                        ? 'border-emerald-800 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950'
                        : isLive
                        ? 'border-indigo-500 text-indigo-300 bg-indigo-950/60 hover:bg-indigo-950'
                        : 'border-slate-700 text-slate-400 bg-slate-800/40 hover:bg-slate-800'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 text-slate-500 hover:text-indigo-400 transition-colors"
                      title="Edit Cue"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTimelineItem(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Cue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Timeline Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">
                {editingItem ? 'Edit Run-of-Show Cue' : 'Add Run-of-Show Schedule Cue'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ESC
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Start Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:30 AM"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">End Time (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:45 AM"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Cue Title / Action</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Opening Keynote & Live Robotics Demo"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Responsible Owner / Lead</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Devon Mercer"
                    value={formOwner}
                    onChange={(e) => setFormOwner(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Location / Stage Zone</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Stage A"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Execution Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as TimelineStatus)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Detailed Instructions & Prompts</label>
                <textarea
                  rows={3}
                  placeholder="Audio cues, mic channels, cue lighting changes..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30"
                >
                  {editingItem ? 'Save Changes' : 'Schedule Cue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
