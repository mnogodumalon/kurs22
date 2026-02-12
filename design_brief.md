# Design Brief: Kursverwaltungssystem

## 1. App Analysis
- **What this app does:** Manages courses, instructors (Dozenten), participants (Teilnehmer), rooms (Räume), and registrations (Anmeldungen) for an educational institution
- **Who uses this:** Administrative staff at educational institutions (VHS, training centers)
- **The ONE thing users care about most:** Quick access to course registrations and participant management
- **Primary actions:** Add/edit courses, register participants, manage instructor assignments

## 2. What Makes This Design Distinctive
- **Visual identity:** Professional academic feel with deep indigo gradients, subtle warmth
- **Layout strategy:** Tab-based navigation with hero stats at top, data tables below
- **Unique element:** Colored entity indicators (each entity type has a distinct accent)

## 3. Theme & Colors
- **Font:** Plus Jakarta Sans (geometric, professional, highly readable)
- **Google Fonts URL:** https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap
- **Color palette:**
  - Primary: hsl(230, 70%, 45%) - Deep indigo
  - Primary glow: hsl(230, 70%, 65%)
  - Accent: hsl(25, 95%, 55%) - Warm orange for CTAs
  - Success: hsl(150, 60%, 40%) - Paid/confirmed status
  - Entity colors: Kurse (indigo), Dozenten (violet), Teilnehmer (cyan), Räume (amber), Anmeldungen (emerald)

## 4. Mobile Layout
- Stacked tabs (scrollable horizontal)
- Full-width cards for data
- Bottom sheet for forms

## 5. Desktop Layout
- Fixed sidebar tabs on left
- Main content area with stats header + data table
- Modal dialogs for forms

## 6. Components
- **Hero KPI:** Total active courses + upcoming registrations
- **Secondary KPIs:** Dozenten count, Teilnehmer count, available Räume
- **Data tables:** Sortable, filterable per entity
- **Primary Action Button:** "+ Neu" button for each entity

## 7. Visual Details
- Border radius: 12px (cards), 8px (buttons)
- Shadows: Subtle with primary color tint
- Spacing: 24px sections, 16px within cards
- Animations: Subtle fade/slide on tab switch

## 8. CSS Variables
See index.css for full implementation
