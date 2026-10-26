import React, { useState, useMemo } from 'react';
import { useEventContext } from '../context/EventContext';
import { GuestItem, TableItem, RSVPStatus, TableShape } from '../types/event';
import {
  Users,
  UserPlus,
  Plus,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Utensils,
  Trash2,
  Edit2,
  Maximize2,
  LayoutGrid,
  List,
} from 'lucide-react';

const COMMON_DIETARY = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Nut Allergy',
  'Dairy-Free',
  'Halal',
  'Kosher',
  'Pescatarian',
];

export const GuestsView: React.FC = () => {
  const {
    guests,
    tables,
    addGuest,
    updateGuest,
    deleteGuest,
    assignGuestToTable,
    addTable,
    updateTable,
    deleteTable,
    exportGuestCSV,
  } = useEventContext();

  const [activeTab, setActiveTab] = useState<'seating' | 'roster'>('seating');
  const [searchQuery, setSearchQuery] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<string>('all');
  const [vipOnlyFilter, setVipOnlyFilter] = useState(false);

  // Modals
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);

  // Guest Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPartySize, setFormPartySize] = useState('1');
  const [formRsvp, setFormRsvp] = useState<RSVPStatus>('attending');
  const [formTableId, setFormTableId] = useState<string>('');
  const [formDietary, setFormDietary] = useState<string[]>([]);
  const [formIsVip, setFormIsVip] = useState(false);
  const [formNotes, setFormNotes] = useState('');

  // Table Form State
  const [formTableName, setFormTableName] = useState('');
  const [formTableCap, setFormTableCap] = useState('8');
  const [formTableShape, setFormTableShape] = useState<TableShape>('round');
  const [formTableNotes, setFormTableNotes] = useState('');

  // Selected table for quick assigning in seating view
  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || '');

  // Dietary Statistics
  const dietaryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    guests
      .filter((g) => g.rsvpStatus === 'attending')
      .forEach((g) => {
        g.dietaryRequirements.forEach((d) => {
          counts[d] = (counts[d] || 0) + g.partySize;
        });
      });
    return counts;
  }, [guests]);

  const attendingCount = guests.filter((g) => g.rsvpStatus === 'attending').reduce((acc, g) => acc + g.partySize, 0);
  const pendingCount = guests.filter((g) => g.rsvpStatus === 'pending').reduce((acc, g) => acc + g.partySize, 0);
  const declinedCount = guests.filter((g) => g.rsvpStatus === 'declined').reduce((acc, g) => acc + g.partySize, 0);

  // Unseated attending guests
  const unseatedGuests = useMemo(() => {
    return guests.filter((g) => g.rsvpStatus === 'attending' && !g.tableId);
  }, [guests]);

  // Filtered roster guests
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchRsvp = rsvpFilter === 'all' || g.rsvpStatus === rsvpFilter;
      const matchVip = !vipOnlyFilter || g.isVip;
      const matchSearch =
        searchQuery === '' ||
        g.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.dietaryRequirements.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchRsvp && matchVip && matchSearch;
    });
  }, [guests, rsvpFilter, vipOnlyFilter, searchQuery]);

  const handleOpenAddGuest = () => {
    setEditingGuest(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPartySize('1');
    setFormRsvp('attending');
    setFormTableId('');
    setFormDietary([]);
    setFormIsVip(false);
    setFormNotes('');
    setIsGuestModalOpen(true);
  };

  const handleOpenEditGuest = (g: GuestItem) => {
    setEditingGuest(g);
    setFormName(g.fullName);
    setFormEmail(g.email);
    setFormPhone(g.phone || '');
    setFormPartySize(g.partySize.toString());
    setFormRsvp(g.rsvpStatus);
    setFormTableId(g.tableId || '');
    setFormDietary(g.dietaryRequirements);
    setFormIsVip(g.isVip);
    setFormNotes(g.notes || '');
    setIsGuestModalOpen(true);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const party = parseInt(formPartySize) || 1;
    const table = formTableId ? formTableId : null;

    if (editingGuest) {
      updateGuest(editingGuest.id, {
        fullName: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        partySize: party,
        rsvpStatus: formRsvp,
        tableId: table,
        dietaryRequirements: formDietary,
        isVip: formIsVip,
        notes: formNotes.trim() || undefined,
      });
    } else {
      addGuest({
        fullName: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        partySize: party,
        rsvpStatus: formRsvp,
        tableId: table,
        dietaryRequirements: formDietary,
        isVip: formIsVip,
        notes: formNotes.trim() || undefined,
      });
    }

    setIsGuestModalOpen(false);
  };

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTableName.trim()) return;
    const cap = parseInt(formTableCap) || 8;

    addTable({
      name: formTableName.trim(),
      capacity: cap,
      shape: formTableShape,
      notes: formTableNotes.trim() || undefined,
    });

    setIsTableModalOpen(false);
    setFormTableName('');
    setFormTableCap('8');
  };

  const toggleDietaryCheckbox = (item: string) => {
    setFormDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Attendee & Dietary Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Attending Headcount</span>
          <p className="text-xl md:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {attendingCount}
          </p>
          <p className="text-[11px] text-slate-400">
            {guests.filter((g) => g.rsvpStatus === 'attending').length} guest reservations
          </p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Pending Responses</span>
          <p className="text-xl md:text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {pendingCount}
          </p>
          <p className="text-[11px] text-slate-400">Awaiting RSVP reply</p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Seated at Tables</span>
          <p className="text-xl md:text-2xl font-bold font-mono text-indigo-400 tabular-nums">
            {guests.filter((g) => g.tableId !== null && g.rsvpStatus === 'attending').length}
          </p>
          <p className="text-[11px] text-slate-400 font-mono tabular-nums">
            {unseatedGuests.length} unassigned attendees
          </p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Dietary Requirements</span>
          <p className="text-xl md:text-2xl font-bold font-mono text-white tabular-nums">
            {Object.values(dietaryCounts).reduce((a, b) => a + b, 0)}
          </p>
          <p className="text-[11px] text-slate-400">Special kitchen prep flagged</p>
        </div>
      </div>

      {/* Dietary Alert Strip */}
      {Object.keys(dietaryCounts).length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/40 border border-slate-800 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300 mr-2">
            <Utensils className="w-3.5 h-3.5 text-indigo-400" />
            <span>Catering Allergen Breakdown:</span>
          </div>
          {Object.entries(dietaryCounts).map(([diet, count]) => (
            <span
              key={diet}
              className="px-2 py-0.5 bg-slate-800 border border-slate-700/80 rounded text-[11px] text-slate-200 font-mono tabular-nums"
            >
              {diet}: <strong className="text-white">{count}</strong>
            </span>
          ))}
        </div>
      )}

      {/* Control Bar: View Switcher (Seating vs Roster) & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab('seating')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'seating'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Floor Seating Canvas</span>
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'roster'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Attendee Directory</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'seating' && (
            <button
              onClick={() => setIsTableModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-slate-400" />
              <span>Add Table</span>
            </button>
          )}

          <button
            onClick={exportGuestCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAddGuest}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Interactive Floor Seating Canvas */}
      {activeTab === 'seating' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Table Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Ballroom & Dining Tables ({tables.length})</h3>
                <p className="text-xs text-slate-400">Click a seat or drag attendees into designated table capacity</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tables.map((table) => {
                const seatedGuests = guests.filter((g) => g.tableId === table.id);
                const isFull = seatedGuests.length >= table.capacity;
                const isSelected = selectedTableId === table.id;

                return (
                  <div
                    key={table.id}
                    onClick={() => setSelectedTableId(table.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 ${
                              table.shape === 'round' ? 'rounded-full' : 'rounded-xs'
                            } border border-indigo-400 bg-indigo-500/20`}
                          />
                          <h4 className="text-xs font-bold text-white truncate max-w-[180px]">
                            {table.name}
                          </h4>
                        </div>
                        <span
                          className={`text-xs font-mono font-semibold tabular-nums px-2 py-0.5 rounded ${
                            isFull
                              ? 'text-rose-400 bg-rose-950/40 border border-rose-800/80'
                              : 'text-indigo-300 bg-indigo-950/40 border border-indigo-800/60'
                          }`}
                        >
                          {seatedGuests.length} / {table.capacity}
                        </span>
                      </div>

                      {table.notes && (
                        <p className="text-[11px] text-slate-400 italic truncate">{table.notes}</p>
                      )}

                      {/* Seated Guests List */}
                      <div className="space-y-1.5 pt-1">
                        {seatedGuests.length === 0 ? (
                          <p className="text-[11px] text-slate-400 py-3 text-center border border-dashed border-slate-800 rounded-lg">
                            Table empty. Select an unseated guest to place here.
                          </p>
                        ) : (
                          seatedGuests.map((sg) => (
                            <div
                              key={sg.id}
                              className="flex items-center justify-between p-1.5 bg-slate-950/70 border border-slate-800/70 rounded-md text-xs group"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {sg.isVip && (
                                  <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/60 px-1 rounded border border-amber-800/80">
                                    VIP
                                  </span>
                                )}
                                <span className="text-slate-200 font-medium truncate">{sg.fullName}</span>
                                {sg.dietaryRequirements.length > 0 && (
                                  <span className="text-[10px] text-slate-400 truncate">
                                    ({sg.dietaryRequirements[0]})
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  assignGuestToTable(sg.id, null);
                                }}
                                title="Unseat attendee"
                                className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors opacity-70 group-hover:opacity-100"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <span>Shape: {table.shape}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTable(table.id);
                        }}
                        className="text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        Remove Table
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (1 Col): Unseated Guests Drawer */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white">Unassigned Attendees</h3>
                <p className="text-xs text-slate-400 font-mono tabular-nums">
                  {unseatedGuests.length} confirmed guests waiting for a seat
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {unseatedGuests.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-lg">
                  All attending guests are currently seated!
                </div>
              ) : (
                unseatedGuests.map((ug) => (
                  <div
                    key={ug.id}
                    className="p-2.5 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-lg text-xs space-y-2 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        {ug.isVip && (
                          <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/60 px-1 rounded border border-amber-800/80">
                            VIP
                          </span>
                        )}
                        <span className="font-semibold text-white truncate">{ug.fullName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                        Party of {ug.partySize}
                      </span>
                    </div>

                    {ug.dietaryRequirements.length > 0 && (
                      <p className="text-[10px] text-indigo-300 truncate">
                        Diet: {ug.dietaryRequirements.join(', ')}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                      <select
                        onChange={(e) => {
                          if (e.target.value) assignGuestToTable(ug.id, e.target.value);
                        }}
                        defaultValue=""
                        className="flex-1 px-2 py-1 text-[11px] bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="" disabled>
                          Assign to table...
                        </option>
                        {tables.map((t) => {
                          const currentSeated = guests.filter((g) => g.tableId === t.id).length;
                          return (
                            <option
                              key={t.id}
                              value={t.id}
                              disabled={currentSeated >= t.capacity}
                            >
                              {t.name} ({currentSeated}/{t.capacity})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Attendee Directory Roster */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          {/* Search & Filter Strip */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search guests by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <select
                value={rsvpFilter}
                onChange={(e) => setRsvpFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All RSVPs ({guests.length})</option>
                <option value="attending">Attending</option>
                <option value="pending">Pending</option>
                <option value="declined">Declined</option>
              </select>

              <button
                onClick={() => setVipOnlyFilter(!vipOnlyFilter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  vipOnlyFilter
                    ? 'border-amber-500/60 bg-amber-950/40 text-amber-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                VIPs Only
              </button>
            </div>
          </div>

          {/* Guest Directory Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Attendee Name</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-center">RSVP Status</th>
                    <th className="py-3 px-4 text-center">Party Size</th>
                    <th className="py-3 px-4">Table Assignment</th>
                    <th className="py-3 px-4">Dietary Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No attendees match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((g) => {
                      const table = tables.find((t) => t.id === g.tableId);
                      const isAttending = g.rsvpStatus === 'attending';
                      const isPending = g.rsvpStatus === 'pending';

                      return (
                        <tr
                          key={g.id}
                          className="hover:bg-slate-800/30 transition-colors group"
                        >
                          <td className="py-3 px-4 text-white font-medium">
                            <div className="flex items-center gap-1.5">
                              {g.isVip && (
                                <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/60 px-1 rounded border border-amber-800/80">
                                  VIP
                                </span>
                              )}
                              <span>{g.fullName}</span>
                            </div>
                            {g.notes && <p className="text-[11px] text-slate-400">{g.notes}</p>}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            <div>{g.email}</div>
                            {g.phone && <div className="text-[11px] text-slate-500">{g.phone}</div>}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-mono rounded border uppercase ${
                                isAttending
                                  ? 'border-emerald-800/80 text-emerald-400 bg-emerald-950/40'
                                  : isPending
                                  ? 'border-amber-800/80 text-amber-400 bg-amber-950/40'
                                  : 'border-slate-700 text-slate-500 bg-slate-800/40'
                              }`}
                            >
                              {g.rsvpStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-300">
                            {g.partySize}
                          </td>
                          <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                            {table ? (
                              <span className="text-indigo-400 font-medium">{table.name}</span>
                            ) : isAttending ? (
                              <span className="text-amber-400 italic">Unassigned</span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {g.dietaryRequirements.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {g.dietaryRequirements.map((d) => (
                                  <span
                                    key={d}
                                    className="px-1.5 py-0.5 bg-slate-800 text-[10px] text-slate-300 rounded"
                                  >
                                    {d}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-600">Standard</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditGuest(g)}
                                className="p-1 text-slate-400 hover:text-indigo-400 transition-colors"
                                title="Edit Guest"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteGuest(g.id)}
                                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                                title="Delete Guest"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Guest Modal */}
      {isGuestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">
                {editingGuest ? 'Edit Attendee' : 'Register New Attendee'}
              </h2>
              <button
                onClick={() => setIsGuestModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ESC
              </button>
            </div>

            <form onSubmit={handleSaveGuest} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Aris Thorne"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="attendee@domain.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">RSVP Status</label>
                  <select
                    value={formRsvp}
                    onChange={(e) => setFormRsvp(e.target.value as RSVPStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="attending">Attending</option>
                    <option value="pending">Pending</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Party Size</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formPartySize}
                    onChange={(e) => setFormPartySize(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Table Assignment</label>
                  <select
                    value={formTableId}
                    onChange={(e) => setFormTableId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (Cap {t.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-medium">Dietary Requirements & Allergies</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COMMON_DIETARY.map((diet) => {
                    const checked = formDietary.includes(diet);
                    return (
                      <button
                        type="button"
                        key={diet}
                        onClick={() => toggleDietaryCheckbox(diet)}
                        className={`p-1.5 text-[11px] rounded border text-left transition-colors ${
                          checked
                            ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {diet}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="vip-toggle"
                  checked={formIsVip}
                  onChange={(e) => setFormIsVip(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="vip-toggle" className="text-slate-300 font-medium cursor-pointer">
                  Flag as VIP / Keynote Guest
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Notes & Special Requirements</label>
                <textarea
                  rows={2}
                  placeholder="Seating preferences, speaker bio notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGuestModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30"
                >
                  {editingGuest ? 'Save Changes' : 'Register Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Add New Dining / Ballroom Table</h2>
              <button
                onClick={() => setIsTableModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ESC
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Table Identifier / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table 5 - Founders & Partners"
                  value={formTableName}
                  onChange={(e) => setFormTableName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Seating Capacity</label>
                  <input
                    type="number"
                    min="2"
                    max="24"
                    required
                    value={formTableCap}
                    onChange={(e) => setFormTableCap(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Table Shape</label>
                  <select
                    value={formTableShape}
                    onChange={(e) => setFormTableShape(e.target.value as TableShape)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="round">Round Banquet Table</option>
                    <option value="rectangular">Rectangular Conference</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Notes & Stage Proximity</label>
                <input
                  type="text"
                  placeholder="e.g. Front row near Stage A"
                  value={formTableNotes}
                  onChange={(e) => setFormTableNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
