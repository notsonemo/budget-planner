# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] — 2026-04-16

### 🎨 Complete UI Redesign

**Theme**: Dark neon-glow → Apple/Linear-inspired light minimalism

#### Changed
- **Color palette** — Switched to warm light background (`#F5F5F7`), white glass surfaces, Apple Blue (`#0071E3`) primary
- **Typography** — Refined Inter + Outfit pairing with tighter letter-spacing and fluid `clamp()` sizing
- **Cards** — Glassmorphism treatment with `backdrop-filter: blur(16px)`, 16px radius, soft shadows
- **Navigation icons** — Replaced emoji (📊, 💳, 🏷️, 🎯, 📅) with inline SVG Lucide-style icons
- **Buttons** — Solid primary blue with subtle shadow, cleaner ghost/danger variants
- **Modals** — White card with 20px radius, springy scale animation, softer backdrop blur
- **Toasts** — White cards with colored left accent border instead of tinted backgrounds
- **Charts** — Updated colors for light backgrounds (grid lines, text, bar colors)
- **Progress bars** — Softer track color (`rgba(0,0,0,0.06)`)
- **Scrollbar** — Light gray thumb on transparent track
- **Forms** — White inputs with `rgba(0,0,0,0.1)` borders and blue focus rings

#### Added
- **Savings Rate card** — 4th stat card on dashboard showing percentage of income saved
- **Time-aware greeting** — Topbar shows "Good morning/afternoon/evening" with date
- **SVG icon system** — All navigation and action buttons use thin stroke SVGs
- **`<meta name="theme-color">`** — Browser chrome matches the light theme
- **Mobile breakpoints** — Added 480px breakpoint for small phones
- **Stat card accents** — Colored left border indicators (green/red/blue/purple)

#### Fixed
- **Mobile sidebar** — Smoother slide animation with proper shadow on open
- **Chart readability** — Grid lines and labels now contrast properly on light backgrounds

---

## [1.0.0] — 2026-04-16

### Initial Release
- Dashboard with stat cards, donut chart, bar chart, recent transactions
- Full CRUD for transactions with search, filter, sort, pagination
- Category management with emoji icons and color picker
- Monthly budget goals with progress bars and alerts
- Monthly summary tab with savings ring and CSV export
- Dark glassmorphism theme
- SQLite backend with PHP REST API
- Mobile responsive layout
