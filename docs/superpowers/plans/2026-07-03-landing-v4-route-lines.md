# Movik Landing v4 (Route-Lines Hero) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the broken hero video in `Landing Page v3.dc.html` by replacing it with a custom, dependency-free "route lines" SVG/CSS motif, and reuse that motif at low intensity in the Statement break band, producing `Landing Page v4.dc.html`.

**Architecture:** Single self-contained static HTML file (`.dc.html` format — no build step, `support.js` lazy-loads React/Babel from CDN at view time). All changes are inline `<style>`/SVG markup edits inside that one file. No new files, no JS logic changes beyond one new CSS keyframe.

**Tech Stack:** Plain HTML/CSS/SVG. No frameworks, no npm, no bundler. Verification uses headless Chrome (`chrome.exe --headless --screenshot`) for visual checks and `grep`/`diff` for structural checks, since there is no unit-test runner for a static marketing page.

## Global Constraints

- No copy changes, no section reordering, no new/removed sections — visual-only fix, per `docs/superpowers/specs/2026-07-03-landing-v3-visual-redesign-design.md`.
- No new external network dependencies (no new image/video/font URLs) — the replacement motif must be pure inline SVG + CSS.
- Preserve all section `id`s (`#how-it-works`, `#rates`, `#apply`) and the nav anchor links that point to them.
- Only brand purple tones (`#8236FC` and the lighter tints already used in the file, e.g. `#B090FF`, `#C4A8FF`) or white may be used for the new motif's strokes.
- Source file to copy from: `Movik UI Kit y brand assets (1)/Landing Page v3.dc.html`. Leave v2 and v3 untouched. Output file: `Movik UI Kit y brand assets (1)/Landing Page v4.dc.html`.
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
- Produces: CSS keyframe named `routeDrift`, used by Task 3 and Task 4 as `animation:routeDrift 42s linear infinite;`.

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

### Task 3: Replace the broken hero video with the route-lines motif

**Files:**
- Modify: `Movik UI Kit y brand assets (1)/Landing Page v4.dc.html` (hero section, currently lines 45-56)

**Interfaces:**
- Consumes: `routeDrift` keyframe from Task 2.
- Produces: a reusable route-lines SVG snippet (two duplicated `<svg viewBox="0 0 1600 900">` blocks inside a `width:200%` flex wrapper) that Task 4 duplicates (with different stroke colors/opacities) into the Statement break band.

- [ ] **Step 1: Verify the broken video block exists (baseline check)**

Run:
```bash
grep -n "Semi-truck_drives_through_desert\|<video" "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Expected: 2 matching lines (the `<video>` tag and its `<source>`).

- [ ] **Step 2: Replace the hero background block**

Find this block (inside the `<!-- ─── HERO ─── -->` section):
```html
  <!-- Video background -->
  <div style="position:absolute;inset:0;z-index:0;">
    <video autoplay="" muted="" loop="" playsinline="" style="width:100%;height:100%;object-fit:cover;display:block;opacity:1;">
      <source src="uploads/Semi-truck_drives_through_desert_1080p_202607021549.mp4" type="video/mp4">
    </video>
    <!-- Heavy purple overlay — video as pure graphic element -->
    <div style="position:absolute;inset:0;background:linear-gradient(125deg,rgba(55,8,165,.93) 0%,rgba(90,25,200,.82) 40%,rgba(60,10,175,.7) 80%,rgba(35,5,120,.55) 100%);"></div>
    <!-- Lavender haze top-left -->
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 12% 8%,rgba(210,180,255,.22) 0%,transparent 48%);"></div>
    <!-- Deep vignette edges -->
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,transparent 40%,rgba(4,2,16,.65) 100%);"></div>
  </div>
