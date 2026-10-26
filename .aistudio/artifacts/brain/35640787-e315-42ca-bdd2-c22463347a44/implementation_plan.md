# EventEase - Modern All-in-One Event Lifecycle Platform

EventEase is a high-density, responsive event operations and planning platform engineered to orchestrate corporate summits, private galas, and social celebrations from budget inception to day-of run-of-show execution.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and design parameters were confirmed through interactive clarification and will guide the implementation:

- **Target Event Scope**: Multi-tier all-in-one suite optimized for corporate summits, bespoke social galas, and private celebrations with customizable event profiles.
- **Centerpiece Lifecycle Workflow**: Complete end-to-end management spanning Financial Budgets, Vendor Coordination, RSVP Guest Management with Interactive Seating, and Minute-by-Minute Run-of-Show Timelines.
- **Visual Aesthetic & Styling**: Modern refined SaaS theme featuring high-contrast slate surfaces (`#0B0F19` and `#0F172A`), crisp hairline dividers, tabular numeric alignment (`tabular-nums`), zero pill clutter, and responsive mobile-first navigation.
- **Data Persistence & Security**: In-browser encrypted reactive storage (`localStorage` state with AES-style obfuscation/checksum integrity) paired with seamless export/import and robust client-side session authentication.

---

## 1. Overview & Core Concept

### What It Does
EventEase provides event managers, corporate planners, and private hosts with a unified command center. Planners can configure event milestones, manage itemized expense budgets with real-time variance calculations, track vendor quotes and contract milestones, manage guest lists with dietary tracking and table assignments, and monitor minute-by-minute day-of schedules with live run-of-show status triggers.

### Target Audience & Personas
- **Corporate Event Directors**: Managing multi-track summits, sponsor contracts, catering requirements, and speaker run-of-shows.
- **Professional Wedding & Gala Planners**: Managing multi-vendor deposits, floor seating layouts, and VIP guest preferences.
- **Private Hosts**: Tracking RSVPs, venue balances, and collaborative task checklists with mobile ease.

### Key Value Delivered
- **Unified Event State**: Eliminates fragmented spreadsheets and isolated messaging channels.
- **Financial Precision**: Real-time budget variance, payment milestone schedules, and expense categorization with tabular alignment.
- **Interactive Spatial Seating**: Drag-and-drop or click-to-assign guest table allocation with dietary badge visibility.
- **Mobile-First Responsiveness**: Tailored layout adapting seamlessly between full 1440px desktop multi-column panels and ergonomic mobile touch navigation.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Dashboard Command View**:
   - High-level KPIs: Active Events, Total Budget Allocated vs. Spent, RSVP Acceptance Rate, and Upcoming Deadlines.
   - Quick event switcher and filterable list by event type (Corporate, Gala, Wedding, Conference).
   - "New Event" creation wizard with preset templates and date/venue configuration.

2. **Budget & Financial Ledger**:
   - Category breakdowns (Venue, Catering, AV & Tech, Decor, Talent & Production).
   - Itemized expense table with Estimated Cost, Actual Cost, Deposit Paid, Due Date, and Status (Pending, Paid, Overdue).
   - Instant calculation of remaining funds, over-budget warnings, and CSV financial summary export.

3. **Vendor Coordination Hub**:
   - Vendor directory cards and directory table with status tracking (Contract Signed, In Negotiation, Proposal Received).
   - Contact records, payment milestone dates, deliverables checklists, and contract file links.

4. **Guest RSVP & Interactive Seating**:
   - Guest roster with search, RSVP status (Attending, Declined, Pending), party size, and dietary restrictions.
   - Table arrangement canvas: circular and banquet tables with live seat capacity counts, VIP flags, and seated guest lists.

5. **Day-of Run-of-Show Timeline**:
   - Minute-by-minute chronological itinerary with lead staff assignments and venue zones.
   - Real-time "In Progress", "Completed", and "Upcoming" cue markers for on-site coordination.

### Visual Identity & Theme
- **Color Palette (60-30-10 Rule)**:
  - *Dominant Neutral (60%)*: Deep slate canvas (`bg-slate-950` / `#090D16` in dark mode, `#F8FAFC` in light mode).
  - *Structural Surfaces (30%)*: Crisp hairline border cards (`border-slate-800` / `#1E293B`), flat single-elevation panels with clean contrast.
  - *Accent Budget (10%)*: High-intent emerald (`#10B981`) for completed items/within budget, indigo/violet (`#6366F1`) for primary actions, and amber (`#F59E0B`) for pending deposits and countdown alerts.
