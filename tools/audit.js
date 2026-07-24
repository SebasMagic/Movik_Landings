/* Rigorous pre-handoff audit of the deployed pages. Read-only. */
const fs = require('fs');
const path = require('path');

const DEPLOY = path.join(__dirname, '..', 'deploy', 'movik-landing');
const PAGES = [
  ['/',                          'index.html'],
  ['/carriers/',                 'carriers/index.html'],
  ['/es/carriers/',              'es/carriers/index.html'],
  ['/brokers/',                  'brokers/index.html'],
  ['/es/brokers/',               'es/brokers/index.html'],
  ['/escape-guide/',             'escape-guide/index.html'],
  ['/es/escape-guide/',          'es/escape-guide/index.html'],
  ['/factoring-calculator/',     'factoring-calculator/index.html'],
  ['/es/factoring-calculator/',  'es/factoring-calculator/index.html']
];

const R = { reset: '\x1b[0m', red: '\x1b[31m', grn: '\x1b[32m', yel: '\x1b[33m', dim: '\x1b[2m', bold: '\x1b[1m' };
const mark = ok => ok ? `${R.grn}✓${R.reset}` : `${R.red}✗${R.reset}`;
const warn = `${R.yel}⚠${R.reset}`;

const issues = [];
function flag(page, sev, msg) { issues.push({ page, sev, msg }); }

function meta(head, key) {
  const re = new RegExp(`<meta[^>]+(?:name|property)="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*content="([^"]*)"`, 'i');
  const m = head.match(re); return m ? m[1] : null;
}
function tag(head, re) { const m = head.match(re); return m ? m[1] : null; }

console.log(`${R.bold}\n═══ SEO / HEAD ═══${R.reset}\n`);
const titles = {}, descs = {};

for (const [url, file] of PAGES) {
  const full = path.join(DEPLOY, file);
  if (!fs.existsSync(full)) { flag(url, 'ERR', 'file missing: ' + file); console.log(`${mark(false)} ${url} — MISSING`); continue; }
  const html = fs.readFileSync(full, 'utf8');
  const head = html.slice(0, html.indexOf('</head>') + 7);

  const lang = tag(html, /<html lang="([^"]+)"/);
  const title = tag(head, /<title>([^<]*)<\/title>/);
  const desc = meta(head, 'description');
  const canon = tag(head, /<link rel="canonical"[^>]*href="([^"]+)"/);
  const ogTitle = meta(head, 'og:title');
  const ogImg = meta(head, 'og:image');
  const ogUrl = meta(head, 'og:url');
  const twCard = meta(head, 'twitter:card');
  const ld = /application\/ld\+json/.test(head);
  const hreflang = (head.match(/hreflang="[a-z-]+"/g) || []).length;
  const viewport = /name="viewport"/.test(head);
  const charset = /<meta charset/i.test(head);
  const h1s = (html.match(/<h1\b/g) || []).length;

  // checks
  if (!lang) flag(url, 'ERR', 'no <html lang>');
  if (!title) flag(url, 'ERR', 'no <title>');
  else {
    if (title.length > 60) flag(url, 'WARN', `title ${title.length} chars (>60, may truncate in SERP)`);
    if (title.length < 15) flag(url, 'WARN', `title only ${title.length} chars`);
    (titles[title] = titles[title] || []).push(url);
  }
  if (!desc) flag(url, 'ERR', 'no meta description');
  else {
    if (desc.length > 160) flag(url, 'WARN', `description ${desc.length} chars (>160)`);
    if (desc.length < 70) flag(url, 'WARN', `description only ${desc.length} chars (thin)`);
    (descs[desc] = descs[desc] || []).push(url);
  }
  if (!canon) flag(url, 'ERR', 'no canonical');
  if (!ogTitle) flag(url, 'WARN', 'no og:title');
  if (!ogImg) flag(url, 'WARN', 'no og:image');
  if (!twCard) flag(url, 'WARN', 'no twitter:card');
  if (!ld) flag(url, 'WARN', 'no JSON-LD');
  if (!viewport) flag(url, 'ERR', 'no viewport meta');
  if (!charset) flag(url, 'ERR', 'no charset');
  if (h1s === 0) flag(url, 'ERR', 'no <h1>');
  if (h1s > 1) flag(url, 'WARN', `${h1s} <h1> tags (should be 1)`);

  // lang consistency
  const esUrl = url.startsWith('/es/');
  if (esUrl && lang !== 'es') flag(url, 'ERR', `ES url but lang="${lang}"`);
  if (!esUrl && url !== '/' && lang !== 'en') flag(url, 'ERR', `EN url but lang="${lang}"`);

  // canonical should match final movik.us url
  const expected = 'https://movik.us' + url;
  if (canon && canon !== expected && url !== '/') flag(url, 'WARN', `canonical ${canon} != ${expected}`);

  console.log(`${mark(!!title && !!desc && !!canon && h1s === 1 && !!viewport)} ${R.bold}${url}${R.reset}`);
  console.log(`   lang=${lang}  h1=${h1s}  title=${title ? title.length : '—'}c  desc=${desc ? desc.length : '—'}c  canon=${canon ? 'y' : 'n'}  og=${ogTitle ? 'y' : 'n'}/${ogImg ? 'y' : 'n'}  tw=${twCard ? 'y' : 'n'}  ld=${ld ? 'y' : 'n'}  hreflang=${hreflang}`);
}

