STAGING — movik-landing.vercel.app
==================================

This Vercel deployment exists only to preview the landing pages. The real home
for these files is movik.us (with subdomains, structure still to be decided).

Because it is staging, indexing is blocked on purpose, in two layers:

  1. robots.txt           -> Disallow: / for every crawler
  2. vercel.json headers  -> X-Robots-Tag: noindex, nofollow, noarchive

Two layers because robots.txt only asks crawlers not to *fetch* a page; it does
not guarantee the URL stays out of the index (Google can still list a URL it
never fetched, from external links). The X-Robots-Tag header is what actually
forces removal, and it survives a careless file sync because it lives in
vercel.json, not in a file that gets copied over.

If this staging URL gets indexed, it will compete with movik.us once the pages
move, and the older staging URLs can outrank the real ones.


WHEN THE PAGES MOVE TO movik.us
-------------------------------
1. Delete the "headers" block from vercel.json (or retire this deployment).
2. Copy site-root/robots.txt over robots.txt   (Allow: / + AI crawlers + sitemap)
3. Copy site-root/sitemap.xml and site-root/llms.txt into this folder.
4. Update every <link rel="canonical"> and the og:url / JSON-LD "url" fields in
   the four index.html files to the final movik.us URLs. They currently point at
   movik-landing.vercel.app, which is correct for staging and wrong for launch.
5. Fix the duplicate-content problem: / is a 99% copy of /carriers/ (same H1,
   same sections) and links to none of the sub-pages. On the real domain that
   costs you rankings. Either make / a real hub that links to the four pages, or
   canonicalise it to /carriers/.


WHAT IS ALREADY DONE AND TRAVELS WITH THE FILES
-----------------------------------------------
All four pages carry full SEO markup - <title>, meta description, canonical,
Open Graph, Twitter Card and JSON-LD. That work is inside the HTML and moves
with the files to whatever domain they land on. Only the URLs need updating.
