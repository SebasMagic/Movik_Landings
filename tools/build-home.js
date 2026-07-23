/*
 * Build the homepage hub into a static EN and ES page.
 *
 * The home is special: its URLs are the site root (/ and /es/), not /<slug>/,
 * so it can't ride the generic i18n pipeline. English is the source
 * (home-landing/index.html), i18n/home.es.json translates it by data-i18n key,
 * and the ES page rewrites its internal links to their /es/ counterparts.
 *
 *   node tools/build-home.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'home-landing/index.html');
const OUT = path.join(ROOT, 'home-landing/dist');
const dict = JSON.parse(fs.readFileSync(path.join(ROOT, 'i18n/home.es.json'), 'utf8'));

const EN = 'https://movik.us/';
const ES = 'https://movik.us/es/';
const hreflang =
  `<link rel="alternate" hreflang="en" href="${EN}">\n` +
  `<link rel="alternate" hreflang="es" href="${ES}">\n` +
  `<link rel="alternate" hreflang="x-default" href="${EN}">`;

/** Replace the inner content of every element carrying data-i18n[-html]. */
function applyDict(html) {
  return html.replace(
    /(<(\w+)\b[^>]*\bdata-i18n(-html)?="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
    (m, open, tag, isHtml, key, _inner, close) =>
      dict[key] === undefined ? m : open + dict[key] + close
  );
}

const src = fs.readFileSync(SRC, 'utf8');

// ── English: source + reciprocal hreflang ──
let en = src.replace(/<link rel="canonical"[^>]*>/, m => `${m}\n${hreflang}`);
// mark EN toggle active, ES inactive
en = en.replace(/(<a href="\/" hreflang="en")[^>]*>/, '$1 aria-current="true" style="background:#8236FC;color:#fff">');

// ── Spanish: translate, re-home to /es/, rewrite internal links & metadata ──
let es = applyDict(src);
es = es.replace(/<html lang="en">/, '<html lang="es">');

// head metadata (no data-i18n on <head>, so patch by tag)
es = es.replace(/<title>[^<]*<\/title>/, `<title>${dict._title}</title>`);
const setMeta = (h, key, val) => h.replace(
  new RegExp(`(<meta[^>]+(?:name|property)="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*content=")[^"]*(")`, 'i'),
  `$1${val}$2`);
es = setMeta(es, 'description', dict._description);
es = setMeta(es, 'og:title', dict._ogTitle);
es = setMeta(es, 'og:description', dict._ogDescription);
es = setMeta(es, 'og:image:alt', dict._imageAlt);
es = setMeta(es, 'twitter:title', dict._ogTitle);
es = setMeta(es, 'twitter:description', dict._ogDescription);
es = setMeta(es, 'twitter:image', 'https://movik.us/carriers/uploads/hero-truck-poster.jpg');
es = setMeta(es, 'og:locale', 'es_US');
es = setMeta(es, 'og:locale:alternate', 'en_US');

// canonical + og:url to /es/, then hreflang
es = es.replace(/(<link rel="canonical" href=")https:\/\/movik\.us\/(">)/, `$1${ES}$2`);
es = es.replace(/(<meta property="og:url" content=")https:\/\/movik\.us\/(">)/, `$1${ES}$2`);
es = es.replace(/<link rel="canonical"[^>]*>/, m => `${m}\n${hreflang}`);

// JSON-LD urls
es = es.replace(/("url":\s*")https:\/\/movik\.us\/(")/g, `$1${ES}$2`);

// internal links: EN paths -> /es/ paths (but not the language toggle or wa.me)
for (const slug of ['carriers', 'brokers', 'factoring-calculator', 'escape-guide']) {
  es = es.split(`href="/${slug}/"`).join(`href="/es/${slug}/"`);
}
// language toggle: ES active, and EN link points to root /
es = es.replace(/<a href="\/" hreflang="en"[^>]*>/, '<a href="/" hreflang="en" style="color:rgba(255,255,255,.5)">');
es = es.replace(/(<a href="\/es\/" hreflang="es")[^>]*>/, '$1 aria-current="true" style="background:#8236FC;color:#fff">');

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'home-ENG.html'), en);
fs.writeFileSync(path.join(OUT, 'home-ESP.html'), es);
console.log('home: -> dist/home-ENG.html, dist/home-ESP.html');
