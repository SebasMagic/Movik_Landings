# Movik Landing v4 (Hero Video Fix + Statement-Break Route Lines) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce `Landing Page v4.dc.html` from `Landing Page v3.dc.html` by (1) fixing the hero so the real Movik-branded truck video actually plays, and (2) adding a custom "route lines" SVG/CSS motif to the purple Statement break band.

**Architecture:** Single self-contained static HTML file (`.dc.html` format — no build step, `support.js` lazy-loads React/Babel from CDN at view time). The hero fix is a filesystem move (no HTML edit — v3's hero markup already references the correct relative path, it was just missing the file). The Statement break change is an inline SVG/CSS edit plus one new CSS keyframe.

**Tech Stack:** Plain HTML/CSS/SVG. No frameworks, no npm, no bundler. Verification uses headless Chrome (`chrome.exe --headless --screenshot`) for visual checks and `grep`/`diff` for structural checks, since there is no unit-test runner for a static marketing page.

## Global Constraints

- No copy changes, no section reordering, no new/removed sections — visual-only fix, per `docs/superpowers/specs/2026-07-03-landing-v3-visual-redesign-design.md`.
- No new *external network* dependencies (no new remote image/video/font URLs). The hero video is a local asset v3 already references — moving it into place is fine. The Statement break motif must be pure inline SVG + CSS, no new asset files.
- Preserve all section `id`s (`#how-it-works`, `#rates`, `#apply`) and the nav anchor links that point to them.
- Only brand purple tones (`#8236FC` and the lighter tints already used in the file, e.g. `#B090FF`, `#C4A8FF`) or white may be used for the route-lines motif's strokes.
- Source file to copy from: `Movik UI Kit y brand assets (1)/Landing Page v3.dc.html`. Leave v2 and v3 untouched. Output file: `Movik UI Kit y brand assets (1)/Landing Page v4.dc.html`.
- The truck video currently sits at `Movik UI Kit y brand assets (1)/Semi-truck_drives_through_desert_1080p_202607021549.mp4` and must end up at `Movik UI Kit y brand assets (1)/uploads/Semi-truck_drives_through_desert_1080p_202607021549.mp4` (the exact relative path v3's `<source src="uploads/...">` expects).
- Chrome path for verification screenshots: `/c/Program Files/Google/Chrome/Application/chrome.exe` (confirmed present on this machine).
- Scratch directory for screenshots: `C:\Users\sebas\AppData\Local\Temp\claude\c--Users-sebas-OneDrive-Documentos-Antigravity-Projects-Movik-Landings\17ce6599-7a27-4958-8111-697485b04ca1\scratchpad` (create a `v4/` subfolder for this work).

---

### Task 1: Create the v4 baseline copy

**Files:**
- Create: `Movik UI Kit y brand assets (1)/Landing Page v4.dc.html` (copy of v3, unmodified)

**Interfaces:**
- Produces: the file all later tasks edit in place.

- [ ] **Step 1: Copy v3 to v4**

Run:
```bash
cp "Movik UI Kit y brand assets (1)/Landing Page v3.dc.html" "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```

- [ ] **Step 2: Verify the copy is byte-identical to v3**

Run:
```bash
diff "Movik UI Kit y brand assets (1)/Landing Page v3.dc.html" "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Expected: no output (files identical).

- [ ] **Step 3: Commit**

```bash
git add "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
git commit -m "Add v4 landing page as unmodified copy of v3"
```

---

### Task 2: Add the `routeDrift` keyframe

**Files:**
- Modify: `Movik UI Kit y brand assets (1)/Landing Page v4.dc.html` (the `<style>` block inside `<helmet>`, currently lines 15-29)

**Interfaces:**
- Produces: CSS keyframe named `routeDrift`, used by Task 4 as `animation:routeDrift 42s linear infinite;`.

- [ ] **Step 1: Verify the keyframe does not exist yet (baseline check)**

Run:
```bash
grep -c "routeDrift" "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Expected: `0`

- [ ] **Step 2: Add the keyframe**

In the `<style>` block, find this line:
```css
    @keyframes scanline{from{transform:translateY(-100%)}to{transform:translateY(100vh)}}
```
Replace it with:
```css
    @keyframes scanline{from{transform:translateY(-100%)}to{transform:translateY(100vh)}}
    @keyframes routeDrift{from{transform:translateX(0)}to{transform:translateX(-50%)}}
```

- [ ] **Step 3: Verify the keyframe now exists**

Run:
```bash
grep -c "routeDrift" "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Expected: `1`

- [ ] **Step 4: Commit**

```bash
git add "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
git commit -m "Add routeDrift keyframe for the route-lines motif"
```

---

### Task 3: Fix the hero by relocating the truck video into `uploads/`

**Context:** v3's hero already contains `<source src="uploads/Semi-truck_drives_through_desert_1080p_202607021549.mp4" type="video/mp4">` — this markup is correct and needs no edit. The video file itself is just in the wrong place on disk (it landed at the UI-kit folder root via an OneDrive sync, not inside `uploads/`), so the `<video>` element currently has nothing to play. This task only moves the file; it does not touch the HTML.

**Files:**
- Move: `Movik UI Kit y brand assets (1)/Semi-truck_drives_through_desert_1080p_202607021549.mp4` → `Movik UI Kit y brand assets (1)/uploads/Semi-truck_drives_through_desert_1080p_202607021549.mp4`

**Interfaces:**
- Produces: the video asset resolvable at the relative path `uploads/Semi-truck_drives_through_desert_1080p_202607021549.mp4` from `Landing Page v4.dc.html`'s location — this is what Task 5's full-page screenshot check relies on to confirm the hero renders correctly.

- [ ] **Step 1: Verify the baseline (file missing from `uploads/`, present at the UI-kit root)**

Run:
```bash
ls "Movik UI Kit y brand assets (1)/uploads/Semi-truck_drives_through_desert_1080p_202607021549.mp4" 2>&1
ls -la "Movik UI Kit y brand assets (1)/Semi-truck_drives_through_desert_1080p_202607021549.mp4"
```
Expected: first command errors with "No such file or directory"; second command shows the file, size `13757142` bytes.

- [ ] **Step 2: Move the file**

Run:
```bash
mv "Movik UI Kit y brand assets (1)/Semi-truck_drives_through_desert_1080p_202607021549.mp4" "Movik UI Kit y brand assets (1)/uploads/Semi-truck_drives_through_desert_1080p_202607021549.mp4"
```

- [ ] **Step 3: Verify the move**

Run:
```bash
ls -la "Movik UI Kit y brand assets (1)/uploads/Semi-truck_drives_through_desert_1080p_202607021549.mp4"
ls "Movik UI Kit y brand assets (1)/Semi-truck_drives_through_desert_1080p_202607021549.mp4" 2>&1
```
Expected: first command shows the file at 13757142 bytes in its new location; second command errors "No such file or directory" (confirms it's gone from the old location, not duplicated).

- [ ] **Step 4: Screenshot the hero with enough time for the video to start, and visually verify**

Run:
```bash
mkdir -p "/c/Users/sebas/AppData/Local/Temp/claude/c--Users-sebas-OneDrive-Documentos-Antigravity-Projects-Movik-Landings/17ce6599-7a27-4958-8111-697485b04ca1/scratchpad/v4"
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --no-sandbox --autoplay-policy=no-user-gesture-required --window-size=1600,1400 --virtual-time-budget=8000 --screenshot="/c/Users/sebas/AppData/Local/Temp/claude/c--Users-sebas-OneDrive-Documentos-Antigravity-Projects-Movik-Landings/17ce6599-7a27-4958-8111-697485b04ca1/scratchpad/v4/hero-video.png" "file:///$(pwd)/Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Then view `.../scratchpad/v4/hero-video.png` (full path above). Expected: the hero background shows the truck/desert-highway video frame (tinted purple by the existing overlay gradients — grey cab, purple trailer with the Movik logo and "Capital on demand" copy are visible through the tint), not a flat black or blank rectangle. Headline, stat cards, and CTAs are unchanged from v3.

- [ ] **Step 5: Commit**

```bash
git add "Movik UI Kit y brand assets (1)/uploads/Semi-truck_drives_through_desert_1080p_202607021549.mp4"
git commit -m "Move Movik truck video into uploads/ so the v4 hero background resolves"
```

---

### Task 4: Add the route-lines motif to the Statement break band

**Files:**
- Modify: `Movik UI Kit y brand assets (1)/Landing Page v4.dc.html` (Statement break section, currently lines 192-198)

**Interfaces:**
- Consumes: `routeDrift` keyframe from Task 2.

- [ ] **Step 1: Verify the motif is not present yet (baseline check)**

Run:
```bash
grep -c "animation:routeDrift" "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Expected: `0`

- [ ] **Step 2: Add the motif to the Statement break band**

Find this block:
```html
<!-- ─── STATEMENT BREAK ─── -->
<div style="background:#8236FC;padding:72px 56px;position:relative;overflow:hidden;">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 80% 50%,rgba(255,255,255,.08) 0%,transparent 60%);pointer-events:none;"></div>
  <div style="max-width:1160px;margin:0 auto;position:relative;z-index:1;">
    <p data-reveal="" style="opacity:0;transform:translateY(44px);font-size:42px;font-weight:800;color:#fff;letter-spacing:-.035em;line-height:1.05;max-width:760px;">The road ahead deserves financing that's as straightforward as the work you do.</p>
  </div>
</div>
```

Replace it with:
```html
<!-- ─── STATEMENT BREAK ─── -->
<div style="background:#8236FC;padding:72px 56px;position:relative;overflow:hidden;">
  <div style="position:absolute;inset:0;overflow:hidden;">
    <div style="position:absolute;top:0;left:0;width:200%;height:100%;display:flex;animation:routeDrift 42s linear infinite;">
      <svg width="50%" height="100%" viewBox="0 0 1600 900" preserveAspectRatio="none" style="flex-shrink:0;">
        <path d="M -100 700 C 300 750, 500 550, 900 600 S 1400 500, 1800 450" stroke="#fff" stroke-width="1.5" fill="none" opacity=".12"></path>
        <path d="M -100 500 C 350 400, 600 650, 1000 500 S 1500 350, 1900 400" stroke="#fff" stroke-width="1.5" fill="none" opacity=".08"></path>
        <path d="M -100 300 C 250 200, 700 350, 1050 220 S 1450 150, 1900 200" stroke="#fff" stroke-width="1" fill="none" opacity=".07"></path>
      </svg>
      <svg width="50%" height="100%" viewBox="0 0 1600 900" preserveAspectRatio="none" style="flex-shrink:0;">
        <path d="M -100 700 C 300 750, 500 550, 900 600 S 1400 500, 1800 450" stroke="#fff" stroke-width="1.5" fill="none" opacity=".12"></path>
        <path d="M -100 500 C 350 400, 600 650, 1000 500 S 1500 350, 1900 400" stroke="#fff" stroke-width="1.5" fill="none" opacity=".08"></path>
        <path d="M -100 300 C 250 200, 700 350, 1050 220 S 1450 150, 1900 200" stroke="#fff" stroke-width="1" fill="none" opacity=".07"></path>
      </svg>
    </div>
  </div>
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 80% 50%,rgba(255,255,255,.08) 0%,transparent 60%);pointer-events:none;"></div>
  <div style="max-width:1160px;margin:0 auto;position:relative;z-index:1;">
    <p data-reveal="" style="opacity:0;transform:translateY(44px);font-size:42px;font-weight:800;color:#fff;letter-spacing:-.035em;line-height:1.05;max-width:760px;">The road ahead deserves financing that's as straightforward as the work you do.</p>
  </div>
