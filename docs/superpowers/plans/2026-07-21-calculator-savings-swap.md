# Savings Calculator Swap — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fee-exposure calculator in `calculator-landing/index.html` with a vanilla port of the "Movik Savings Calculator (standalone)", keeping its email gate and all of its visual effects.

**Architecture:** Pure math, formatting and validation move into a new dependency-free `calculator-landing/calc.js` that attaches to `window.MovikCalc` and also exports under CommonJS so `node --test` can exercise it. `index.html` keeps its existing `<x-dc>` shell, its glassmorphism `.calc-card`, and gains new markup plus a small DOM controller that reads from `MovikCalc`. Nothing else on the page moves.

**Tech Stack:** Plain HTML + CSS + ES5-flavored JavaScript. No build step, no bundler, no framework. Tests run with Node's built-in test runner (`node --test`, Node 24 is installed).

## Global Constraints

- Factoring rate is **fixed at 2%** (`0.02`). There is no rate input on the page.
- Funded-percentage slider runs **70 to 100, step 10**.
- Money renders as `'$' + Math.round(n).toLocaleString('en-US')`.
- Leads go **only to `localStorage`** under the key `movik_calc_leads`, as an appended array. Nothing leaves the browser.
- Unlock is **in-memory only**. Reloading the page returns to the blurred state.
- The post-unlock CTA is the existing WhatsApp link `https://wa.me/13392121905`, labeled **"Talk to our team about switching →"**.
- No string matching `no sign-up`, `no sign up`, or `No sign-up required` may remain in `index.html`.
- Brand values already in the file: purple `#8236FC`, light purple `#B090FF`, destructive `#E33D3D`, panel `rgba(12,8,32,.82)`, hairline `rgba(255,255,255,.1)`.
- Reuse the existing CSS classes `.calc-card`, `.calc-input`, `.calc-input-wrap`, `.calc-prefix`, `.calc-suffix`, `.with-prefix`, `.with-suffix`, `.grid-2`. Do not restyle them.
- `deploy/` is gitignored build output. Do not edit it; it is refreshed by copying `calculator-landing/` wholesale.
- **The controller must bind its DOM handlers inside `componentDidMount()` of the existing `class Component extends DCLogic` block.** Binding at parse time from a plain `<script>` does not work on this page: `support.js` `boot()` runs `dc.replaceWith(hostEl)` (`support.js:166`), replacing the entire `<x-dc>` subtree with React-rendered nodes once React loads from unpkg. Any `addEventListener` attached before that is left on discarded nodes and the page goes inert. The original page never used `addEventListener` on markup inside `<x-dc>` — it used inline `onclick=` (which survives, because React re-renders the attribute) and did all node binding from `componentDidMount`. Follow that pattern.

  *Corrected 2026-07-21 after the Task 5 review caught this. Task 5's original text prescribed a parse-time IIFE; the amendment below supersedes it.*

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `calculator-landing/calc.js` | Create | Pure functions: savings math, USD formatting, live digit formatting, email validation, lead shaping, tick values. No DOM. |
| `calculator-landing/calc.test.js` | Create | Unit tests for every function in `calc.js`. |
| `calculator-landing/index.html` | Modify | CSS additions (lines 81-110 block), card markup (151-199), results markup (202-246), controller script (312-357), SEO/copy strings (7, 13, 19, 47, 55, 60, 65, 145, 269-283). |

---

### Task 1: Pure calculation module

**Files:**
- Create: `calculator-landing/calc.js`
- Test: `calculator-landing/calc.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: global `window.MovikCalc` / CommonJS export with:
  - `RATE: 0.02`
  - `monthlyAmount(amount: number, period: 'monthly'|'annual') -> number`
  - `computeSavings({amount, period, pct, rate?}) -> {traditional, movik, savings, savingsPct}`
  - `formatUSD(n: number) -> string`
  - `formatDigits(rawValue: string, caret: number) -> {text: string, caret: number, value: number}`
  - `isValidEmail(email: string) -> boolean`
  - `buildLead(state, result, timestamp: string) -> object` where `state` has `leadName, leadEmail, leadPhone, trucks, period, amount, pct`
  - `ticks(minPct: number, maxPct: number) -> number[]`

- [ ] **Step 1: Write the failing test**

Create `calculator-landing/calc.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert');
const C = require('./calc.js');

test('monthlyAmount passes monthly through and divides annual by 12', () => {
  assert.strictEqual(C.monthlyAmount(100000, 'monthly'), 100000);
  assert.strictEqual(C.monthlyAmount(1200000, 'annual'), 100000);
});

test('computeSavings at 70% funded keeps 30% of the fee', () => {
  const r = C.computeSavings({ amount: 100000, period: 'monthly', pct: 70 });
  assert.strictEqual(r.traditional, 2000);
  assert.strictEqual(r.movik, 1400);
  assert.strictEqual(Math.round(r.savings), 600);
  assert.strictEqual(Math.round(r.savingsPct), 30);
});

test('computeSavings at 100% funded saves nothing', () => {
  const r = C.computeSavings({ amount: 100000, period: 'monthly', pct: 100 });
  assert.strictEqual(r.savings, 0);
  assert.strictEqual(r.savingsPct, 0);
});

test('computeSavings on annual divides before applying the rate', () => {
  const r = C.computeSavings({ amount: 1200000, period: 'annual', pct: 70 });
  assert.strictEqual(r.traditional, 2000);
  assert.strictEqual(r.movik, 1400);
});