```

Replace it with:
```html
  <!-- Ambient background -->
  <div style="position:absolute;inset:0;z-index:0;">
    <!-- Route lines -->
    <div style="position:absolute;inset:0;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;width:200%;height:100%;display:flex;animation:routeDrift 42s linear infinite;">
        <svg width="50%" height="100%" viewBox="0 0 1600 900" preserveAspectRatio="none" style="flex-shrink:0;">
          <path d="M -100 700 C 300 750, 500 550, 900 600 S 1400 500, 1800 450" stroke="#B090FF" stroke-width="1.5" fill="none" opacity=".24"></path>
          <path d="M -100 500 C 350 400, 600 650, 1000 500 S 1500 350, 1900 400" stroke="#8236FC" stroke-width="1.5" fill="none" opacity=".18"></path>
          <path d="M -100 300 C 250 200, 700 350, 1050 220 S 1450 150, 1900 200" stroke="#C4A8FF" stroke-width="1" fill="none" opacity=".15"></path>
          <path d="M -100 800 C 400 900, 650 700, 1100 780 S 1600 650, 1900 700" stroke="#8236FC" stroke-width="1" fill="none" opacity=".13"></path>
        </svg>
        <svg width="50%" height="100%" viewBox="0 0 1600 900" preserveAspectRatio="none" style="flex-shrink:0;">
          <path d="M -100 700 C 300 750, 500 550, 900 600 S 1400 500, 1800 450" stroke="#B090FF" stroke-width="1.5" fill="none" opacity=".24"></path>
          <path d="M -100 500 C 350 400, 600 650, 1000 500 S 1500 350, 1900 400" stroke="#8236FC" stroke-width="1.5" fill="none" opacity=".18"></path>
          <path d="M -100 300 C 250 200, 700 350, 1050 220 S 1450 150, 1900 200" stroke="#C4A8FF" stroke-width="1" fill="none" opacity=".15"></path>
          <path d="M -100 800 C 400 900, 650 700, 1100 780 S 1600 650, 1900 700" stroke="#8236FC" stroke-width="1" fill="none" opacity=".13"></path>
        </svg>
      </div>
    </div>
    <!-- Heavy purple overlay -->
    <div style="position:absolute;inset:0;background:linear-gradient(125deg,rgba(55,8,165,.8) 0%,rgba(90,25,200,.65) 40%,rgba(60,10,175,.55) 80%,rgba(35,5,120,.4) 100%);"></div>
    <!-- Lavender haze top-left -->
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 12% 8%,rgba(210,180,255,.22) 0%,transparent 48%);"></div>
    <!-- Deep vignette edges -->
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,transparent 40%,rgba(4,2,16,.65) 100%);"></div>
  </div>
```

Note: the purple overlay's opacities are lowered from the v3 values (`.93/.82/.7/.55` → `.8/.65/.55/.4`) because that overlay was originally tuned to mostly hide a busy video/photo; with the much subtler route-lines art underneath, the lighter overlay lets the lines read through while keeping the same rich purple mood.

- [ ] **Step 3: Verify the video block is gone**

Run:
```bash
grep -n "Semi-truck_drives_through_desert\|<video" "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Expected: no output.

- [ ] **Step 4: Screenshot the hero and visually verify**

Run:
```bash
mkdir -p "/c/Users/sebas/AppData/Local/Temp/claude/c--Users-sebas-OneDrive-Documentos-Antigravity-Projects-Movik-Landings/17ce6599-7a27-4958-8111-697485b04ca1/scratchpad/v4"
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --no-sandbox --window-size=1600,1400 --virtual-time-budget=6000 --screenshot="/c/Users/sebas/AppData/Local/Temp/claude/c--Users-sebas-OneDrive-Documentos-Antigravity-Projects-Movik-Landings/17ce6599-7a27-4958-8111-697485b04ca1/scratchpad/v4/hero.png" "file:///$(pwd)/Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Then view `.../scratchpad/v4/hero.png` (full path above). Expected: hero shows soft curved purple/lavender lines threading across the dark purple gradient background (no black/blank rectangle where the video used to be, no broken-image icon), headline and stat cards unchanged from v3.

- [ ] **Step 5: Commit**

```bash
git add "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
git commit -m "Replace broken hero video with route-lines SVG motif"
```

---

### Task 4: Extend the route-lines motif into the Statement break band

**Files:**
- Modify: `Movik UI Kit y brand assets (1)/Landing Page v4.dc.html` (Statement break section, currently lines 192-198 in v3/current v4)

**Interfaces:**
- Consumes: `routeDrift` keyframe from Task 2.

- [ ] **Step 1: Verify the motif is only used once so far (baseline check)**

Run:
```bash
grep -c "animation:routeDrift" "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Expected: `1` (from Task 3's hero edit).

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

