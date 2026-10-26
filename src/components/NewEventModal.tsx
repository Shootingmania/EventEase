import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { EventType } from '../types/event';
import { Calendar, DollarSign, Users, MapPin, Sparkles, X } from 'lucide-react';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (id: string) => void;
}

interface TemplatePreset {
  name: string;
  type: EventType;
  title: string;
  targetGuests: number;
  budget: number;
  description: string;
}

const TEMPLATES: TemplatePreset[] = [
  {
    name: 'Corporate Tech Summit',
    type: 'corporate',
    title: 'Enterprise Next-Gen Tech Summit 2026',
    targetGuests: 350,
    budget: 150000,
    description: 'Multi-track executive keynote conference, live partner expo, and networking dinner.',
  },
  {
    name: 'Charity Gala & Auction',
    type: 'gala',
    title: 'Silver Linings Philanthropy Gala & Auction',
    targetGuests: 220,
    budget: 85000,
    description: 'Black-tie dinner, fine art auction, and live orchestral entertainment.',
  },
  {
    name: 'Luxury Wedding',
    type: 'wedding',
    title: 'Bespoke Vineyard Wedding Celebration',
    targetGuests: 130,
    budget: 65000,
    description: 'Outdoor sunset vows followed by candlelit dining and live acoustic quartet.',
  },
  {
    name: 'Executive Retreat',
    type: 'conference',
    title: 'Strategic Leadership & Venture Retreat',
    targetGuests: 60,
    budget: 45000,
    description: 'Intimate executive workshops, strategic roadmapping, and culinary tastings.',
  },
];

export const NewEventModal: React.FC<NewEventModalProps> = ({ isOpen, onClose, onEventCreated }) => {
  const { addEvent, addBudgetItem, addTable, addTimelineItem } = useEventContext();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('corporate');
  const [date, setDate] = useState('2026-11-20');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [venue, setVenue] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [guestCountTarget, setGuestCountTarget] = useState('250');
  const [totalBudget, setTotalBudget] = useState('100000');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: TemplatePreset) => {
    setTitle(tpl.title);
    setType(tpl.type);
    setGuestCountTarget(tpl.targetGuests.toString());
    setTotalBudget(tpl.budget.toString());
    setDescription(tpl.description);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venue.trim()) return;

    const budgetNum = parseFloat(totalBudget) || 50000;
    const guestsNum = parseInt(guestCountTarget) || 100;

    const newId = addEvent({
      title: title.trim(),
      type,
      date,
      startTime,
      endTime,
      venue: venue.trim(),
      venueAddress: venueAddress.trim() || `${venue.trim()}, California`,
      guestCountTarget: guestsNum,
      totalBudget: budgetNum,
      description: description.trim(),
      status: 'planning',
    });

    // Seed sensible baseline budget items for the new event
    addBudgetItem({
      category: 'Venue & Rentals',
      description: 'Primary Venue Booking & Staging Space',
      estimatedAmount: Math.round(budgetNum * 0.35),
      actualAmount: Math.round(budgetNum * 0.35),
      paidAmount: Math.round(budgetNum * 0.15),
      dueDate: date,
      status: 'partially_paid',
    });
    addBudgetItem({
      category: 'Catering & Beverage',
      description: 'Executive Catering & Beverage Service',
      estimatedAmount: Math.round(budgetNum * 0.3),
      actualAmount: Math.round(budgetNum * 0.3),
      paidAmount: 0,
      dueDate: date,
      status: 'pending',
    });
    addBudgetItem({
      category: 'AV, Lighting & Staging',
      description: 'Sound, Lighting & Visual Display Production',
      estimatedAmount: Math.round(budgetNum * 0.2),
      actualAmount: Math.round(budgetNum * 0.2),
      paidAmount: 0,
      dueDate: date,
      status: 'pending',
    });

    // Seed baseline tables
    addTable({
      name: 'Table 1 - VIP & Hosts',
      capacity: 8,
      shape: 'round',
    });
    addTable({
      name: 'Table 2 - Advisory & Keynotes',
      capacity: 8,
      shape: 'round',
    });

    // Seed baseline cue
    addTimelineItem({
      time: startTime,
      title: 'Doors Open & Registration Welcome',
      description: 'Guest check-in and welcome reception begins.',
      owner: 'Event Director',
      location: venue.trim(),
      status: 'upcoming',
    });

    onEventCreated(newId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Create New Event Command Center</h2>
            <p className="text-xs text-slate-400">Configure budget boundaries, date, venue, and attendee scope</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Templates Bar */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Quick Start Templates:</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TEMPLATES.map((tpl) => (
              <button
                type="button"
                key={tpl.name}
                onClick={() => handleApplyTemplate(tpl)}
                className="p-2 text-left bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/60 rounded-lg transition-all group"
              >
                <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                  {tpl.name}
                </p>
                <p className="text-[10px] font-mono text-slate-400 tabular-nums">
                  ${(tpl.budget / 1000).toFixed(0)}k · {tpl.targetGuests} guests
                </p>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Executive Summit 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="corporate">Corporate Conference / Summit</option>
                <option value="gala">Philanthropy Gala & Auction</option>
                <option value="wedding">Bespoke Wedding Celebration</option>
                <option value="conference">Executive Retreat</option>
                <option value="private">Private Celebration</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Event Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
              </input>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Venue Name</label>
              <input
                type="text"
                required
                placeholder="e.g. The Grand Rotunda Center"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Street Address / City</label>
              <input
                type="text"
                placeholder="e.g. 747 Howard St, San Francisco, CA"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Total Budget Cap ($)</label>
              <input
                type="number"
                required
                step="any"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Target Attendee Headcount</label>
              <input
                type="number"
                required
                value={guestCountTarget}
                onChange={(e) => setGuestCountTarget(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Description & Scope</label>
            <textarea
              rows={2}
              placeholder="High-level vision, key milestones, primary stakeholders..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30"
            >
              Initialize Event Center
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
