/*
 * Build the escape-guide landing into two fully static pages, one per language.
 *
 * The source page is Spanish HTML plus a JS dictionary that swaps text on a
 * toggle, and it renders the steps / outline / ticker from JavaScript into empty
 * containers. Crawlers may never run that JS, so this script:
 *
 *   1. applies each language's dictionary to the static markup,
 *   2. pre-renders the JS-built sections by calling the page's OWN render
 *      functions in a stub DOM, so the static markup cannot drift from runtime,
 *   3. turns the ES/EN toggle into real links between the two URLs,
 *   4. pins the language and wires canonical / og:url / hreflang / PDF per page.
 *
 *   node tools/build-escape-guide.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'escape-guide-landing/index.html');
const OUT = path.join(ROOT, 'escape-guide-landing/dist');

const URLS = {
  en: 'https://movik.us/escape-guide/',
  es: 'https://movik.us/es/escape-guide/'
};
const PATHS = { en: '/escape-guide/', es: '/es/escape-guide/' };

const src = fs.readFileSync(SRC, 'utf8');

/*
 * English <head>. The source head is Spanish and carries no data-i18n hooks, so
 * the body dictionary never reached it. These are applied as targeted per-tag
 * edits: a plain string-swap map re-processes its own output and reverts paired
 * values (es_US -> en_US -> es_US).
 *
 * The two guides are different documents, not translations: the Spanish PDF has
 * 8 sections, the English one is a 5-section playbook. numberOfPages follows.
 */
const EN_HEAD = {
  title: 'Factoring Escape Guide — Leave Your Factor Without Losing Cash Flow | Movik',
  description: 'Free guide for carriers: how to leave your factoring contract without losing a single day of cash. Read the contract, do the math, switch clean. Sent on WhatsApp in 1 minute.',
  ogTitle: 'How to Escape Your Factoring Contract — Free Guide | Movik',
  ogDescription: 'Read your contract. Do the math. Switch without losing a paycheck. Free guide, sent on WhatsApp.',
  twitterDescription: 'Read your contract. Do the math. Switch without losing a paycheck.',
  imageAlt: 'Movik semi truck on the highway',
  ldName: 'Factoring Escape Guide',
  ldAlternate: 'Guia de Escape del Factoring',
  ldDescription: 'A short playbook for carriers leaving a factoring contract: what the contract hides, the five myths that keep you stuck, a checklist to read it, the honest stay-vs-leave math, and how to switch without losing cash flow.',
  ldPages: 5
};