</div>
```

Note: strokes are white here (not purple) because the section background is solid `#8236FC` — purple-on-purple would be invisible. Opacities are low (`.07`–`.12`) so the lines read as a subtle texture, not competing with the white quote text.

- [ ] **Step 3: Verify the motif is now present**

Run:
```bash
grep -c "animation:routeDrift" "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Expected: `1`

- [ ] **Step 4: Screenshot through the Statement break section and visually verify**

Run:
```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --no-sandbox --window-size=1600,2800 --virtual-time-budget=6000 --screenshot="/c/Users/sebas/AppData/Local/Temp/claude/c--Users-sebas-OneDrive-Documentos-Antigravity-Projects-Movik-Landings/17ce6599-7a27-4958-8111-697485b04ca1/scratchpad/v4/full-top.png" "file:///$(pwd)/Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Then view `.../scratchpad/v4/full-top.png` (full path above). Expected: scrolling down from the hero, the solid purple Statement break band shows faint white curved lines behind the quote text, quote text still fully legible (not obscured), no layout shift in the sections around it (Ticker, Stats, Pain, Solution all still in their v3 positions).

- [ ] **Step 5: Commit**

```bash
git add "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
git commit -m "Add route-lines motif to the Statement break band"
```

---

### Task 5: Final structural diff and hand-off

