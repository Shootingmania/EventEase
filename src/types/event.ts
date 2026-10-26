export type EventType = 'corporate' | 'gala' | 'wedding' | 'conference' | 'private';

export interface EventItem {
  id: string;
  title: string;
  type: EventType;
  date: string; // ISO date YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venue: string;
  venueAddress: string;
  guestCountTarget: number;
  totalBudget: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'planning' | 'confirmed' | 'live' | 'completed' | 'archived';
}

export type BudgetCategory = 
  | 'Venue & Rentals'
  | 'Catering & Beverage'
  | 'AV, Lighting & Staging'
  | 'Decor & Florals'
  | 'Entertainment & Talent'
  | 'Photography & Media'
  | 'Marketing & Collateral'
  | 'Operations & Permits';

export type PaymentStatus = 'pending' | 'partially_paid' | 'paid' | 'overdue';

export interface BudgetItem {
  id: string;
  eventId: string;
  category: BudgetCategory;
  description: string;
  estimatedAmount: number;
  actualAmount: number;
  paidAmount: number;
  dueDate: string;
  status: PaymentStatus;
  vendorId?: string;
  notes?: string;
}

export type VendorStatus = 'inquiry' | 'negotiation' | 'contract_signed' | 'completed' | 'cancelled';

export interface VendorItem {
  id: string;
  eventId: string;
  companyName: string;
  category: BudgetCategory;
  contactName: string;
  email: string;
  phone: string;
  contractAmount: number;
  depositPaid: number;
  status: VendorStatus;
  rating?: number;
  website?: string;
  notes: string;
}

export type RSVPStatus = 'attending' | 'declined' | 'pending';

export interface GuestItem {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  phone?: string;
  rsvpStatus: RSVPStatus;
  partySize: number;
  tableId: string | null; // null if unassigned
  dietaryRequirements: string[]; // e.g. ['Vegetarian', 'Gluten-Free', 'Nut Allergy', 'Halal', 'Kosher']
  isVip: boolean;
  notes?: string;
  checkedIn?: boolean;
}

export type TableShape = 'round' | 'rectangular';

export interface TableItem {
  id: string;
  eventId: string;
  name: string;
  capacity: number;
  shape: TableShape;
  notes?: string;
}

export type TimelineStatus = 'upcoming' | 'in_progress' | 'completed';

export interface TimelineItem {
  id: string;
  eventId: string;
  time: string; // e.g., "08:30 AM" or "14:00"
  endTime?: string;
  title: string;
  description: string;
  owner: string; // responsible coordinator or lead
  location: string; // stage, breakout room, ballroom A
  status: TimelineStatus;
}

export interface SecurityUser {
  id: string;
  name: string;
  email: string;
  role: 'lead_director' | 'coordinator' | 'auditor';
  avatarInitials: string;
  lastLogin: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  details: string;
}