// duplicate titles / descriptions across pages
console.log(`${R.bold}\n═══ DUPLICATE TITLES / DESCRIPTIONS ═══${R.reset}\n`);
for (const [t, urls] of Object.entries(titles)) if (urls.length > 1) { flag(urls.join(','), 'ERR', `duplicate <title>: "${t.slice(0,50)}…"`); console.log(`${mark(false)} same title on ${urls.join(', ')}`); }
for (const [d, urls] of Object.entries(descs)) if (urls.length > 1) { flag(urls.join(','), 'ERR', `duplicate description`); console.log(`${mark(false)} same description on ${urls.join(', ')}`); }
if (!Object.values(titles).some(u => u.length > 1) && !Object.values(descs).some(u => u.length > 1)) console.log(`${mark(true)} all titles and descriptions unique`);

// heading hierarchy per page
console.log(`${R.bold}\n═══ HEADING HIERARCHY ═══${R.reset}\n`);
for (const [url, file] of PAGES) {
  const full = path.join(DEPLOY, file);
  if (!fs.existsSync(full)) continue;
  const html = fs.readFileSync(full, 'utf8');
  const levels = [];
  for (const m of html.matchAll(/<h([1-6])\b/g)) levels.push(+m[1]);
  let jump = null, prev = 0;
  for (const l of levels) { if (prev && l > prev + 1) { jump = `h${prev}→h${l}`; break; } prev = l; }
  const counts = [1,2,3,4,5,6].map(n => levels.filter(l => l === n).length);
  if (jump) flag(url, 'WARN', `heading jump ${jump}`);
  console.log(`${mark(!jump)} ${url.padEnd(28)} h1-6: [${counts.join(' ')}]${jump ? '  ' + warn + ' jump ' + jump : ''}`);
}

// every local asset a page references must exist in the deploy output.
// Catches absolute movik.us URLs used for images that must resolve on staging too.
console.log(`${R.bold}\n═══ LOCAL ASSETS ═══${R.reset}\n`);
for (const [url, file] of PAGES) {
  const full = path.join(DEPLOY, file);
  if (!fs.existsSync(full)) continue;
  const html = fs.readFileSync(full, 'utf8');
  const dir = path.dirname(full);
  const refs = new Set();
  for (const m of html.matchAll(/(?:href|src)="(?!https?:|#|mailto:|tel:|data:)([^"]+)"/g)) refs.add(m[1]);
  for (const m of html.matchAll(/url\('([^']+)'\)/g)) if (!/^(data:|https?:)/.test(m[1])) refs.add(m[1]);

  const missing = [...refs].filter(r => {
    const rel = decodeURIComponent(r.replace(/^\.\//, '').split(/[?#]/)[0]);
    if (!rel) return false;
    // page-to-page links resolve to a directory's index.html
    const base = rel.startsWith('/') ? path.join(DEPLOY, rel) : path.join(dir, rel);
    return !(fs.existsSync(base) || fs.existsSync(path.join(base, 'index.html')));
  });
  for (const m of missing) flag(url, 'ERR', `broken local reference: ${m}`);
  console.log(`${mark(!missing.length)} ${url.padEnd(28)} ${refs.size} refs${missing.length ? '  ' + warn + ' ' + missing.join(', ') : ''}`);
}

// summary
console.log(`${R.bold}\n═══ ISSUES ═══${R.reset}\n`);
const errs = issues.filter(i => i.sev === 'ERR'), warns = issues.filter(i => i.sev === 'WARN');
for (const i of errs) console.log(`${R.red}ERR ${R.reset} ${i.page.padEnd(28)} ${i.msg}`);
for (const i of warns) console.log(`${R.yel}WARN${R.reset} ${i.page.padEnd(28)} ${i.msg}`);
console.log(`\n${errs.length ? R.red : R.grn}${errs.length} errors${R.reset}, ${warns.length ? R.yel : R.grn}${warns.length} warnings${R.reset}`);
