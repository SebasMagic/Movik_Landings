# Movik Landing — Visual Redesign (v3 → v4)

## Context

Movik has an existing landing page HTML file (`Movik UI Kit y brand assets (1)/Landing Page v2.dc.html`), built as a static `.dc.html` document (self-contained, renders via `support.js`, which lazy-loads React/Babel from CDN — no build step required to view it).

A further iteration, `Landing Page v3.dc.html`, was found already present in the project folder (created by an earlier, now-inactive session). It applies a general visual polish pass on top of v2: subtle film grain, a unified motion easing curve, tighter glow treatment, and small spacing/opacity refinements across every section. It also already replaced the old "photo break" (stock road photo) with a solid purple statement band — no photo dependency left there. Its hero section, however, was mid-migration to a real video background (`uploads/Semi-truck_drives_through_desert_1080p_202607021549.mp4`) that was never actually saved to the project — that reference is currently broken (empty `<video>` with no working source, no poster fallback).

## Goal

Produce a new landing page file that:
- Keeps v3's general polish (grain, unified easing, refined glow, spacing) as the baseline.
- Replaces the broken/missing video hero background with a custom abstract visual motif (no external photo/video dependency).
- Extends that same motif, at reduced intensity, into the purple "Statement break" band, so the page's two atmospheric/dark moments (hero and statement break) read as one consistent visual language.
- Does **not** change page structure, section order, or copy — this is a visual-only refresh.
- Does **not** need to match the flatter, shadow-free product/dashboard UI style — the landing is allowed to stay atmospheric/expressive; only the actual product screens follow the strict `SKILL.md` rules.

## Out of scope

- Copy changes, section reordering, or new sections.
- Changes to the product UI kit / dashboard prototype (`ui_kits/app/index.html`).
- Backend/form submission logic (the "Get My Rate" button keeps its existing fake-submit behavior).

## Design

### 1. Visual motif: abstract route lines

Replace the broken video background with a custom SVG/CSS motif: 3–4 soft, curved lines suggesting a route/highway, rendered in brand purple at varying opacity (roughly matching the existing glow orbs' intensity), drifting slowly and continuously sideways (30–40s linear/ease loop — slow enough to read as ambient, not attention-grabbing).

- Sits behind the existing radial glow orbs (kept from v3), not replacing them — the orbs remain the "light source," the lines add a subtle directional/motion layer.
- Same solid dark background colors already in v3 (`#0D0520` hero, `#080614` base) and the same fade-to-dark gradient transition into the sections below.
- No external image/video request — pure inline SVG + CSS, keeps the page dependency-free and fast to load.
- Applied in the hero at full intensity, and reused at reduced opacity in the purple "Statement break" band, so the two dark/atmospheric moments in the page feel like one consistent visual language instead of two unrelated treatments.

### 2. Motion/glow consistency pass

v3 already unified most of the easing (`cubic-bezier(0.16,1,0.3,1)` for scroll-reveal). Carry this forward as-is. No new animation timings beyond the route-line drift described above.

### 3. Section-by-section

No structural changes. Section-by-section visual notes, building on v3:

- **Nav / Hero**: hero background becomes the route-line motif (replacing the broken video block). Copy, stat cards, and CTA buttons unchanged.
- **Ticker strip, Stats bar, Pain section**: keep v3 as-is (already refined).
- **Statement break**: keep the solid purple band and quote as-is; add the same route-line motif underneath at reduced opacity for visual continuity with the hero.
- **Solution/Rates, Comparison table, How it works, Final CTA, Footer**: keep v3 as-is.

### 4. Deliverable

A new file, `Landing Page v4.dc.html`, in `Movik UI Kit y brand assets (1)/`, based on v3, with the hero video block replaced by the route-line motif, and the same motif layered into the Statement break band. Verified by opening the file in a browser before hand-off.
