import React, { useState, useMemo } from 'react';
import { useEventContext } from '../context/EventContext';
import { BudgetItem, BudgetCategory, PaymentStatus } from '../types/event';
import {
  Plus,
  Download,
  Filter,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Edit2,
  DollarSign,
  TrendingDown,
  TrendingUp,
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

export const BudgetView: React.FC = () => {
  const {
    activeEvent,
    budgetItems,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    exportBudgetCSV,
  } = useEventContext();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Form state
  const [formCategory, setFormCategory] = useState<BudgetCategory>('Venue & Rentals');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formEstimated, setFormEstimated] = useState<string>('');
  const [formActual, setFormActual] = useState<string>('');
  const [formPaid, setFormPaid] = useState<string>('');
  const [formDueDate, setFormDueDate] = useState<string>('');
  const [formStatus, setFormStatus] = useState<PaymentStatus>('pending');
  const [formNotes, setFormNotes] = useState<string>('');

  const totalBudget = activeEvent?.totalBudget || 0;
  const totalEstimated = budgetItems.reduce((acc, b) => acc + b.estimatedAmount, 0);
  const totalActual = budgetItems.reduce((acc, b) => acc + (b.actualAmount || b.estimatedAmount), 0);
  const totalPaid = budgetItems.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalRemaining = totalBudget - totalActual;
  const balanceToPay = totalActual - totalPaid;

  const filteredItems = useMemo(() => {
    return budgetItems.filter((item) => {
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchSearch =
        searchQuery === '' ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchStatus && matchSearch;
    });
  }, [budgetItems, categoryFilter, statusFilter, searchQuery]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormCategory('Venue & Rentals');
    setFormDescription('');
    setFormEstimated('');
    setFormActual('');
    setFormPaid('');
    setFormDueDate(new Date().toISOString().split('T')[0]);
    setFormStatus('pending');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormDescription(item.description);
    setFormEstimated(item.estimatedAmount.toString());
    setFormActual(item.actualAmount.toString());
    setFormPaid(item.paidAmount.toString());
    setFormDueDate(item.dueDate);
    setFormStatus(item.status);
    setFormNotes(item.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim()) return;

    const est = parseFloat(formEstimated) || 0;
    const act = parseFloat(formActual) || est;
    const paid = parseFloat(formPaid) || 0;

    let computedStatus = formStatus;
    if (paid >= act && act > 0) {
      computedStatus = 'paid';
    } else if (paid > 0) {
      computedStatus = 'partially_paid';
    }

    if (editingItem) {
      updateBudgetItem(editingItem.id, {
        category: formCategory,
        description: formDescription.trim(),
        estimatedAmount: est,
        actualAmount: act,
        paidAmount: paid,
        dueDate: formDueDate,
        status: computedStatus,
        notes: formNotes.trim(),
      });
    } else {
      addBudgetItem({
        category: formCategory,
        description: formDescription.trim(),
        estimatedAmount: est,
        actualAmount: act,
        paidAmount: paid,
        dueDate: formDueDate,
        status: computedStatus,
        notes: formNotes.trim(),
      });
    }

    setIsAddModalOpen(false);
  };

  const handleMarkPaid = (item: BudgetItem) => {
    const act = item.actualAmount || item.estimatedAmount;
    updateBudgetItem(item.id, {
      paidAmount: act,
      status: 'paid',
    });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Financial Health Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Budget Target</span>
          <p className="text-xl md:text-2xl font-bold font-mono text-white tabular-nums">
            ${totalBudget.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">Allocated limit</p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Committed / Actual</span>
          <p className="text-xl md:text-2xl font-bold font-mono text-white tabular-nums">
            ${totalActual.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-mono tabular-nums text-slate-400">
            {totalActual > totalEstimated ? (
              <span className="text-rose-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +${(totalActual - totalEstimated).toLocaleString()} vs est
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center">
                <TrendingDown className="w-3 h-3 mr-0.5" /> -${(totalEstimated - totalActual).toLocaleString()} savings
              </span>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Disbursed (Paid)</span>
          <p className="text-xl md:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            ${totalPaid.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 font-mono tabular-nums">
            Pending balance: ${balanceToPay.toLocaleString()}
          </p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Remaining Buffer</span>
          <p className={`text-xl md:text-2xl font-bold font-mono tabular-nums ${totalRemaining < 0 ? 'text-rose-400' : 'text-slate-200'}`}>
            ${totalRemaining.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">
            {totalRemaining < 0 ? 'Exceeds budget cap' : 'Available for contingency'}
          </p>
        </div>
      </div>

      {/* Control Bar: Filters, Search & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Categories ({budgetItems.length})</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportBudgetCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* High-Density Financial Ledger Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Estimated</th>
                <th className="py-3 px-4 text-right">Actual</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Due Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No budget items match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isPaid = item.status === 'paid';
                  const isPartial = item.status === 'partially_paid';
                  const isOverdue = item.status === 'overdue';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="py-3 px-4 text-slate-300 font-medium whitespace-nowrap">
                        {item.category}
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        <div className="font-medium text-white">{item.description}</div>
                        {item.notes && <p className="text-[11px] text-slate-400 truncate max-w-xs">{item.notes}</p>}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                        ${item.estimatedAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-100">
                        ${(item.actualAmount || item.estimatedAmount).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400">
                        ${item.paidAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400 whitespace-nowrap">
                        {item.dueDate}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-mono rounded border ${
                            isPaid
                              ? 'border-emerald-800/80 text-emerald-400 bg-emerald-950/40'
                              : isPartial
                              ? 'border-amber-800/80 text-amber-400 bg-amber-950/40'
                              : isOverdue
                              ? 'border-rose-800/80 text-rose-400 bg-rose-950/40'
                              : 'border-slate-700 text-slate-400 bg-slate-800/40'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPaid && (
                            <button
                              onClick={() => handleMarkPaid(item)}
                              title="Mark Full Balance as Paid"
                              className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Expense"
                            className="p-1 text-slate-400 hover:text-indigo-400 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteBudgetItem(item.id)}
                            title="Delete Expense"
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
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

      {/* Add / Edit Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">
                {editingItem ? 'Edit Budget Item' : 'Add New Expense Item'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ESC
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Category</label>
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

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description / Deliverable</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4K LED Screen Rig & Sound Tech"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Estimated ($)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formEstimated}
                    onChange={(e) => setFormEstimated(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Actual / Agreed ($)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formActual}
                    onChange={(e) => setFormActual(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Paid So Far ($)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formPaid}
                    onChange={(e) => setFormPaid(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Payment Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Notes & Terms</label>
                <textarea
                  rows={2}
                  placeholder="Terms, cancellation clause, vendor contact notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
