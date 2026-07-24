/*
 * i18n build for the Movik landings.
 *
 * Source of truth is the English HTML. A per-page JSON map (i18n/<page>.es.json)
 * translates it string by string; this script emits a fully static Spanish page,
 * so crawlers see real text instead of JavaScript-rendered content.
 *
 *   node tools/i18n.js extract <file>          list translatable strings
 *   node tools/i18n.js build   <page>          emit ENG + ESP files
 *   node tools/i18n.js check   <page>          report untranslated strings
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// attributes whose values are user-visible and must travel
const ATTRS = ['placeholder', 'alt', 'title', 'aria-label'];
// <meta> names/properties whose content is user-visible
const META = ['description', 'og:title', 'og:description', 'og:image:alt', 'twitter:title', 'twitter:description'];

const SKIP = /^[\s\d.,:;|/\\—·•●✓+%$()\[\]{}<>-]*$/; // punctuation / numbers only

/** Blank out <script> and <style> bodies so their contents are never treated as copy. */
function maskCode(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, m => ' '.repeat(m.length))
    .replace(/<style\b[\s\S]*?<\/style>/gi, m => ' '.repeat(m.length));
}

/** Every translatable span in the file: {start, end, text, kind}. */
function findStrings(html) {
  const masked = maskCode(html);
  const out = [];

  // 1. text nodes
  const textRe = />([^<>]+)</g;
  let m;
  while ((m = textRe.exec(masked)) !== null) {
    const raw = m[1];
    if (!raw.trim() || SKIP.test(raw)) continue;
    const lead = raw.length - raw.trimStart().length;
    out.push({
      start: m.index + 1 + lead,
      end: m.index + 1 + lead + raw.trim().length,
      text: raw.trim(),
      kind: 'text'
    });
  }

  // 2. visible attributes
  for (const a of ATTRS) {
    const re = new RegExp(`\\b${a}="([^"]*)"`, 'g');
    while ((m = re.exec(masked)) !== null) {
      if (!m[1].trim() || SKIP.test(m[1])) continue;
      const s = m.index + m[0].indexOf('"') + 1;
      out.push({ start: s, end: s + m[1].length, text: m[1], kind: a });
    }
  }

  // 3. <title>
  const t = masked.match(/<title>([^<]+)<\/title>/);
  if (t) {
    const s = masked.indexOf(t[1], masked.indexOf('<title>'));
    out.push({ start: s, end: s + t[1].length, text: t[1], kind: 'title' });
  }

  // 4. meta content
  for (const name of META) {
    const re = new RegExp(`<meta[^>]+(?:name|property)="${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*content="([^"]*)"`, 'gi');
    while ((m = re.exec(masked)) !== null) {
      const s = m.index + m[0].lastIndexOf('content="') + 9;
      out.push({ start: s, end: s + m[1].length, text: m[1], kind: 'meta:' + name });
    }
  }

  return out.sort((a, b) => a.start - b.start);
}

/** Rewrite the file, replacing each found span via map. Returns {html, missing}. */
function translate(html, map) {
  const spans = findStrings(html);
  const missing = [];
  let out = '';
  let cursor = 0;
  for (const s of spans) {
    if (s.start < cursor) continue; // overlapping match, skip
    const to = map[s.text];
    if (to === undefined) {
      if (!missing.includes(s.text)) missing.push(s.text);
    }
    out += html.slice(cursor, s.start) + (to !== undefined ? to : html.slice(s.start, s.end));
    cursor = s.end;
  }
  out += html.slice(cursor);
  return { html: out, missing };
}

const PAGES = {
  carriers:    { src: 'carriers-landing/index.html', slug: 'carriers' },
  brokers:     { src: 'broker-landing/index.html',   slug: 'brokers' },
  calculator:  { src: 'calculator-landing/index.html', slug: 'factoring-calculator' }
};

function mapPath(page) { return path.join(ROOT, 'i18n', page + '.es.json'); }

function loadMap(page) {
  const p = mapPath(page);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
}

const [, , cmd, arg] = process.argv;