test('computeSavings with zero volume yields zero, not NaN', () => {
  const r = C.computeSavings({ amount: 0, period: 'monthly', pct: 70 });
  assert.strictEqual(r.traditional, 0);
  assert.strictEqual(r.savingsPct, 0);
});

test('computeSavings uses the fixed 2% rate', () => {
  assert.strictEqual(C.RATE, 0.02);
});

test('formatUSD rounds and adds thousands separators', () => {
  assert.strictEqual(C.formatUSD(1234.56), '$1,235');
  assert.strictEqual(C.formatUSD(0), '$0');
  assert.strictEqual(C.formatUSD(1000000), '$1,000,000');
});

test('formatDigits inserts commas and keeps the caret after the typed digit', () => {
  const r = C.formatDigits('100000', 6);
  assert.strictEqual(r.text, '100,000');
  assert.strictEqual(r.caret, 7);
  assert.strictEqual(r.value, 100000);
});

test('formatDigits keeps the caret mid-string when editing inside the number', () => {
  const r = C.formatDigits('1005,000', 4);
  assert.strictEqual(r.text, '1,005,000');
  assert.strictEqual(r.value, 1005000);
  assert.strictEqual(r.text.slice(0, r.caret).replace(/[^0-9]/g, '').length, 4);
});

test('formatDigits strips non-digits', () => {
  const r = C.formatDigits('12a3', 4);
  assert.strictEqual(r.text, '123');
  assert.strictEqual(r.value, 123);
});

test('formatDigits handles an empty field', () => {
  const r = C.formatDigits('', 0);
  assert.strictEqual(r.text, '');
  assert.strictEqual(r.caret, 0);
  assert.strictEqual(r.value, 0);
});

test('isValidEmail accepts real addresses and rejects junk', () => {
  assert.ok(C.isValidEmail('carlos@onestopdb.us'));
  assert.ok(!C.isValidEmail('carlos@'));
  assert.ok(!C.isValidEmail('carlos at example.com'));
  assert.ok(!C.isValidEmail(''));
  assert.ok(!C.isValidEmail('a@b'));
});

test('buildLead trims text and computes per-truck savings', () => {
  const state = {
    leadName: '  Carlos  ', leadEmail: ' carlos@onestopdb.us ', leadPhone: ' 555 ',
    trucks: 12, period: 'monthly', amount: 100000, pct: 70
  };
  const result = C.computeSavings({ amount: 100000, period: 'monthly', pct: 70 });
  const lead = C.buildLead(state, result, '2026-07-21T00:00:00.000Z');
  assert.strictEqual(lead.name, 'Carlos');
  assert.strictEqual(lead.email, 'carlos@onestopdb.us');
  assert.strictEqual(lead.phone, '555');
  assert.strictEqual(lead.estimatedMonthlySavings, 600);
  assert.strictEqual(lead.estimatedSavingsPerTruck, 50);
  assert.strictEqual(lead.source, 'movik-savings-calculator');
  assert.strictEqual(lead.timestamp, '2026-07-21T00:00:00.000Z');
});

test('buildLead reports null per-truck savings when there are no trucks', () => {
  const state = {
    leadName: 'Carlos', leadEmail: 'carlos@onestopdb.us', leadPhone: '',
    trucks: 0, period: 'monthly', amount: 100000, pct: 70
  };
  const result = C.computeSavings({ amount: 100000, period: 'monthly', pct: 70 });
  assert.strictEqual(C.buildLead(state, result, 'x').estimatedSavingsPerTruck, null);
});