/** Set a <meta> content= by its name= or property= key. */
function setMeta(head, key, value) {
  const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(<meta[^>]+(?:name|property)="${esc}"[^>]*content=")[^"]*(")`, 'i');
  return head.replace(re, `$1${value}$2`);
}

/** Translate the <head> for the English build. */
function localizeHead(html) {
  const cut = html.indexOf('</head>');
  let h = html.slice(0, cut);
  const t = EN_HEAD;

  h = h.replace(/<title>[^<]*<\/title>/, `<title>${t.title}</title>`);
  h = setMeta(h, 'description', t.description);
  h = setMeta(h, 'og:title', t.ogTitle);
  h = setMeta(h, 'og:description', t.ogDescription);
  h = setMeta(h, 'og:image:alt', t.imageAlt);
  h = setMeta(h, 'twitter:title', t.ogTitle);
  h = setMeta(h, 'twitter:description', t.twitterDescription);
  h = setMeta(h, 'og:locale', 'en_US');
  h = setMeta(h, 'og:locale:alternate', 'es_US');

  // JSON-LD: only the Book node, so the Organization node's name is left alone
  h = h.replace(/("@type":\s*"Book",[\s\S]*?)"name":\s*"[^"]*"/, `$1"name": "${t.ldName}"`);
  h = h.replace(/"alternateName":\s*"[^"]*"/, `"alternateName": "${t.ldAlternate}"`);
  h = h.replace(/"numberOfPages":\s*\d+/, `"numberOfPages": ${t.ldPages}`);
  h = h.replace(/("@type":\s*"Book",[\s\S]*?)"description":\s*"[^"]*"/, `$1"description": "${t.ldDescription}"`);

  return h + html.slice(cut);
}

// ── pull the page's own script out and run it in a stub DOM ──────────────────
const inline = src.match(/<script>\n([\s\S]*?)<\/script>/)[1];

function renderFor(lang) {
  const captured = {};
  const node = id => ({
    set innerHTML(v) { captured[id] = v; },
    get innerHTML() { return captured[id] || ''; },
    href: '', value: '', options: [], selectedIndex: -1,
    setAttribute() {}, style: {}, textContent: ''
  });
  const sandbox = {
    console: { log() {} },
    location: { href: URLS[lang] },
    localStorage: { getItem: () => null, setItem() {} },
    navigator: { language: lang },
    window: {},
    document: {
      documentElement: {},
      getElementById: id => node(id),
      querySelector: sel => node(sel),
      querySelectorAll: () => []
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(inline, sandbox);
  sandbox.LANG = lang;
  sandbox.renderSteps();
  sandbox.renderToc();
  sandbox.renderTicker();
  sandbox.renderMonths();
  return { captured, I18N: sandbox.I18N, PDF: sandbox.PDF_BY_LANG[lang] };
}

/** Replace the inner content of any element carrying data-i18n[-html]. */
function applyDict(html, dict) {
  return html.replace(
    /(<(\w+)\b[^>]*\bdata-i18n(-html)?="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
    (m, open, tag, isHtml, key, _inner, close) => {
      const v = dict[key];
      return v === undefined ? m : open + v + close;
    }
  );
}

/** Fill a container the JS would have rendered into. */
function fill(html, selector, markup) {
  const re = new RegExp(`(${selector}[^>]*>)([\\s\\S]*?)(</div>)`);
  return html.replace(re, (m, open, _old, close) => open + markup + close);
}

fs.mkdirSync(OUT, { recursive: true });

for (const lang of ['en', 'es']) {
  const { captured, I18N, PDF } = renderFor(lang);
  let h = src;

  // 1. static text in this language
  h = applyDict(h, I18N[lang]);
  if (lang === 'en') h = localizeHead(h);

  // 2. pre-render the JS-built sections
  h = fill(h, 'id="steps-grid"', captured['steps-grid'] || '');
  h = fill(h, 'class="toc-grid"', captured['.toc-grid'] || '');
  h = fill(h, 'id="ticker-track"', captured['ticker-track'] || '');

  // reveal animations start at opacity:0; without JS that content is invisible.
  // Pre-rendered markup ships visible and lets JS re-animate only if it runs.
  h = h.replace(/opacity:0;transform:translateY\(44px\);/g, '');

  // 3. language + canonical + hreflang
  h = h.replace(/<html lang="[^"]*">/, `<html lang="${lang}">`);
  h = h.split('https://movik-landing.vercel.app/escape-guide/').join(URLS[lang]);
  h = h.replace(
    /(<link rel="canonical"[^>]*>\n)/,
    `$1<link rel="alternate" hreflang="en" href="${URLS.en}">\n` +
    `<link rel="alternate" hreflang="es" href="${URLS.es}">\n` +
    `<link rel="alternate" hreflang="x-default" href="${URLS.en}">\n`
  );

  // 4. toggle becomes real navigation between the two URLs
  const btn = (code, active) =>
    `<a class="lang-btn" href="${PATHS[code]}" hreflang="${code}"` +
    (active ? ' aria-current="true"' : '') +
    ` style="text-decoration:none;background:${active ? '#8236FC' : 'transparent'};color:${active ? '#fff' : 'rgba(255,255,255,.5)'};">` +
    code.toUpperCase() + '</a>';
  h = h.replace(
    /<button class="lang-btn" data-lang-btn="es"[^>]*>ES<\/button>\s*<button class="lang-btn" data-lang-btn="en"[^>]*>EN<\/button>/,
    btn('es', lang === 'es') + '\n      ' + btn('en', lang === 'en')
  );

  // 5. pin the language: no localStorage, no browser sniffing, no re-swap
  h = h.replace(
    /let saved = null;[\s\S]*?setLang\(saved \|\| guess, !!saved\);/,
    `setLang('${lang}', false);`
  );
  h = h.replace(
    /document\.querySelectorAll\('\[data-lang-btn\]'\)\.forEach\(b => \{\s*b\.addEventListener\('click', \(\) => setLang\(b\.getAttribute\('data-lang-btn'\)\)\);\s*\}\);/,
    '// language is fixed per URL; the toggle is a link'
  );
  h = h.replace(/var LANG = 'es';/, `var LANG = '${lang}';`);

  // 6. this page's PDF
  h = h.replace(/href="uploads\/[^"]*\.pdf"/, `href="${PDF}"`);

  const file = path.join(OUT, `escape-guide-${lang === 'en' ? 'ENG' : 'ESP'}.html`);
  fs.writeFileSync(file, h);
  console.log(`${lang}: -> dist/${path.basename(file)}  (${(h.length / 1024).toFixed(0)} KB)`);
}