if (cmd === 'extract') {
  const html = fs.readFileSync(path.join(ROOT, arg), 'utf8');
  const seen = new Set();
  for (const s of findStrings(html)) {
    if (seen.has(s.text)) continue;
    seen.add(s.text);
    console.log(JSON.stringify(s.text) + ': "",');
  }
  console.error(`\n${seen.size} unique strings`);
} else if (cmd === 'build' || cmd === 'check') {
  const pages = arg ? [arg] : Object.keys(PAGES);
  let failed = 0;
  for (const page of pages) {
    const cfg = PAGES[page];
    if (!cfg) { console.error('unknown page: ' + page); process.exit(1); }
    const src = fs.readFileSync(path.join(ROOT, cfg.src), 'utf8');
    const map = loadMap(page);
    const { html, missing } = translate(src, map);

    const total = new Set(findStrings(src).map(s => s.text)).size;
    const done = total - missing.length;
    console.log(`${page}: ${done}/${total} translated` + (missing.length ? `  — ${missing.length} MISSING` : '  ✓'));
    if (missing.length) {
      failed++;
      for (const s of missing.slice(0, 12)) console.log('    · ' + JSON.stringify(s));
      if (missing.length > 12) console.log(`    … +${missing.length - 12} more`);
    }

    if (cmd === 'build') {
      const dir = path.join(ROOT, path.dirname(cfg.src), 'dist');
      fs.mkdirSync(dir, { recursive: true });
      // hreflang must be reciprocal: BOTH pages carry the same trio, or Google
      // ignores the annotation entirely and treats the languages as unrelated.
      fs.writeFileSync(path.join(dir, `${cfg.slug}-ENG.html`), withHreflang(src, cfg.slug));
      fs.writeFileSync(path.join(dir, `${cfg.slug}-ESP.html`), localize(html, cfg.slug));
      console.log(`    -> dist/${cfg.slug}-ENG.html, dist/${cfg.slug}-ESP.html`);
    }
  }
  process.exit(failed && cmd === 'check' ? 1 : 0);
} else {
  console.log('usage: node tools/i18n.js extract <file> | build [page] | check [page]');
}

/**
 * EN/ES switcher for the nav. Injected at the <!--LANG-TOGGLE--> marker AFTER
 * translation, so its "EN"/"ES" labels never reach the string extractor and
 * never need a dictionary entry. Real links, not a JS swap: each language is
 * its own indexable URL.
 */
function langToggle(slug, active) {
  const item = (code, href) => {
    const on = code === active;
    return `<a href="${href}" hreflang="${code}"${on ? ' aria-current="true"' : ''} ` +
      `style="font-size:12px;font-weight:700;letter-spacing:.06em;padding:5px 10px;border-radius:6px;` +
      `text-decoration:none;background:${on ? '#8236FC' : 'transparent'};` +
      `color:${on ? '#fff' : 'rgba(255,255,255,.5)'};">${code.toUpperCase()}</a>`;
  };
  return '<div style="display:flex;gap:2px;padding:3px;border-radius:9px;' +
    'border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);">' +
    item('en', `/${slug}/`) + item('es', `/es/${slug}/`) + '</div>';
}

function injectToggle(html, slug, active) {
  return html.replace('<!--LANG-TOGGLE-->', langToggle(slug, active));
}

/** The reciprocal hreflang trio for a slug — identical on both language pages. */
function hreflangBlock(slug) {
  const en = `https://movik.us/${slug}/`;
  const es = `https://movik.us/es/${slug}/`;
  return `<link rel="alternate" hreflang="en" href="${en}">\n` +
         `<link rel="alternate" hreflang="es" href="${es}">\n` +
         `<link rel="alternate" hreflang="x-default" href="${en}">\n`;
}

// Append the hreflang trio right after the canonical tag. Newline-agnostic on
// purpose: git normalises these sources to CRLF, so a `>\n` match would silently
// miss and ship pages with no hreflang.
function injectHreflang(html, slug) {
  return html.replace(/<link rel="canonical"[^>]*>/, m => `${m}\n${hreflangBlock(slug).trimEnd()}`);
}

/** English page: source markup + reciprocal hreflang + toggle set to EN. */
function withHreflang(html, slug) {
  return injectToggle(injectHreflang(html, slug), slug, 'en');
}

/** Spanish page: lang attr, canonical/og:url under /es/, hreflang, toggle on ES. */
function localize(html, slug) {
  const en = `https://movik.us/${slug}/`;
  const es = `https://movik.us/es/${slug}/`;
  const s = html
    .replace(/<html lang="[^"]*">/, '<html lang="es">')
    .split(en).join(es);
  return injectToggle(injectHreflang(s, slug), slug, 'es');
}

module.exports = { findStrings, translate };
