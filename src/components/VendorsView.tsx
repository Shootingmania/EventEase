import React, { useState, useMemo } from 'react';
import { useEventContext } from '../context/EventContext';
import { VendorItem, VendorStatus, BudgetCategory } from '../types/event';
import {
  Plus,
  Search,
  Mail,
  Phone,
  Globe,
  Briefcase,
  DollarSign,
  FileCheck,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
} from 'lucide-react';

const CATEGORIES: BudgetCategory[] = [
  'Venue & Rentals',
  'Catering & Beverage',
  'AV, Lighting & Staging',
  'Decor & Florals',
  'Entertainment & Talent',
  'Photography & Media',
  'Marketing & Collateral',
  'Operations & Permits',
];

export const VendorsView: React.FC = () => {
  const { vendors, addVendor, updateVendor, deleteVendor } = useEventContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);

  // Form State
  const [formCompany, setFormCompany] = useState('');
  const [formCategory, setFormCategory] = useState<BudgetCategory>('Venue & Rentals');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formContractAmount, setFormContractAmount] = useState('');
  const [formDepositPaid, setFormDepositPaid] = useState('');
  const [formStatus, setFormStatus] = useState<VendorStatus>('negotiation');
  const [formWebsite, setFormWebsite] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const totalContractValue = vendors.reduce((acc, v) => acc + v.contractAmount, 0);
  const totalDeposits = vendors.reduce((acc, v) => acc + v.depositPaid, 0);
  const outstandingCommitment = totalContractValue - totalDeposits;
  const signedCount = vendors.filter((v) => v.status === 'contract_signed' || v.status === 'completed').length;

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchCat = categoryFilter === 'all' || v.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchSearch =
        searchQuery === '' ||
        v.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.notes.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    });
  }, [vendors, categoryFilter, statusFilter, searchQuery]);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormCompany('');
    setFormCategory('Venue & Rentals');
    setFormContact('');
    setFormEmail('');
    setFormPhone('');
    setFormContractAmount('');
    setFormDepositPaid('');
    setFormStatus('negotiation');
    setFormWebsite('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: VendorItem) => {
    setEditingVendor(v);
    setFormCompany(v.companyName);
    setFormCategory(v.category);
    setFormContact(v.contactName);
    setFormEmail(v.email);
    setFormPhone(v.phone);
    setFormContractAmount(v.contractAmount.toString());
    setFormDepositPaid(v.depositPaid.toString());
    setFormStatus(v.status);
    setFormWebsite(v.website || '');
    setFormNotes(v.notes);
    setIsModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim()) return;

    const contract = parseFloat(formContractAmount) || 0;
    const deposit = parseFloat(formDepositPaid) || 0;

    if (editingVendor) {
      updateVendor(editingVendor.id, {
        companyName: formCompany.trim(),
        category: formCategory,
        contactName: formContact.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        contractAmount: contract,
        depositPaid: deposit,
        status: formStatus,
        website: formWebsite.trim() || undefined,
        notes: formNotes.trim(),
      });
    } else {
      addVendor({
        companyName: formCompany.trim(),
        category: formCategory,
        contactName: formContact.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        contractAmount: contract,
        depositPaid: deposit,
        status: formStatus,
        website: formWebsite.trim() || undefined,
        notes: formNotes.trim(),
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Vendor Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Vendors</span>
          <p className="text-xl md:text-2xl font-bold font-mono text-white tabular-nums">
            {vendors.length}
          </p>
          <p className="text-[11px] text-slate-400 font-mono tabular-nums">
            {signedCount} contracts signed
          </p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Contracted Value</span>
          <p className="text-xl md:text-2xl font-bold font-mono text-white tabular-nums">
            ${totalContractValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">Total contractual commitment</p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Deposits Paid</span>
          <p className="text-xl md:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            ${totalDeposits.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">Cleared through escrow</p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Pending Balance</span>
          <p className="text-xl md:text-2xl font-bold font-mono text-amber-400 tabular-nums">
            ${outstandingCommitment.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">Due upon completion</p>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vendors or contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="contract_signed">Contract Signed</option>
            <option value="negotiation">In Negotiation</option>
            <option value="inquiry">Inquiry</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30 whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-xl">
            No vendors match the specified criteria.
          </div>
        ) : (
          filteredVendors.map((vendor) => {
            const isSigned = vendor.status === 'contract_signed' || vendor.status === 'completed';
            const isNeg = vendor.status === 'negotiation';
            const balanceDue = vendor.contractAmount - vendor.depositPaid;

            return (
              <div
                key={vendor.id}
                className="p-5 bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-xl space-y-4 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-medium text-indigo-400">{vendor.category}</span>
                      <h3 className="text-base font-bold text-white leading-snug mt-0.5">
                        {vendor.companyName}
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono rounded border uppercase whitespace-nowrap ${
                        isSigned
                          ? 'border-emerald-800/80 text-emerald-400 bg-emerald-950/40'
                          : isNeg
                          ? 'border-amber-800/80 text-amber-400 bg-amber-950/40'
                          : 'border-slate-700 text-slate-400 bg-slate-800/40'
                      }`}
                    >
                      {vendor.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2 text-slate-200 font-medium">
                      <span>{vendor.contactName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <a href={`mailto:${vendor.email}`} className="hover:text-indigo-400 transition-colors truncate">
                        {vendor.email}
                      </a>
                    </div>
                    {vendor.phone && (
                      <div className="flex items-center gap-2 text-slate-400 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <a href={`tel:${vendor.phone}`} className="hover:text-indigo-400 transition-colors">
                          {vendor.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {vendor.notes && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 pt-1 border-t border-slate-800/70">
                      {vendor.notes}
                    </p>
                  )}
                </div>

                {/* Financial Milestone Footer */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Agreed Contract</span>
                    <span className="font-mono font-bold text-slate-200 tabular-nums">
                      ${vendor.contractAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Deposit Paid</span>
                    <span className="font-mono text-emerald-400 tabular-nums">
                      ${vendor.depositPaid.toLocaleString()}
                    </span>
                  </div>
                  {balanceDue > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Balance Due</span>
                      <span className="font-mono text-amber-400 tabular-nums">
                        ${balanceDue.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleOpenEdit(vendor)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors"
                      title="Edit Vendor"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteVendor(vendor.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Vendor"
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

      {/* Add / Edit Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">
                {editingVendor ? 'Edit Vendor Record' : 'Register New Vendor'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ESC
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex AudioVisual"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Service Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as BudgetCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Primary Contact</label>
                  <input
                    type="text"
                    required
                    placeholder="Marcus Sterling"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@vendor.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (415) 000-0000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Contract Value ($)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formContractAmount}
                    onChange={(e) => setFormContractAmount(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Deposit Paid ($)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formDepositPaid}
                    onChange={(e) => setFormDepositPaid(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Contract Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as VendorStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="inquiry">Inquiry</option>
                    <option value="negotiation">In Negotiation</option>
                    <option value="contract_signed">Contract Signed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Website URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formWebsite}
                  onChange={(e) => setFormWebsite(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Deliverables & Scope Notes</label>
                <textarea
                  rows={2}
                  placeholder="Specific requirements, gear list, load-in timing..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
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
                  {editingVendor ? 'Save Changes' : 'Register Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