Note: strokes are white here (not purple) because the section background is solid `#8236FC` — purple-on-purple would be invisible. Opacities are much lower than the hero (`.07`–`.12` vs `.13`–`.24`) so the lines read as a subtle texture, not competing with the white quote text.

- [ ] **Step 3: Verify the motif is now used twice**

Run:
```bash
grep -c "animation:routeDrift" "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Expected: `2`

- [ ] **Step 4: Screenshot through the Statement break section and visually verify**

Run:
```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --no-sandbox --window-size=1600,2800 --virtual-time-budget=6000 --screenshot="/c/Users/sebas/AppData/Local/Temp/claude/c--Users-sebas-OneDrive-Documentos-Antigravity-Projects-Movik-Landings/17ce6599-7a27-4958-8111-697485b04ca1/scratchpad/v4/full-top.png" "file:///$(pwd)/Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Then view `.../scratchpad/v4/full-top.png` (full path above). Expected: scrolling down from the hero, the solid purple Statement break band shows faint white curved lines behind the quote text, quote text still fully legible (not obscured), no layout shift in the sections around it (Ticker, Stats, Pain, Solution all still in their v3 positions).

- [ ] **Step 5: Commit**

```bash
git add "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
git commit -m "Extend route-lines motif into the Statement break band"
```

---

### Task 5: Final structural diff and hand-off

**Files:**
- Read-only verification across: `Movik UI Kit y brand assets (1)/Landing Page v3.dc.html`, `Movik UI Kit y brand assets (1)/Landing Page v4.dc.html`

- [ ] **Step 1: Confirm changes are scoped to only the two intended blocks**

Run:
```bash
diff "Movik UI Kit y brand assets (1)/Landing Page v3.dc.html" "Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Expected: the diff shows exactly three hunks — (1) the added `routeDrift` keyframe line, (2) the hero background block replacement, (3) the Statement break block replacement. No other lines differ (copy, other sections, and the `<script>` blocks must be untouched).

- [ ] **Step 2: Full-page screenshot for final visual sign-off**

Run:
```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --no-sandbox --window-size=1600,4200 --virtual-time-budget=7000 --screenshot="/c/Users/sebas/AppData/Local/Temp/claude/c--Users-sebas-OneDrive-Documentos-Antigravity-Projects-Movik-Landings/17ce6599-7a27-4958-8111-697485b04ca1/scratchpad/v4/full-page.png" "file:///$(pwd)/Movik UI Kit y brand assets (1)/Landing Page v4.dc.html"
```
Then view `.../scratchpad/v4/full-page.png` (full path above) top to bottom. Expected: every section (Nav, Hero, Ticker, Stats, Pain, Statement break, Solution, Comparison, How it works, CTA, Footer) renders with no missing images, no broken-image icons, no layout breakage, and the two edited sections show the new route-lines motif as intended.

- [ ] **Step 3: Open the file in the default browser for the user**

Run (PowerShell):
```powershell
Start-Process (Resolve-Path ".\Movik UI Kit y brand assets (1)\Landing Page v4.dc.html").Path
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "Finalize Landing Page v4 route-lines redesign"
```