**Files:**
- Read-only verification across: `Movik UI Kit y brand assets (1)/Landing Page v3.dc.html`, `Movik UI Kit y brand assets (1)/Landing Page v4.dc.html`

- [ ] **Step 1: Confirm HTML changes are scoped to only the two intended edits**

Run:
```bash
diff "Movik UI Kit y brand assets (1)/Landing Page v3.dc.html" "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Expected: the diff shows exactly two hunks — (1) the added `routeDrift` keyframe line, (2) the Statement break block replacement. No other lines differ (copy, hero markup, other sections, and the `<script>` blocks must be untouched, since the hero fix was a filesystem move, not an HTML edit).

- [ ] **Step 2: Full-page screenshot for final visual sign-off**

Run:
```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --no-sandbox --autoplay-policy=no-user-gesture-required --window-size=1600,4200 --virtual-time-budget=8000 --screenshot="/c/Users/sebas/AppData/Local/Temp/claude/c--Users-sebas-OneDrive-Documentos-Antigravity-Projects-Movik-Landings/17ce6599-7a27-4958-8111-697485b04ca1/scratchpad/v4/full-page.png" "file:///$(pwd)/Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Then view `.../scratchpad/v4/full-page.png` (full path above) top to bottom. Expected: every section (Nav, Hero with visible truck video, Ticker, Stats, Pain, Statement break with route lines, Solution, Comparison, How it works, CTA, Footer) renders with no missing images, no broken-image icons, no layout breakage.

- [ ] **Step 3: Open the file in the default browser for the user**

Run (PowerShell):
```powershell
Start-Process (Resolve-Path ".\Movik UI Kit y brand assets (1)\Landing Page v4.dc.html").Path
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "Finalize Landing Page v4: working hero video + Statement break route lines"
```
