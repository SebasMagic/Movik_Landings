/*
 * Assemble deploy/movik-landing/ from the built dist/ files.
 *
 * URLs must end in a directory so they stay clean (movik.us/carriers/, not
 * movik.us/carriers/carriers-ENG.html), so each language file lands as
 * index.html inside its folder. The ENG/ESP names live in dist/, where you
 * open and review them.
 *
 *   English : /<slug>/
 *   Spanish : /es/<slug>/
 *
 *   node tools/deploy-staging.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DEPLOY = path.join(ROOT, 'deploy/movik-landing');

const PAGES = [
  { slug: 'carriers',             dist: 'carriers-landing/dist',     assets: 'carriers-landing' },
  { slug: 'brokers',              dist: 'broker-landing/dist',       assets: 'broker-landing' },
  { slug: 'escape-guide',         dist: 'escape-guide-landing/dist', assets: 'escape-guide-landing' },
  { slug: 'factoring-calculator', dist: 'calculator-landing/dist',   assets: 'calculator-landing',
    extra: ['calc.js'] }
];

// files every page folder needs beside index.html
const SHARED = ['support.js', 'logo movik favicon.png'];

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (e.isDirectory()) copyDir(path.join(from, e.name), path.join(to, e.name));
    else fs.copyFileSync(path.join(from, e.name), path.join(to, e.name));
  }
}

/*
 * Root-level files. These live in site-root/ because deploy/ is gitignored —
 * anything kept only there is lost on a fresh clone, including the noindex
 * protection in vercel.json.
 */
const ROOT_FILES = [
  ['site-root/index.html', 'index.html'],
  ['site-root/support.js', 'support.js'],
  ['site-root/logo movik favicon.png', 'logo movik favicon.png'],
  ['site-root/vercel.staging.json', 'vercel.json'],
  ['site-root/robots.staging.txt', 'robots.txt']
];

fs.mkdirSync(DEPLOY, { recursive: true });
for (const [from, to] of ROOT_FILES) {
  const src = path.join(ROOT, from);
  if (!fs.existsSync(src)) { console.error(`missing root file: ${from}`); process.exit(1); }
  fs.copyFileSync(src, path.join(DEPLOY, to));
}

// sitemap.xml and llms.txt stay OUT of staging on purpose — the site is noindex
// until it moves to movik.us. See docs/STAGING-README.txt.
for (const f of ['sitemap.xml', 'llms.txt']) {
  const stale = path.join(DEPLOY, f);
  if (fs.existsSync(stale)) fs.unlinkSync(stale);
}

const report = [];

for (const { slug, dist, assets, extra = [] } of PAGES) {
  for (const [lang, suffix] of [['en', 'ENG'], ['es', 'ESP']]) {
    const srcFile = path.join(ROOT, dist, `${slug}-${suffix}.html`);
    if (!fs.existsSync(srcFile)) { console.error('missing build: ' + srcFile); process.exit(1); }

    const outDir = lang === 'en'
      ? path.join(DEPLOY, slug)
      : path.join(DEPLOY, 'es', slug);
    fs.mkdirSync(outDir, { recursive: true });

    let html = fs.readFileSync(srcFile, 'utf8');

    // Spanish pages sit one level deeper; point their heavy assets at the
    // English folder instead of shipping a second copy of the PDFs.
    if (lang === 'es') {
      html = html.replace(/(?:href|src)="uploads\//g, m => m.replace('uploads/', `/${slug}/uploads/`));
      html = html.replace(/url\('uploads\//g, `url('/${slug}/uploads/`);
    }

    fs.writeFileSync(path.join(outDir, 'index.html'), html);

    for (const f of [...SHARED, ...extra]) {
      const src = path.join(ROOT, assets, f);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(outDir, f));
      else if (extra.includes(f)) { console.error(`missing required asset: ${assets}/${f}`); process.exit(1); }
    }

    // uploads only live with the English page
    const up = path.join(ROOT, assets, 'uploads');
    if (lang === 'en' && fs.existsSync(up)) copyDir(up, path.join(outDir, 'uploads'));

    report.push({
      url: lang === 'en' ? `/${slug}/` : `/es/${slug}/`,
      from: `${slug}-${suffix}.html`,
      kb: Math.round(html.length / 1024)
    });
  }
}

console.table(report);