test('ticks enumerates the slider stops', () => {
  assert.deepStrictEqual(C.ticks(70, 100), [70, 80, 90, 100]);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd "calculator-landing" && node --test calc.test.js
```

Expected: FAIL — `Cannot find module './calc.js'`

- [ ] **Step 3: Write the implementation**

Create `calculator-landing/calc.js`:

```js
/* Movik Savings Calculator — pure logic.
   No DOM access. Loaded by index.html as window.MovikCalc, and by
   calc.test.js through CommonJS. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MovikCalc = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var RATE = 0.02;

  function monthlyAmount(amount, period) {
    var a = amount || 0;
    return period === 'annual' ? a / 12 : a;
  }

  function computeSavings(opts) {
    var rate = typeof opts.rate === 'number' ? opts.rate : RATE;
    var m = monthlyAmount(opts.amount, opts.period);
    var traditional = m * rate;
    var movik = m * (opts.pct / 100) * rate;
    var savings = traditional - movik;
    return {
      traditional: traditional,
      movik: movik,
      savings: savings,
      savingsPct: traditional > 0 ? (savings / traditional) * 100 : 0
    };
  }

  function formatUSD(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  /* Reformats a partially typed number with thousands separators and reports
     where the caret belongs afterwards, so typing never yanks the cursor to
     the end. Counts digits before the caret, reformats, then walks forward
     to the same digit index. */
  function formatDigits(rawValue, caret) {
    var value = String(rawValue == null ? '' : rawValue);
    var pos = typeof caret === 'number' ? caret : value.length;
    var digitsBefore = value.slice(0, pos).replace(/[^0-9]/g, '').length;
    var digits = value.replace(/[^0-9]/g, '');
    var formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    var newCaret = formatted.length;
    if (digitsBefore === 0) {
      newCaret = 0;
    } else {
      var count = 0;
      for (var i = 0; i < formatted.length; i++) {
        if (formatted[i] >= '0' && formatted[i] <= '9') count++;
        if (count === digitsBefore) { newCaret = i + 1; break; }
      }
    }

    return {
      text: formatted,
      caret: newCaret,
      value: digits ? parseInt(digits, 10) : 0
    };
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email == null ? '' : email).trim());
  }

  function buildLead(state, result, timestamp) {
    return {
      name: String(state.leadName || '').trim(),
      email: String(state.leadEmail || '').trim(),
      phone: String(state.leadPhone || '').trim(),
      trucks: state.trucks,
      billingPeriod: state.period,
      invoiceVolume: state.amount,
      pctFunded: state.pct,
      estimatedMonthlySavings: Math.round(result.savings),
      estimatedSavingsPerTruck: state.trucks > 0 ? Math.round(result.savings / state.trucks) : null,
      source: 'movik-savings-calculator',
      timestamp: timestamp
    };
  }

  function ticks(minPct, maxPct) {
    var out = [];
    for (var v = minPct; v <= maxPct; v += 10) out.push(v);
    return out;
  }

  return {
    RATE: RATE,
    monthlyAmount: monthlyAmount,
    computeSavings: computeSavings,
    formatUSD: formatUSD,
    formatDigits: formatDigits,
    isValidEmail: isValidEmail,
    buildLead: buildLead,
    ticks: ticks
  };
});
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
cd "calculator-landing" && node --test calc.test.js
```

Expected: PASS — `# pass 15`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add calculator-landing/calc.js calculator-landing/calc.test.js
git commit -m "Add pure savings-calculator logic with unit tests"
```

---

### Task 2: CSS for the new controls

**Files:**
- Modify: `calculator-landing/index.html:96` (append after `.with-suffix`, before the `@media` block that starts at line 97)

**Interfaces:**
- Consumes: nothing.
- Produces: classes `.seg`, `.seg-btn`, `.seg-btn.is-active`, `.calc-label`, `.calc-suffix-word`, `.with-suffix-word`, `.calc-range`, `.tick`, `.tick.is-active`, `.bar-track`, `.bar-fill-muted`, `.bar-fill-brand`, `.is-locked`, `.gate-input`, `.gate-input.has-error`, `.live-dot`, `.btn-primary` — all consumed by Tasks 3, 4 and 5.

- [ ] **Step 1: Insert the new rules**

In `calculator-landing/index.html`, immediately after the line `.with-suffix{padding-right:36px}` and before `@media (max-width:760px){`, insert:

```css
    .calc-label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.38);margin-bottom:10px}
    .live-dot{width:6px;height:6px;border-radius:50%;background:#8236FC;box-shadow:0 0 8px rgba(130,54,252,.75);display:inline-block;flex-shrink:0}
    .seg{display:flex;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:4px;gap:4px}
    .seg-btn{flex:1;padding:13px 10px;border:none;border-radius:7px;background:transparent;color:rgba(255,255,255,.55);font-size:13px;font-weight:600;cursor:pointer;transition:background-color 150ms,color 150ms}
    .seg-btn.is-active{background:#8236FC;color:#fff}
    .calc-suffix-word{font-size:13px;font-weight:600}
    .with-suffix-word{padding-right:76px}
    .calc-range{width:100%;height:6px;accent-color:#8236FC;cursor:pointer}
    .tick{background:none;border:none;padding:0;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:400;color:rgba(255,255,255,.38);cursor:pointer;transition:color 150ms}
    .tick.is-active{color:#B090FF;font-weight:700}
    .bar-track{width:100%;height:10px;background:rgba(255,255,255,.06);border-radius:6px;overflow:hidden}
    .bar-fill-muted{height:100%;width:100%;background:rgba(255,255,255,.22);border-radius:6px}
    .bar-fill-brand{height:100%;background:#8236FC;border-radius:6px;transition:width 260ms cubic-bezier(0.16,1,0.3,1)}
    .is-locked{filter:blur(9px);user-select:none;-webkit-user-select:none;pointer-events:none}
    .gate-input{width:100%;height:48px;padding:0 14px;background:rgba(12,8,32,.7);border:1px solid rgba(255,255,255,.12);border-radius:10px;color:#fff;font-size:15px;margin-bottom:12px;transition:border-color 150ms,box-shadow 150ms}
    .gate-input:focus{border-color:#8236FC;box-shadow:0 0 0 3px rgba(130,54,252,.22)}
    .gate-input.has-error{border-color:#E33D3D}
    .btn-primary{width:100%;height:56px;background:#8236FC;color:#fff;font-size:16px;font-weight:800;border:none;border-radius:12px;cursor:pointer;letter-spacing:-.01em;transition:background-color 150ms,transform 200ms,box-shadow 200ms}
    .btn-primary:hover{background:oklch(0.43 0.27 286);transform:translateY(-2px);box-shadow:0 16px 48px rgba(130,54,252,.55)}
    .btn-ghost{width:100%;height:48px;background:transparent;color:rgba(255,255,255,.6);font-size:14px;font-weight:600;border:1px solid rgba(255,255,255,.14);border-radius:12px;cursor:pointer;transition:color 150ms,border-color 150ms}
    .btn-ghost:hover{color:#fff;border-color:rgba(255,255,255,.3)}
```

- [ ] **Step 2: Add the mobile rule for the segmented controls**

Inside the existing `@media (max-width:760px){` block, after the line `.grid-3{grid-template-columns:1fr!important}`, insert:

```css
      .seg-btn{font-size:12px;padding:12px 6px}
```

- [ ] **Step 3: Verify the file still parses**

```bash
node -e "const h=require('fs').readFileSync('calculator-landing/index.html','utf8');const o=(h.match(/<style>/g)||[]).length,c=(h.match(/<\/style>/g)||[]).length;if(o!==c)throw new Error('unbalanced style tags: '+o+' vs '+c);console.log('style tags balanced:',o)"
```

Expected: `style tags balanced: 1`

- [ ] **Step 4: Commit**

```bash
git add calculator-landing/index.html
git commit -m "Add CSS for savings-calculator controls, bars and gate"
```

---

### Task 3: Replace the calculator card markup

**Files:**
- Modify: `calculator-landing/index.html:153-198` (everything inside `.calc-card`, from the `<p>Your numbers, your call</p>` line through the closing `</button>` of `See my numbers →`)

**Interfaces:**
- Consumes: classes from Task 2.
- Produces: element IDs `seg-monthly`, `seg-annual`, `seg-yes`, `seg-no`, `invoice-volume`, `truck-count`, `pct-label`, `pct-range`, `tick-row` — all consumed by Task 5.

- [ ] **Step 1: Replace the card body**

Delete lines 153-198 of `calculator-landing/index.html` — that is, everything between `<div class="calc-card" ...>` (line 151, keep it) and its closing `</div>` (line 199, keep it). Replace with:

```html
      <p style="display:flex;align-items:center;gap:9px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:rgba(255,255,255,.35);margin-bottom:28px;">
        <span class="live-dot"></span>Live calculator
      </p>

      <div class="grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <div>
          <span class="calc-label">Billing period</span>
          <div class="seg">
            <button type="button" class="seg-btn is-active" id="seg-monthly">Monthly</button>
            <button type="button" class="seg-btn" id="seg-annual">Annual</button>
          </div>
        </div>
        <div>
          <span class="calc-label">Do you factor today?</span>
          <div class="seg">
            <button type="button" class="seg-btn is-active" id="seg-yes">Yes, with someone else</button>
            <button type="button" class="seg-btn" id="seg-no">No, not yet</button>
          </div>
        </div>
      </div>

      <div class="grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px;">
        <div>
          <label class="calc-label" for="invoice-volume">Your invoice volume</label>
          <div class="calc-input-wrap">
            <span class="calc-prefix">$</span>
            <input class="calc-input with-prefix" type="text" inputmode="numeric" id="invoice-volume" value="100,000" autocomplete="off">
          </div>
        </div>
        <div>
          <label class="calc-label" for="truck-count">Number of trucks in your fleet</label>
          <div class="calc-input-wrap">
            <input class="calc-input with-suffix-word" type="text" inputmode="numeric" id="truck-count" placeholder="e.g. 12" autocomplete="off">
            <span class="calc-suffix calc-suffix-word">trucks</span>
          </div>
        </div>
      </div>

      <div>
        <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px;gap:16px;">
          <label class="calc-label" style="margin-bottom:0;" for="pct-range">% of invoices you want funded</label>
          <span id="pct-label" style="font-size:20px;font-weight:800;color:#B090FF;font-variant-numeric:tabular-nums;">70%</span>
        </div>
        <input class="calc-range" type="range" id="pct-range" min="70" max="100" step="10" value="70">
        <div id="tick-row" style="display:flex;justify-content:space-between;margin-top:10px;padding:0 1px;"></div>
        <p style="font-size:13px;color:rgba(255,255,255,.4);margin-top:14px;line-height:1.6;">Movik lets you choose — traditional factors force 100%.</p>
      </div>
```

- [ ] **Step 2: Verify the old inputs are gone and the new IDs are present**

```bash
node -e "
const h=require('fs').readFileSync('calculator-landing/index.html','utf8');
const gone=['weekly-invoice','num-invoices','wait-days','factor-rate','ach-fee','onclick=\"calcRun()\"'];
const want=['seg-monthly','seg-annual','seg-yes','seg-no','invoice-volume','truck-count','pct-label','pct-range','tick-row'];
const bad=gone.filter(s=>h.includes(s));
const missing=want.filter(s=>!h.includes('id=\"'+s+'\"'));
if(bad.length)throw new Error('still present: '+bad.join(', '));
if(missing.length)throw new Error('missing ids: '+missing.join(', '));
console.log('card markup OK');
"
```

Expected: `card markup OK`

Note: the `calcRun` function itself is still defined in the script block at this point — Task 5 deletes it. This check only asserts that nothing in the markup still calls it.

- [ ] **Step 3: Commit**

```bash
git add calculator-landing/index.html
git commit -m "Replace calculator inputs with savings-calculator controls"
```

---

### Task 4: Replace the results block and add the gate

**Files:**
- Modify: `calculator-landing/index.html:202-246` (the whole `<div id="results-section">` element)

**Interfaces:**
- Consumes: classes from Task 2.
- Produces: element IDs `results-section`, `results-inner`, `r-trad-label`, `r-trad-value`, `r-movik-label`, `r-movik-value`, `r-movik-bar`, `r-badge`, `r-per-truck`, `r-per-truck-value`, `gate-cta`, `gate-open`, `gate-form`, `lead-name`, `lead-email`, `lead-error`, `lead-phone`, `lead-submit`, `gate-back`, `result-cta` — all consumed by Task 5.

- [ ] **Step 1: Replace the results element**

Delete the entire `<div id="results-section" ...>` element (lines 202-246, including the `<!-- RESULTS -->` comment above it) and replace with:

```html
    <!-- RESULTS -->
    <div id="results-section" style="margin-top:32px;">

      <div id="results-inner" class="is-locked" style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:32px;">
        <div style="margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;gap:16px;">
            <span id="r-trad-label" style="font-size:15px;font-weight:500;color:rgba(255,255,255,.55);">What you pay today (100% financed)</span>
            <span id="r-trad-value" style="font-size:18px;font-weight:700;color:#fff;font-variant-numeric:tabular-nums;white-space:nowrap;">$2,000/mo</span>
          </div>
          <div class="bar-track"><div class="bar-fill-muted"></div></div>
        </div>

        <div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;gap:16px;">
            <span id="r-movik-label" style="font-size:15px;font-weight:500;color:rgba(255,255,255,.55);">With Movik (70% financed)</span>
            <span id="r-movik-value" style="font-size:18px;font-weight:700;color:#fff;font-variant-numeric:tabular-nums;white-space:nowrap;">$1,400/mo</span>
          </div>
          <div class="bar-track"><div class="bar-fill-brand" id="r-movik-bar" style="width:70%;"></div></div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;background:rgba(130,54,252,.1);border:1px solid rgba(130,54,252,.22);border-radius:12px;padding:18px 20px;margin-top:24px;">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:rgba(255,255,255,.5);">You'd keep</span>
          <span id="r-badge" style="font-size:22px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums;white-space:nowrap;">$600/mo · 30% less</span>
        </div>

        <p id="r-per-truck" style="display:none;font-size:13px;color:rgba(255,255,255,.45);text-align:right;margin-top:12px;">≈ <span id="r-per-truck-value" style="color:#B090FF;font-weight:700;">$0</span> saved per truck, per month</p>
      </div>

      <div id="gate-cta" style="margin-top:24px;">
        <button type="button" class="btn-primary" id="gate-open">See my exact savings →</button>
      </div>

      <div id="gate-form" style="display:none;margin-top:24px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:28px;">
        <p style="font-size:17px;font-weight:700;color:#fff;text-align:center;margin-bottom:6px;">Almost there</p>
        <p style="font-size:14px;color:rgba(255,255,255,.45);text-align:center;margin-bottom:20px;">Tell us where to send your savings breakdown.</p>
        <input class="gate-input" type="text" id="lead-name" placeholder="Full name" autocomplete="name">
        <input class="gate-input" type="email" id="lead-email" placeholder="Work email" autocomplete="email">
        <p id="lead-error" style="display:none;font-size:12px;color:#E33D3D;margin:-6px 0 10px;">Enter your name and a valid email.</p>
        <input class="gate-input" type="tel" id="lead-phone" placeholder="Phone (optional)" autocomplete="tel">
        <button type="button" class="btn-primary" id="lead-submit">Unlock my results</button>
        <div style="margin-top:10px;">
          <button type="button" class="btn-ghost" id="gate-back">Back to calculator</button>
        </div>
      </div>

      <div id="result-cta" style="display:none;margin-top:24px;">
        <a href="https://wa.me/13392121905" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:10px;height:56px;background:#8236FC;color:#fff;font-size:16px;font-weight:800;text-decoration:none;border-radius:12px;letter-spacing:-.01em;transition:background-color 150ms,transform 200ms,box-shadow 200ms;" onmouseover="this.style.background='oklch(0.43 0.27 286)';this.style.transform='translateY(-2px)';this.style.boxShadow='0 16px 48px rgba(130,54,252,.55)'" onmouseout="this.style.background='#8236FC';this.style.transform='none';this.style.boxShadow='none'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Talk to our team about switching →
        </a>
      </div>

      <p style="font-size:12px;color:rgba(255,255,255,.3);text-align:center;margin-top:20px;line-height:1.7;">Estimate only. Rate shown is illustrative and based on standard factoring pricing — your actual rate depends on your carrier profile.</p>
    </div>
```

- [ ] **Step 2: Verify the old result IDs are gone and the new ones present**

```bash
node -e "
const h=require('fs').readFileSync('calculator-landing/index.html','utf8');
const gone=['r-desc-factor','r-weekly-factor','r-desc-ach','r-weekly-ach','r-weekly-total','r-days-note','r-yearly-ach','r-yearly-total','r-truck-line'];
const want=['results-inner','r-trad-label','r-trad-value','r-movik-label','r-movik-value','r-movik-bar','r-badge','r-per-truck','r-per-truck-value','gate-cta','gate-open','gate-form','lead-name','lead-email','lead-error','lead-phone','lead-submit','gate-back','result-cta'];
const bad=gone.filter(s=>h.includes(s));
const missing=want.filter(s=>!h.includes('id=\"'+s+'\"'));
if(bad.length)throw new Error('still present: '+bad.join(', '));
if(missing.length)throw new Error('missing ids: '+missing.join(', '));
console.log('results markup OK');
"
```

Expected: `results markup OK`

- [ ] **Step 3: Commit**

```bash
git add calculator-landing/index.html
git commit -m "Replace results block with comparison bars and email gate"
```

---

### Task 5: Wire up the controller

**Files:**
- Modify: `calculator-landing/index.html:72` (add the `calc.js` script tag)
- Modify: `calculator-landing/index.html:313-341` (delete `fmt` and `calcRun`, add the controller)

**Interfaces:**
- Consumes: `window.MovikCalc` from Task 1; the element IDs from Tasks 3 and 4; the CSS classes from Task 2.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Load the calc module**

In `calculator-landing/index.html`, on the line after `<script src="./support.js"></script>` (line 72), add:

```html
<script src="./calc.js"></script>
```

- [ ] **Step 2: Replace `fmt` and `calcRun` with the controller**

In the `<script>` block that begins at line 312, delete the `fmt` function and the entire `calcRun` function (lines 313-341). Leave `toggleFaq` and its `openFaq` variable untouched. In their place, insert:

```js
(function () {
  var C = window.MovikCalc;
  var MIN_PCT = 70;
  var MAX_PCT = 100;
  var LEADS_KEY = 'movik_calc_leads';

  var state = {
    period: 'monthly',
    amount: 100000,
    trucks: 0,
    hasFactor: true,
    pct: 70,
    unlocked: false
  };

  function $(id) { return document.getElementById(id); }

  var tickEls = [];

  /* Swap this for a network call when there is somewhere real to send leads. */
  function saveLead(lead) {
    try {
      var existing = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
      if (!Array.isArray(existing)) existing = [];
      existing.push(lead);
      localStorage.setItem(LEADS_KEY, JSON.stringify(existing));
    } catch (err) {
      console.warn('[movik-calc] could not persist lead:', err);
    }
    console.log('[movik-calc] Lead captured:', lead);
  }

  function bindDigitInput(el, key) {
    el.addEventListener('input', function () {
      var r = C.formatDigits(el.value, el.selectionStart);
      el.value = r.text;
      el.setSelectionRange(r.caret, r.caret);
      state[key] = r.value;
      render();
    });
  }

  function buildTicks() {
    var row = $('tick-row');
    row.innerHTML = '';
    tickEls = C.ticks(MIN_PCT, MAX_PCT).map(function (v) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tick';
      b.textContent = v + '%';
      b.addEventListener('click', function () {
        state.pct = v;
        $('pct-range').value = String(v);
        render();
      });
      row.appendChild(b);
      return { value: v, el: b };
    });
  }

  function render() {
    var r = C.computeSavings({ amount: state.amount, period: state.period, pct: state.pct });

    $('seg-monthly').classList.toggle('is-active', state.period === 'monthly');
    $('seg-annual').classList.toggle('is-active', state.period === 'annual');
    $('seg-yes').classList.toggle('is-active', state.hasFactor);
    $('seg-no').classList.toggle('is-active', !state.hasFactor);

    $('pct-label').textContent = state.pct + '%';
    tickEls.forEach(function (t) {
      t.el.classList.toggle('is-active', t.value === state.pct);
    });

    $('r-trad-label').textContent = state.hasFactor
      ? 'What you pay today (100% financed)'
      : 'Market-standard factor (100% financed)';
    $('r-trad-value').textContent = C.formatUSD(r.traditional) + '/mo';
    $('r-movik-label').textContent = 'With Movik (' + state.pct + '% financed)';
    $('r-movik-value').textContent = C.formatUSD(r.movik) + '/mo';
    $('r-movik-bar').style.width = state.pct + '%';
    $('r-badge').textContent = C.formatUSD(r.savings) + '/mo · ' + Math.round(r.savingsPct) + '% less';

    if (state.trucks > 0) {
      $('r-per-truck').style.display = 'block';
      $('r-per-truck-value').textContent = C.formatUSD(r.savings / state.trucks);
    } else {
      $('r-per-truck').style.display = 'none';
    }

    $('results-inner').classList.toggle('is-locked', !state.unlocked);
  }

  function clearLeadError() {
    $('lead-error').style.display = 'none';
    $('lead-name').classList.remove('has-error');
    $('lead-email').classList.remove('has-error');
  }

  function submitLead() {
    var name = $('lead-name').value.trim();
    var email = $('lead-email').value.trim();
    var nameOk = name.length > 0;
    var emailOk = C.isValidEmail(email);

    $('lead-name').classList.toggle('has-error', !nameOk);
    $('lead-email').classList.toggle('has-error', !emailOk);

    if (!nameOk || !emailOk) {
      $('lead-error').style.display = 'block';
      return;
    }

    clearLeadError();

    var result = C.computeSavings({ amount: state.amount, period: state.period, pct: state.pct });
    saveLead(C.buildLead({
      leadName: name,
      leadEmail: email,
      leadPhone: $('lead-phone').value,
      trucks: state.trucks,
      period: state.period,
      amount: state.amount,
      pct: state.pct
    }, result, new Date().toISOString()));

    state.unlocked = true;
    $('gate-form').style.display = 'none';
    $('gate-cta').style.display = 'none';
    $('result-cta').style.display = 'block';
    render();
  }

  function init() {
    if (!C || !$('pct-range')) return;

    buildTicks();

    $('seg-monthly').addEventListener('click', function () { state.period = 'monthly'; render(); });
    $('seg-annual').addEventListener('click', function () { state.period = 'annual'; render(); });
    $('seg-yes').addEventListener('click', function () { state.hasFactor = true; render(); });
    $('seg-no').addEventListener('click', function () { state.hasFactor = false; render(); });

    bindDigitInput($('invoice-volume'), 'amount');
    bindDigitInput($('truck-count'), 'trucks');

    $('pct-range').addEventListener('input', function (e) {
      state.pct = parseInt(e.target.value, 10);
      render();
    });

    $('gate-open').addEventListener('click', function () {
      $('gate-cta').style.display = 'none';
      $('gate-form').style.display = 'block';
    });
    $('gate-back').addEventListener('click', function () {
      $('gate-form').style.display = 'none';
      $('gate-cta').style.display = 'block';
      clearLeadError();
    });
    $('lead-submit').addEventListener('click', submitLead);
    $('lead-name').addEventListener('input', clearLeadError);
    $('lead-email').addEventListener('input', clearLeadError);

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

- [ ] **Step 3: Verify the old logic is gone and the module loads**

```bash
node -e "
const h=require('fs').readFileSync('calculator-landing/index.html','utf8');
if(h.includes('function calcRun'))throw new Error('calcRun still defined');
if(!h.includes('<script src=\"./calc.js\"></script>'))throw new Error('calc.js not loaded');
if(!h.includes('movik_calc_leads'))throw new Error('lead storage key missing');
if(!h.includes('function toggleFaq'))throw new Error('toggleFaq was removed by mistake');
console.log('controller wired OK');
"
```

Expected: `controller wired OK`

- [ ] **Step 4: Re-run the unit tests to confirm nothing in `calc.js` regressed**

```bash
cd "calculator-landing" && node --test calc.test.js
```

Expected: PASS — `# pass 15`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add calculator-landing/index.html
git commit -m "Wire savings calculator controller with localStorage lead capture"
```

---

### Task 6: Rewrite the copy, SEO and FAQ

**Files:**
- Modify: `calculator-landing/index.html` lines 6, 7, 12, 13, 18, 19, 41, 47, 54-55, 59-60, 63-65, 145, 269-283

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

The gate makes the current "no sign-up" promise false, and the old FAQ describes ACH totals that no longer exist. The schema FAQ answers and the on-page FAQ answers must stay identical to each other — Google flags mismatches.

- [ ] **Step 1: Update the head metadata**

Replace these five values in `calculator-landing/index.html`:

Line 6, `<title>`:
```
Freight Factoring Savings Calculator — See What 100% Financing Costs You | Movik
```

Line 7, `<meta name="description" content="...">`:
```
Free calculator for truckers: see what you pay when a factor finances 100% of your invoices, and what you keep when you choose the percentage yourself. Same rate, smaller bill.
```

Line 12, `<meta property="og:title" content="...">`:
```
Freight Factoring Savings Calculator | Movik
```

Line 13, `<meta property="og:description" content="...">`:
```
Same invoices, same 2% rate — you just stop financing 100% of them by default. Move the slider and see what you'd keep every month.
```

Line 18, `<meta name="twitter:title" content="...">`:
```
Freight Factoring Savings Calculator | Movik
```

Line 19, `<meta name="twitter:description" content="...">`:
```
Same invoices, same 2% rate. Choose what percentage you finance and see what you keep.
```

- [ ] **Step 2: Update the JSON-LD**

Line 41, `"name"` of the WebApplication:
```
Movik Freight Factoring Savings Calculator
```

Line 47, `"description"` of the WebApplication:
```
Free calculator that shows trucking carriers what they pay when a factor finances 100% of their invoices versus financing only the percentage they choose. Detailed results are sent by email.
```

Replace the three FAQ entries (lines 52-66) with:

```json
        {
          "@type": "Question",
          "name": "Do I have to give my email to use the calculator?",
          "acceptedAnswer": { "@type": "Answer", "text": "You can move every control and see the calculator work for free. To reveal your exact savings breakdown we ask for your name and work email so we can send it to you." }
        },
        {
          "@type": "Question",
          "name": "What does the funded percentage mean?",
          "acceptedAnswer": { "@type": "Answer", "text": "It's how much of your invoice volume you actually finance. A traditional factor takes all of it — 100% — and charges its rate on every dollar. Movik lets you pick, so you only pay the rate on the portion you chose to advance." }
        },
        {
          "@type": "Question",
          "name": "Where does the 2% rate come from?",
          "acceptedAnswer": { "@type": "Answer", "text": "It's a standard factoring rate used here so both sides of the comparison are measured the same way. The point of the calculator is the volume you finance, not the rate. Your actual rate depends on your carrier profile." }
        }
```

- [ ] **Step 3: Update the hero subtitle**

Line 145, replace the paragraph text with:

```
      Same invoices, same rate — you just stop financing 100% of them by default. Move the slider and watch what you keep.
```

- [ ] **Step 4: Update the on-page FAQ**

In the FAQ section (lines 269-283), replace the three question labels and three answer bodies so they match the JSON-LD exactly:

- `toggleFaq(0)` question: `Do I have to give my email to use the calculator?`
- `faq-body-0` answer: `You can move every control and see the calculator work for free. To reveal your exact savings breakdown we ask for your name and work email so we can send it to you.`
- `toggleFaq(1)` question: `What does the funded percentage mean?`
- `faq-body-1` answer: `It's how much of your invoice volume you actually finance. A traditional factor takes all of it — 100% — and charges its rate on every dollar. Movik lets you pick, so you only pay the rate on the portion you chose to advance.`
- `toggleFaq(2)` question: `Where does the 2% rate come from?`
- `faq-body-2` answer: `It's a standard factoring rate used here so both sides of the comparison are measured the same way. The point of the calculator is the volume you finance, not the rate. Your actual rate depends on your carrier profile.`

Keep every surrounding attribute — the `id`, the inline styles, the chevron `<svg>` — exactly as it is. Only the text nodes change.

- [ ] **Step 5: Verify no stale claims and valid JSON-LD**

```bash
node -e "
const h=require('fs').readFileSync('calculator-landing/index.html','utf8');
const banned=[/no sign-?up/i,/ACH/,/yearly/i,/three numbers/i];
const hits=banned.filter(r=>r.test(h)).map(r=>r.toString());
if(hits.length)throw new Error('stale copy remains: '+hits.join(', '));
const m=h.match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/);
if(!m)throw new Error('no JSON-LD block');
const g=JSON.parse(m[1]);
const faq=g['@graph'].find(n=>n['@type']==='FAQPage');
if(faq.mainEntity.length!==3)throw new Error('expected 3 FAQ entries');
faq.mainEntity.forEach(q=>{
  if(!h.includes(q.name))throw new Error('question not on page: '+q.name);
  if(!h.includes(q.acceptedAnswer.text))throw new Error('answer not on page: '+q.name);
});
console.log('copy and JSON-LD OK; FAQ matches page');
"
```

Expected: `copy and JSON-LD OK; FAQ matches page`

- [ ] **Step 6: Commit**

```bash
git add calculator-landing/index.html
git commit -m "Rewrite copy, metadata and FAQ for the savings calculator and its gate"
```

---

### Task 7: Dead CSS cleanup and browser verification

**Files:**
- Modify: `calculator-landing/index.html:106` (remove the now-dead `.yearly-num` rule)

**Interfaces:**
- Consumes: everything from Tasks 1-6.
- Produces: nothing.

- [ ] **Step 1: Remove the dead rule**

The `.yearly-num` class only existed on the two big yearly-total cards, which Task 4 deleted. Inside the `@media (max-width:760px)` block, delete this line:

```css
      .yearly-num{font-size:38px!important}
```

- [ ] **Step 2: Confirm no orphaned class references**

```bash
node -e "
const h=require('fs').readFileSync('calculator-landing/index.html','utf8');
if(h.includes('yearly-num'))throw new Error('yearly-num still referenced');
const css=h.slice(h.indexOf('<style>'),h.indexOf('</style>'));
const body=h.slice(h.indexOf('</style>'));
['seg-btn','tick','bar-fill-brand','is-locked','gate-input','live-dot','btn-primary','btn-ghost','calc-label','with-suffix-word'].forEach(c=>{
  if(!css.includes('.'+c))throw new Error('CSS rule missing for .'+c);
  if(!body.includes(c))throw new Error('class defined but never used: '+c);
});
console.log('CSS clean');
"
```

Expected: `CSS clean`

- [ ] **Step 3: Serve the page**

```bash
cd "calculator-landing" && python -m http.server 8788
```

Open `http://localhost:8788/` in a browser. The `file://` protocol is not good enough — `localStorage` and the video both behave differently there.

- [ ] **Step 4: Walk the verification checklist**

Confirm each of these by hand. Every one comes from the spec's verification section.

1. Typing in the volume field inserts commas and the caret stays put — click between the `1` and the first `0` of `100,000`, type `5`, and confirm the caret sits right after the `5`.
2. Dragging the slider shrinks the purple bar and updates all three numbers live, with no button press.
3. Clicking the `90%` tick jumps the slider there and turns that tick purple and bold.
4. With the trucks field empty the per-truck line is hidden; typing `12` reveals `≈ $50 saved per truck, per month` at 70% and $100,000 volume.
5. The results panel starts blurred, and text inside it cannot be selected or copied.
6. Clicking "See my exact savings →" swaps the button for the form. Submitting with an empty name and `bad@` shows the red error text and red borders on both fields, and the results stay blurred.
7. Submitting `Carlos` / `carlos@onestopdb.us` unblurs the results and swaps in the WhatsApp CTA reading "Talk to our team about switching →".
8. In the console, `JSON.parse(localStorage.getItem('movik_calc_leads'))` returns an array whose last entry has `source: 'movik-savings-calculator'`, the right `estimatedMonthlySavings`, and a `timestamp`.
9. Reloading the page returns the results to blurred, and the stored leads array still holds the previous entry.
10. Switching to Annual with volume `1,200,000` produces the same `$2,000/mo` traditional figure as Monthly at `100,000`.
11. Clicking "No, not yet" changes the top bar's label to "Market-standard factor (100% financed)" and leaves the numbers unchanged.
12. At 375px width, both grids stack to one column, the segmented buttons stay readable, and nothing scrolls horizontally.
13. The hero video still plays and loops, the nav still darkens on scroll, and the FAQ accordions still open and close.
14. The browser console shows no errors.

- [ ] **Step 5: Stop the server and commit**

Stop the server with Ctrl+C, then:

```bash
git add calculator-landing/index.html
git commit -m "Remove dead yearly-num rule after results block replacement"
```

- [ ] **Step 6: Refresh the deploy copy**

`deploy/` is gitignored and is not updated automatically. Mirror the new files so the next deploy carries them:

```bash
cp calculator-landing/calc.js deploy/movik-landing/calculator/calc.js
cp calculator-landing/index.html deploy/movik-landing/calculator/index.html
```

Confirm both landed:

```bash
ls -l deploy/movik-landing/calculator/
```

Expected: `calc.js` and `index.html` both present, with today's timestamp.

---

## Notes for the implementer

- `calculator-landing/Movik Savings Calculator (standalone).html` is the reference artifact. Leave it in place — it is the source of truth for the design and is worth keeping for comparison. It is currently untracked; do not commit it as part of this work.
- The page is wrapped in `<x-dc>` and driven by `support.js`. The existing `class Component extends DCLogic` block at the end of the file owns the nav scroll behavior, the `[data-reveal]` observer and the hero video. Do not touch it — the new controller is a plain IIFE that runs alongside it.
- `calc.test.js` ships next to the page. It is a few KB of plain JS, never referenced by `index.html`, and harmless if it reaches the server. If that bothers you, exclude it at the deploy copy step rather than deleting it.
