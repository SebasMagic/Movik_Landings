# Movik Design System

**Source:** https://movik.us/ui-kit (fetched July 2, 2026)

## Company Overview

Movik provides pre-pick-up financing for freight brokers and carriers — giving them instant access to cash flow. Core value props: 24-hour funding, 98% approval rate, flexible commercial financing.

**Product:** A web dashboard where freight brokers submit loads, manage debtors, view funding status, and track financials.

---

## Content Fundamentals

**Tone:** Confident, direct, operational. No fluff. Speaks to busy freight professionals who want speed and certainty.

**Voice:**
- Active, imperative verbs: "Submit a Load", "Get Started", "Export CSV"
- Second-person ("your loads", "your debtors", "your organization")
- Numbers with specificity: "24-hour turnaround", "98% approval rate", "$1.28M funded"
- Monospace for all IDs and financial figures: `INV-10042`, `$124,850.00`
- Status language is clear and binary: Funded / Pending / Rejected / In Review / Draft

**Casing:** Title case for nav items and card headings. Sentence case for body copy and descriptions. ALL CAPS + letter-spacing for table column headers.

**Emoji:** Not used anywhere in the product.

---

## Visual Foundations

**Colors:** Brand purple `#8236FC` anchors every interactive element — buttons, links, focus rings. White (`#FFFFFF`) backgrounds, near-white card surfaces (`#F5F5F6`). Dark navy-black text (`#0C0A20`). All tokens defined in OKLCH.

**Typography:** Plus Jakarta Sans exclusively. Weight contrast is strong: Extrabold (800) for display/hero, Bold (700) for h1–h2, Semibold (600) for h3–h4 and UI elements, Medium (500) for nav/labels, Regular (400) for body. Financial figures use `tabular-nums`. IDs use `font-family: monospace`.

**Spacing:** 4px base unit. Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px.

**Border Radius:** 0px (none), 6px (sm), 8px (md), 9999px (pill/full). Cards and inputs use 8px (md).

**Cards:** Gray surface (`#F5F5F6`) on white background. No drop shadows. Consistent 1px border (`#EBEBED`). 8px radius.

**Backgrounds:** Solid white / near-white only. No gradients, no textures. Sidebar is dark navy (`#0C0A20`).

**Animations:** Minimal.
- Color transitions: `transition-colors 150ms`
- Focus ring: `focus-visible:ring-[3px] ring-[#8236FC]/50`
- Skeleton loading: `animate-pulse`
- Spinner: `animate-spin`
No bounces, no slides, no spring physics.

**Hover states:** Subtle color darkening on buttons; `bg-muted/50` row highlight on tables. Ghost/outline variants lighten on hover.

**Borders:** 1px `#EBEBED` on cards; 1px `#E5E5E7` on inputs. No decorative left-border accents (except alert feedback components, which use a 2px left border for status color).

**Icons:** Lucide icon set. Stroke-based, 16–20px typical size. Never filled/emoji. See ICONOGRAPHY section.

**Imagery:** None in the product UI. Data-dense dashboard aesthetic.

**Dark mode:** Tokens are dark-mode ready per the source, but only light mode is defined in this design system.

---

## ICONOGRAPHY

**Icon set:** Lucide (https://lucide.dev) — stroke-based, consistent weight.
Loaded from CDN: `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`

**Usage in code:**
```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<script>lucide.createIcons();</script>
<!-- or in React: use lucide-react -->
<i data-lucide="truck" style="width:16px;height:16px;"></i>
```

**Common icons in Movik UI:**
- `home` — Dashboard nav
- `file-text` — Loads
- `users` — Debtors
- `bar-chart-3` — Reports
- `settings` — Settings
- `bell` — Notifications
- `search` — Search inputs
- `plus` — Create/add actions
- `download` — Export
- `upload` — Import/file upload
- `mail` — Email fields
- `copy` — Copy IDs
- `trash-2` — Delete
- `external-link` — Open in new tab
- `check` — Success confirmation
- `x` — Close/dismiss
- `dollar-sign` — Financial context
- `truck` — Freight/load context
- `chevron-right` — Breadcrumb separator
- `more-horizontal` — Row actions

**Intentional additions:** None. Component set mirrors the source inventory exactly.

---

## Intentional Additions

- `Progress` component — described in the source UI kit but not built as a standalone shadcn component; added here as a native HTML/CSS primitive.
- `Skeleton` component — same rationale.

---

## File Index

```
readme.md               ← this file
SKILL.md                ← agent skill definition
styles.css              ← global CSS entry (imports tokens)

tokens/
  colors.css            ← all color custom properties
  typography.css        ← font import + type scale tokens
  spacing.css           ← spacing scale + radius tokens

assets/
  movik_purple.avif     ← purple logo (primary use)
  movik_white.avif      ← white logo (dark backgrounds)

guidelines/             ← foundation specimen cards
  colors-brand.card.html
  colors-neutral.card.html
  colors-semantic.card.html
  type-display.card.html
  type-body.card.html
  type-weights.card.html
  spacing.card.html
  radius.card.html
  motion.card.html
  brand.card.html

components/
  forms/                ← Button, Input, Textarea, Switch, FileUpload
  data/                 ← Card, Badge, Table
  feedback/             ← Alert, Toast, Progress, Skeleton, Dialog
  navigation/           ← Tabs, Breadcrumbs, Sidebar, Pagination

ui_kits/
  app/
    index.html          ← Interactive dashboard prototype
```