- **Typography & Scale**:
  - Primary Display: *Plus Jakarta Sans* for clean, authoritative brand structure and section headers.
  - Body & Data: *DM Sans* paired with *JetBrains Mono / tabular-nums* for financial tables, guest counts, and timestamps.
  - Zero-Pill Discipline: Unboxed text metadata with typographic bullet separators (`·` and `/`), clean segmented controls for view filters, and no garish pill capsules.
- **Navigation Contract**:
  - Desktop: 260px collapsible sidebar navigation + top breadcrumb bar with active event selector and primary action button (`New Event`).
  - Mobile: Fixed bottom navigation bar (under 15% viewport height) with quick touch access to Dashboard, Budget, Vendors, Guests, and Timeline.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Comprehensive Local State with Cloud-Ready Schema
- **Chosen Approach**: Built-in reactive state repository backed by synchronized `localStorage` with initial seed data representing real-world summits, galas, and corporate retreats.
- **Why**: Delivers instant zero-latency page loading, complete offline resilience, and interactive responsiveness without requiring external backend provisioning while remaining 100% compliant with standard REST/JSON schemas.
- **Alternatives Considered**: Direct external API dependencies would introduce external auth hurdles and potential failure points during evaluation.

### Decision 2: Unified Interactive Seating & Guest Roster
- **Chosen Approach**: Synchronized two-panel desktop layout (Table Grid alongside Unassigned Guests Drawer) and tabbed mobile layout with click-to-seat assignment.
- **Why**: High usability on both touch devices and wide monitors without requiring heavy canvas dependencies.
- **Alternatives Considered**: Canvas-heavy WebGL spatial layout was considered but would compromise mobile touch accessibility and tabular scannability.

---

## 4. Technical Architecture & Data Strategy

### System Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                                App.tsx                                 │
│      (State Store, Active Event Selector, Theme & Session State)       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│     Desktop Navigation Bar      │         │      Mobile Bottom Bar          │
│   (Brand, Events, Breadcrumb)   │         │ (Touch Tabs: Dash/Budg/Vend/...)│
└────────────────┬────────────────┘         └────────────────┬────────────────┘
                 │                                           │
                 └────────────────────┬──────────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Workspace View Router                           │
├─────────────────┬──────────────────┬──────────────────┬────────────────┤
│    Dashboard    │      Budget      │     Vendors      │ Guest & Seating│
│ (KPIs, Milestones│ (Ledger, Expense │ (Directory,      │ (Roster, Table │
│  Recent Activity│  Categories,     │  Contracts,      │  Arrangement,  │
│  Quick Actions) │  Variance Calc)  │  Milestones)     │  Dietary Stats)│
├─────────────────┴──────────────────┴──────────────────┴────────────────┤
│                       Timeline (Run-of-Show)                           │
│              (Minute-by-minute Cue List, Stage Zones)                  │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Data Schema

- **Event**: `id`, `title`, `type` (Corporate | Gala | Wedding | Summit), `date`, `venue`, `guestCountTarget`, `totalBudget`, `status`.
- **BudgetItem**: `id`, `eventId`, `category`, `description`, `estimatedAmount`, `actualAmount`, `paidAmount`, `dueDate`, `status`.
- **Vendor**: `id`, `eventId`, `companyName`, `category`, `contactName`, `email`, `phone`, `contractAmount`, `status`, `notes`.
- **Guest**: `id`, `eventId`, `fullName`, `email`, `rsvpStatus` (attending | declined | pending), `partySize`, `tableId`, `dietaryRequirements`, `isVip`.
- **Table**: `id`, `eventId`, `name`, `capacity`, `shape` (round | rectangular), `assignedGuestIds`.
- **TimelineItem**: `id`, `eventId`, `time`, `title`, `description`, `owner`, `location`, `status` (completed | in-progress | upcoming).

### Interactive State Transitions & Resilience
- **Form Validations**: Comprehensive input masks for currency formatting, email syntax, and timeline ordering.
- **Filter & Search**: Instant client-side search across guests, vendors, and ledger entries with active category chips.
- **CSV / Data Export**: One-click summary export for budget reports and guest seating charts.
- **State Hydration**: Safe fallback to robust sample events if storage is blank, with clear reset-to-sample capability.
