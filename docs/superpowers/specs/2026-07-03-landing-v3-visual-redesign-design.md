# Movik Landing — Visual Redesign (v3 → v4)

## Context

Movik has an existing landing page HTML file (`Movik UI Kit y brand assets (1)/Landing Page v2.dc.html`), built as a static `.dc.html` document (self-contained, renders via `support.js`, which lazy-loads React/Babel from CDN — no build step required to view it).

A further iteration, `Landing Page v3.dc.html`, was found already present in the project folder (created by an earlier, now-inactive session). It applies a general visual polish pass on top of v2: subtle film grain, a unified motion easing curve, tighter glow treatment, and small spacing/opacity refinements across every section. It also already replaced the old "photo break" (stock road photo) with a solid purple statement band — no photo dependency left there. Its hero section, however, references a video (`uploads/Semi-truck_drives_through_desert_1080p_202607021549.mp4`) that was missing from the project at the time — that reference was broken (empty `<video>`, no working source, no poster fallback).

**Update:** the missing video subsequently synced to disk (OneDrive) at `Movik UI Kit y brand assets (1)/Semi-truck_drives_through_desert_1080p_202607021549.mp4` (not yet in `/uploads`, where v3 expects it). It is a genuine Movik-branded asset — not stock footage: an 8s, 1920x1080 clip of a truck with the Movik logo and trailer wrap ("Capital on demand: Draw funds in hours, not days") driving a desert highway. Given this is real, on-brand, high-quality footage, the hero direction is revised: **use this video** instead of the abstract route-lines motif originally planned for the hero (see "Decision history" below).

## Goal

Produce a new landing page file that:
- Keeps v3's general polish (grain, unified easing, refined glow, spacing) as the baseline.
- Fixes the hero so the real Movik-branded truck video actually plays (move the asset to the path v3 already references, `uploads/`), keeping v3's existing overlay gradients (they were already tuned for this exact video).
- Adds a custom abstract "route lines" motif — originally scoped for the hero — to the purple "Statement break" band instead, as a lighter secondary touch (not a hero replacement).
- Does **not** change page structure, section order, or copy — this is a visual-only refresh.
- Does **not** need to match the flatter, shadow-free product/dashboard UI style — the landing is allowed to stay atmospheric/expressive; only the actual product screens follow the strict `SKILL.md` rules.

## Decision history

The hero treatment went through two rounds:
1. Initially, no proprietary photo/video asset was found in the project, so the approved direction was a custom abstract "route lines" SVG motif for the hero (avoiding stock photography).
2. Mid-implementation, the referenced truck video synced to disk and turned out to be genuine, high-quality, Movik-branded footage (not stock). Given that, the decision was revised: use the real video in the hero. The route-lines motif is kept, but scoped down to the Statement break band only.

## Out of scope

- Copy changes, section reordering, or new sections.
- Changes to the product UI kit / dashboard prototype (`ui_kits/app/index.html`).
- Backend/form submission logic (the "Get My Rate" button keeps its existing fake-submit behavior).

## Design

### 1. Hero: fix the video, keep v3's treatment

Copy `Semi-truck_drives_through_desert_1080p_202607021549.mp4` into `Movik UI Kit y brand assets (1)/uploads/` (the path v3's `<source>` already points to). No HTML/CSS changes needed in the hero itself — v3's overlay gradients (purple tint, lavender haze, vignette) and glow orbs were already authored against this video and should work as-is once the file resolves.

### 1b. Visual motif: abstract route lines (Statement break only)

A custom SVG/CSS motif: 3–4 soft, curved lines suggesting a route/highway, drifting slowly and continuously sideways (30–40s linear loop — slow enough to read as ambient, not attention-grabbing). Applied only in the purple "Statement break" band, in white at low opacity (the band's background is solid brand purple, so purple-on-purple strokes would be invisible), as a subtle secondary texture behind the quote text — not a hero treatment.

### 2. Motion/glow consistency pass

v3 already unified most of the easing (`cubic-bezier(0.16,1,0.3,1)` for scroll-reveal). Carry this forward as-is. No new animation timings beyond the route-line drift described above.

### 3. Section-by-section

No structural changes. Section-by-section visual notes, building on v3:

- **Nav / Hero**: video now resolves and plays; overlay/orbs/copy/stat cards/CTAs unchanged from v3.
- **Ticker strip, Stats bar, Pain section**: keep v3 as-is (already refined).
- **Statement break**: keep the solid purple band and quote as-is; add the route-line motif underneath at low opacity as a secondary texture.
- **Solution/Rates, Comparison table, How it works, Final CTA, Footer**: keep v3 as-is.

### 4. Deliverable

A new file, `Landing Page v4.dc.html`, in `Movik UI Kit y brand assets (1)/`, based on v3, plus the video asset copied into `uploads/`, with the route-line motif added to the Statement break band. Verified by opening the file in a browser before hand-off.
