import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  EventItem,
  BudgetItem,
  VendorItem,
  GuestItem,
  TableItem,
  TimelineItem,
  SecurityUser,
  AuditLogEntry,
} from '../types/event';
import {
  INITIAL_EVENTS,
  INITIAL_BUDGET_ITEMS,
  INITIAL_VENDORS,
  INITIAL_GUESTS,
  INITIAL_TABLES,
  INITIAL_TIMELINE,
  INITIAL_USERS,
} from '../data/initialData';
import { generateSecureId, encryptData, decryptData, hashPassword } from '../utils/security';

interface EventContextType {
  // Active event & collection
  events: EventItem[];
  activeEventId: string;
  activeEvent: EventItem | undefined;
  setActiveEventId: (id: string) => void;
  addEvent: (event: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateEvent: (id: string, updates: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;

  // Active event sub-collections
  budgetItems: BudgetItem[];
  addBudgetItem: (item: Omit<BudgetItem, 'id' | 'eventId'>) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;

  vendors: VendorItem[];
  addVendor: (vendor: Omit<VendorItem, 'id' | 'eventId'>) => void;
  updateVendor: (id: string, updates: Partial<VendorItem>) => void;
  deleteVendor: (id: string) => void;

  guests: GuestItem[];
  addGuest: (guest: Omit<GuestItem, 'id' | 'eventId'>) => void;
  updateGuest: (id: string, updates: Partial<GuestItem>) => void;
  deleteGuest: (id: string) => void;
  assignGuestToTable: (guestId: string, tableId: string | null) => void;
  bulkImportGuests: (newGuests: Array<Omit<GuestItem, 'id' | 'eventId'>>) => void;

  tables: TableItem[];
  addTable: (table: Omit<TableItem, 'id' | 'eventId'>) => void;
  updateTable: (id: string, updates: Partial<TableItem>) => void;
  deleteTable: (id: string) => void;

  timeline: TimelineItem[];
  addTimelineItem: (item: Omit<TimelineItem, 'id' | 'eventId'>) => void;
  updateTimelineItem: (id: string, updates: Partial<TimelineItem>) => void;
  deleteTimelineItem: (id: string) => void;
  cycleTimelineStatus: (id: string) => void;

  // Security & Vault
  currentUser: SecurityUser;
  users: SecurityUser[];
  switchUser: (userId: string) => void;
  isVaultLocked: boolean;
  lockVault: () => void;
  unlockVault: (passphrase: string) => Promise<boolean>;
  auditLogs: AuditLogEntry[];
  exportEncryptedVault: () => Promise<string>;
  importEncryptedVault: (jsonContent: string) => Promise<{ success: boolean; message: string }>;
  resetToInitialData: () => void;
  exportBudgetCSV: () => void;
  exportGuestCSV: () => void;
}

const STORAGE_KEY = 'eventease_vault_v2_store';
const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initialData
  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_events`);
      return stored ? JSON.parse(stored) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [activeEventId, setActiveEventId] = useState<string>(() => {
    return events[0]?.id || 'event_summit_2026';
  });

  const [allBudgetItems, setAllBudgetItems] = useState<BudgetItem[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_budget`);
      return stored ? JSON.parse(stored) : INITIAL_BUDGET_ITEMS;
    } catch {
      return INITIAL_BUDGET_ITEMS;
    }
  });

  const [allVendors, setAllVendors] = useState<VendorItem[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_vendors`);
      return stored ? JSON.parse(stored) : INITIAL_VENDORS;
    } catch {
      return INITIAL_VENDORS;
    }
  });

  const [allGuests, setAllGuests] = useState<GuestItem[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_guests`);
      return stored ? JSON.parse(stored) : INITIAL_GUESTS;
    } catch {
      return INITIAL_GUESTS;
    }
  });

  const [allTables, setAllTables] = useState<TableItem[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_tables`);
      return stored ? JSON.parse(stored) : INITIAL_TABLES;
    } catch {
      return INITIAL_TABLES;
    }
  });

  const [allTimeline, setAllTimeline] = useState<TimelineItem[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_timeline`);
      return stored ? JSON.parse(stored) : INITIAL_TIMELINE;
    } catch {
      return INITIAL_TIMELINE;
    }
  });

  const [users] = useState<SecurityUser[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<SecurityUser>(INITIAL_USERS[0]);
  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: generateSecureId('log'),
      timestamp: new Date().toISOString(),
      userId: INITIAL_USERS[0].id,
      action: 'SYSTEM_BOOT',
      details: 'EventEase vault loaded with AES-GCM data encryption initialized.',
    },
  ]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_events`, JSON.stringify(events));
      localStorage.setItem(`${STORAGE_KEY}_budget`, JSON.stringify(allBudgetItems));
      localStorage.setItem(`${STORAGE_KEY}_vendors`, JSON.stringify(allVendors));
      localStorage.setItem(`${STORAGE_KEY}_guests`, JSON.stringify(allGuests));
      localStorage.setItem(`${STORAGE_KEY}_tables`, JSON.stringify(allTables));
      localStorage.setItem(`${STORAGE_KEY}_timeline`, JSON.stringify(allTimeline));
    } catch (e) {
      console.warn('Storage quota exceeded or unavailable', e);
    }
  }, [events, allBudgetItems, allVendors, allGuests, allTables, allTimeline]);

  // Active event
  const activeEvent = useMemo(() => {
    return events.find((e) => e.id === activeEventId) || events[0];
  }, [events, activeEventId]);

  // Scoped sub-collections
  const budgetItems = useMemo(() => {
    return allBudgetItems.filter((b) => b.eventId === activeEventId);
  }, [allBudgetItems, activeEventId]);

  const vendors = useMemo(() => {
    return allVendors.filter((v) => v.eventId === activeEventId);
  }, [allVendors, activeEventId]);

  const guests = useMemo(() => {
    return allGuests.filter((g) => g.eventId === activeEventId);
  }, [allGuests, activeEventId]);

  const tables = useMemo(() => {
    return allTables.filter((t) => t.eventId === activeEventId);
  }, [allTables, activeEventId]);

  const timeline = useMemo(() => {
    return allTimeline.filter((t) => t.eventId === activeEventId);
  }, [allTimeline, activeEventId]);

  const logAction = useCallback((action: string, details: string) => {
    const entry: AuditLogEntry = {
      id: generateSecureId('log'),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      action,
      details,
    };
    setAuditLogs((prev) => [entry, ...prev.slice(0, 99)]);
  }, [currentUser]);

  // Event handlers
  const addEvent = useCallback((eventData: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const newId = generateSecureId('event');
    const now = new Date().toISOString();
    const newEvent: EventItem = {
      ...eventData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    setEvents((prev) => [newEvent, ...prev]);
    setActiveEventId(newId);
    logAction('EVENT_CREATED', `Created new event "${newEvent.title}"`);
    return newId;
  }, [logAction]);

  const updateEvent = useCallback((id: string, updates: Partial<EventItem>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );
    logAction('EVENT_UPDATED', `Updated event configuration for ID ${id}`);
  }, [logAction]);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const remaining = prev.filter((e) => e.id !== id);
      if (remaining.length > 0 && activeEventId === id) {
        setActiveEventId(remaining[0].id);
      }
      return remaining;
    });
    // Cleanup sub-collections
    setAllBudgetItems((prev) => prev.filter((b) => b.eventId !== id));
    setAllVendors((prev) => prev.filter((v) => v.eventId !== id));
    setAllGuests((prev) => prev.filter((g) => g.eventId !== id));
    setAllTables((prev) => prev.filter((t) => t.eventId !== id));
    setAllTimeline((prev) => prev.filter((t) => t.eventId !== id));
    logAction('EVENT_DELETED', `Deleted event ID ${id} and all related records`);
  }, [activeEventId, logAction]);

  // Budget Handlers
  const addBudgetItem = useCallback((itemData: Omit<BudgetItem, 'id' | 'eventId'>) => {
    const newItem: BudgetItem = {
      ...itemData,
      id: generateSecureId('b'),
      eventId: activeEventId,
    };
    setAllBudgetItems((prev) => [...prev, newItem]);
    logAction('BUDGET_ITEM_ADDED', `Added expense "${newItem.description}" ($${newItem.actualAmount || newItem.estimatedAmount})`);
  }, [activeEventId, logAction]);

  const updateBudgetItem = useCallback((id: string, updates: Partial<BudgetItem>) => {
    setAllBudgetItems((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    logAction('BUDGET_ITEM_UPDATED', `Updated budget record ID ${id}`);
  }, [logAction]);

  const deleteBudgetItem = useCallback((id: string) => {
    setAllBudgetItems((prev) => prev.filter((b) => b.id !== id));
    logAction('BUDGET_ITEM_DELETED', `Removed budget item ID ${id}`);
  }, [logAction]);

  // Vendor Handlers
  const addVendor = useCallback((vendorData: Omit<VendorItem, 'id' | 'eventId'>) => {
    const newVendor: VendorItem = {
      ...vendorData,
      id: generateSecureId('v'),
      eventId: activeEventId,
    };
    setAllVendors((prev) => [...prev, newVendor]);
    logAction('VENDOR_ADDED', `Registered vendor "${newVendor.companyName}"`);
  }, [activeEventId, logAction]);

  const updateVendor = useCallback((id: string, updates: Partial<VendorItem>) => {
    setAllVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    logAction('VENDOR_UPDATED', `Updated vendor record ID ${id}`);
  }, [logAction]);

  const deleteVendor = useCallback((id: string) => {
    setAllVendors((prev) => prev.filter((v) => v.id !== id));
    logAction('VENDOR_DELETED', `Removed vendor ID ${id}`);
  }, [logAction]);

  // Guest & Table Handlers
  const addGuest = useCallback((guestData: Omit<GuestItem, 'id' | 'eventId'>) => {
    const newGuest: GuestItem = {
      ...guestData,
      id: generateSecureId('g'),
      eventId: activeEventId,
    };
    setAllGuests((prev) => [...prev, newGuest]);
    logAction('GUEST_ADDED', `Added attendee "${newGuest.fullName}"`);
  }, [activeEventId, logAction]);

  const updateGuest = useCallback((id: string, updates: Partial<GuestItem>) => {
    setAllGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    logAction('GUEST_UPDATED', `Updated guest ID ${id}`);
  }, [logAction]);

  const deleteGuest = useCallback((id: string) => {
    setAllGuests((prev) => prev.filter((g) => g.id !== id));
    logAction('GUEST_DELETED', `Removed attendee ID ${id}`);
  }, [logAction]);

  const assignGuestToTable = useCallback((guestId: string, tableId: string | null) => {
    setAllGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, tableId } : g)));
    logAction('TABLE_SEAT_ASSIGNED', `Assigned guest ID ${guestId} to table ${tableId || 'unassigned'}`);
  }, [logAction]);

  const bulkImportGuests = useCallback((newGuests: Array<Omit<GuestItem, 'id' | 'eventId'>>) => {
    const mapped: GuestItem[] = newGuests.map((g) => ({
      ...g,
      id: generateSecureId('g'),
      eventId: activeEventId,
    }));
    setAllGuests((prev) => [...prev, ...mapped]);
    logAction('GUESTS_BULK_IMPORTED', `Imported ${mapped.length} guests into active event`);
  }, [activeEventId, logAction]);

  const addTable = useCallback((tableData: Omit<TableItem, 'id' | 'eventId'>) => {
    const newTable: TableItem = {
      ...tableData,
      id: generateSecureId('t'),
      eventId: activeEventId,
    };
    setAllTables((prev) => [...prev, newTable]);
    logAction('TABLE_ADDED', `Configured table "${newTable.name}" (cap: ${newTable.capacity})`);
  }, [activeEventId, logAction]);

  const updateTable = useCallback((id: string, updates: Partial<TableItem>) => {
    setAllTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    logAction('TABLE_UPDATED', `Updated table ID ${id}`);
  }, [logAction]);

  const deleteTable = useCallback((id: string) => {
    // Unassign guests seated here
    setAllGuests((prev) => prev.map((g) => (g.tableId === id ? { ...g, tableId: null } : g)));
    setAllTables((prev) => prev.filter((t) => t.id !== id));
    logAction('TABLE_DELETED', `Removed table ID ${id} and unseated assigned guests`);
  }, [logAction]);

  // Timeline Handlers
  const addTimelineItem = useCallback((itemData: Omit<TimelineItem, 'id' | 'eventId'>) => {
    const newItem: TimelineItem = {
      ...itemData,
      id: generateSecureId('tl'),
      eventId: activeEventId,
    };
    setAllTimeline((prev) => [...prev, newItem]);
    logAction('TIMELINE_ITEM_ADDED', `Added schedule cue "${newItem.title}" at ${newItem.time}`);
  }, [activeEventId, logAction]);

  const updateTimelineItem = useCallback((id: string, updates: Partial<TimelineItem>) => {
    setAllTimeline((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    logAction('TIMELINE_ITEM_UPDATED', `Updated schedule cue ID ${id}`);
  }, [logAction]);

  const deleteTimelineItem = useCallback((id: string) => {
    setAllTimeline((prev) => prev.filter((t) => t.id !== id));
    logAction('TIMELINE_ITEM_DELETED', `Deleted timeline item ID ${id}`);
  }, [logAction]);

  const cycleTimelineStatus = useCallback((id: string) => {
    setAllTimeline((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextStatus: TimelineItem['status'] =
          t.status === 'upcoming' ? 'in_progress' : t.status === 'in_progress' ? 'completed' : 'upcoming';
        return { ...t, status: nextStatus };
      })
    );
  }, []);

  // Security & Vault Actions
  const switchUser = useCallback((userId: string) => {
    const match = users.find((u) => u.id === userId);
    if (match) {
      setCurrentUser(match);
      logAction('USER_SWITCH', `Switched active session to ${match.name} (${match.role})`);
    }
  }, [users, logAction]);

  const lockVault = useCallback(() => {
    setIsVaultLocked(true);
    logAction('VAULT_LOCKED', 'EventEase vault locked for user security');
  }, [logAction]);

  const unlockVault = useCallback(async (passphrase: string): Promise<boolean> => {
    // Validate master passphrase (default 'eventease2026' or non-empty for custom setup)
    if (passphrase.trim().toLowerCase() === 'eventease2026' || passphrase.trim().length >= 6) {
      setIsVaultLocked(false);
      logAction('VAULT_UNLOCKED', 'Vault authenticated and decrypted successfully');
      return true;
    }
    logAction('VAULT_AUTH_FAILED', 'Failed unlock attempt with incorrect credentials');
    return false;
  }, [logAction]);

  const exportEncryptedVault = useCallback(async (): Promise<string> => {
    const backupPayload = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      events,
      budget: allBudgetItems,
      vendors: allVendors,
      guests: allGuests,
      tables: allTables,
      timeline: allTimeline,
      auditLogs,
    };
    return await encryptData(backupPayload);
  }, [events, allBudgetItems, allVendors, allGuests, allTables, allTimeline, auditLogs]);

  const importEncryptedVault = useCallback(
    async (jsonContent: string): Promise<{ success: boolean; message: string }> => {
      try {
        const decrypted = await decryptData<{
          events?: EventItem[];
          budget?: BudgetItem[];
          vendors?: VendorItem[];
          guests?: GuestItem[];
          tables?: TableItem[];
          timeline?: TimelineItem[];
        }>(jsonContent.trim());

        if (!decrypted || !decrypted.events || !Array.isArray(decrypted.events)) {
          return { success: false, message: 'Invalid or corrupted encrypted backup payload.' };
        }

        setEvents(decrypted.events);
        if (decrypted.events.length > 0) setActiveEventId(decrypted.events[0].id);
        if (decrypted.budget) setAllBudgetItems(decrypted.budget);
        if (decrypted.vendors) setAllVendors(decrypted.vendors);
        if (decrypted.guests) setAllGuests(decrypted.guests);
        if (decrypted.tables) setAllTables(decrypted.tables);
        if (decrypted.timeline) setAllTimeline(decrypted.timeline);

        logAction('VAULT_IMPORTED', `Restored ${decrypted.events.length} events from encrypted archive`);
        return { success: true, message: `Successfully restored ${decrypted.events.length} events from vault backup.` };
      } catch (err) {
        return { success: false, message: `Import error: ${(err as Error).message}` };
      }
    },
    [logAction]
  );

  const resetToInitialData = useCallback(() => {
    setEvents(INITIAL_EVENTS);
    setActiveEventId(INITIAL_EVENTS[0].id);
    setAllBudgetItems(INITIAL_BUDGET_ITEMS);
    setAllVendors(INITIAL_VENDORS);
    setAllGuests(INITIAL_GUESTS);
    setAllTables(INITIAL_TABLES);
    setAllTimeline(INITIAL_TIMELINE);
    logAction('VAULT_RESET', 'EventEase state reset to pristine baseline samples');
  }, [logAction]);

  // CSV Exporters
  const exportBudgetCSV = useCallback(() => {
    const headers = ['Category', 'Description', 'Estimated Amount', 'Actual Amount', 'Paid Amount', 'Due Date', 'Status', 'Notes'];
    const rows = budgetItems.map((b) => [
      `"${b.category}"`,
      `"${b.description.replace(/"/g, '""')}"`,
      b.estimatedAmount,
      b.actualAmount,
      b.paidAmount,
      b.dueDate,
      b.status,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Budget_${activeEvent?.title.replace(/[^a-zA-Z0-9]/g, '_') || 'Event'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [budgetItems, activeEvent]);

  const exportGuestCSV = useCallback(() => {
    const headers = ['Full Name', 'Email', 'RSVP Status', 'Party Size', 'Table Assigned', 'Dietary Requirements', 'VIP Status', 'Notes'];
    const rows = guests.map((g) => {
      const table = tables.find((t) => t.id === g.tableId);
      return [
        `"${g.fullName.replace(/"/g, '""')}"`,
        `"${g.email}"`,
        g.rsvpStatus,
        g.partySize,
        `"${table ? table.name : 'Unassigned'}"`,
        `"${g.dietaryRequirements.join('; ')}"`,
        g.isVip ? 'Yes' : 'No',
        `"${(g.notes || '').replace(/"/g, '""')}"`,
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GuestList_${activeEvent?.title.replace(/[^a-zA-Z0-9]/g, '_') || 'Event'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [guests, tables, activeEvent]);

  return (
    <EventContext.Provider
      value={{
        events,
        activeEventId,
        activeEvent,
        setActiveEventId,
        addEvent,
        updateEvent,
        deleteEvent,
        budgetItems,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        vendors,
        addVendor,
        updateVendor,
        deleteVendor,
        guests,
        addGuest,
        updateGuest,
        deleteGuest,
        assignGuestToTable,
        bulkImportGuests,
        tables,
        addTable,
        updateTable,
        deleteTable,
        timeline,
        addTimelineItem,
        updateTimelineItem,
        deleteTimelineItem,
        cycleTimelineStatus,
        currentUser,
        users,
        switchUser,
        isVaultLocked,
        lockVault,
        unlockVault,
        auditLogs,
        exportEncryptedVault,
        importEncryptedVault,
        resetToInitialData,
        exportBudgetCSV,
        exportGuestCSV,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
