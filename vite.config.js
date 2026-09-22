import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

// All site pages (flat at the project root). Keep sitemap.xml in step;
// tests/seo-files.test.mjs checks that they match.
export const pages = [
  'index',
  'about',
  'leadership',
  'programmes',
  'examinations',
  'partners',
  'resources',
  'contact',
  'privacy',
  'terms',
];

export default defineConfig({
  plugins: [
    react(),
    {
      // Vite rewrites <script>/<link>/<img> references, but leaves plain
      // (non-module) <script src> tags untouched, and does not rewrite
      // <a href> download anchors. Mirror those folders verbatim into
      // dist so the existing references resolve: dist/assets/js/... and
      // dist/assets/documents/... The crawler files must also be served
      // from the site root, so copy them alongside.
      name: 'copy-static-folders',
      closeBundle() {
        for (const path of ['assets/js', 'assets/documents', 'robots.txt', 'sitemap.xml']) {
          cpSync(resolve(root, path), resolve(root, 'dist', path), {
            recursive: true,
          });
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [page, resolve(root, `${page}.html`)])
      ),
    },
  },
});
