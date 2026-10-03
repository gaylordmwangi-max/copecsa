// Checks robots.txt and sitemap.xml against the site itself: the sitemap must
// list every page the build ships (and nothing that doesn't exist), use the
// production host from CNAME, and both files must land in the built dist/.
//
// Run: npm run test:seo

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { pages } from '../vite.config.js';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

const origin = `https://${read('CNAME').trim()}`;
const robots = read('robots.txt');
const sitemap = read('sitemap.xml');
const entries = [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)]
  .map(([, loc, lastmod]) => ({ loc, lastmod }));

// The public URL of a page file: the homepage is served at the root.
const urlFor = (file) => (file === 'index.html' ? `${origin}/` : `${origin}/${file}`);

test('robots.txt allows crawling and points at the sitemap', () => {
  assert.match(robots, /^User-agent: \*$/m);
  assert.doesNotMatch(robots, /^Disallow: \/\s*$/m, 'robots.txt blocks the whole site');
  assert.match(robots, new RegExp(`^Sitemap: ${origin}/sitemap\\.xml$`, 'm'));
});

test('sitemap.xml is a well-formed sitemaps.org urlset', () => {
  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.match(sitemap, /<\/urlset>\n$/);
  assert.equal(entries.length, (sitemap.match(/<url>/g) ?? []).length, 'every <url> needs exactly one <loc> and <lastmod>');
});

test('every sitemap URL is unique, on the production host and backed by a real file', () => {
  const locs = entries.map((entry) => entry.loc);
  assert.equal(new Set(locs).size, locs.length, 'duplicate <loc> entries');
  for (const loc of locs) {
    assert.ok(loc.startsWith(`${origin}/`), `${loc} is not on ${origin}`);
    const path = loc.slice(origin.length + 1) || 'index.html';
    assert.ok(existsSync(new URL(path, root)), `${loc} has no file ${path}`);
  }
});

test('every page the build ships is in the sitemap', () => {
  const locs = new Set(entries.map((entry) => entry.loc));
  for (const page of pages) assert.ok(locs.has(urlFor(`${page}.html`)), `${page}.html missing from sitemap.xml`);
});

test('every page and document linked from the site is in the sitemap', () => {
  const locs = new Set(entries.map((entry) => entry.loc));
  const htmlFiles = readdirSync(root).filter((file) => file.endsWith('.html'));
  for (const file of htmlFiles) {
    for (const [, href] of read(file).matchAll(/href="([^"#?:]+\.(?:html|pdf))"/g)) {
      assert.ok(locs.has(urlFor(href)), `${file} links to ${href}, which is missing from sitemap.xml`);
    }
  }
});

test('lastmod values are real, non-future W3C dates', () => {
  const today = new Date().toISOString().slice(0, 10);
  for (const { loc, lastmod } of entries) {
    assert.match(lastmod, /^\d{4}-\d{2}-\d{2}$/, `${loc} lastmod ${lastmod}`);
    assert.ok(!Number.isNaN(Date.parse(lastmod)), `${loc} lastmod ${lastmod} is not a date`);
    assert.ok(lastmod <= today, `${loc} lastmod ${lastmod} is in the future`);
  }
});

test('the production build serves both files from the site root', () => {
  execFileSync('npx', ['vite', 'build', '--logLevel', 'error'], { cwd: root });
  assert.equal(read('dist/robots.txt'), robots);
  assert.equal(read('dist/sitemap.xml'), sitemap);
});
