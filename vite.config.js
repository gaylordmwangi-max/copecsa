import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

// All site pages (flat at the project root)
const pages = [
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
      // dist/assets/documents/...
      name: 'copy-static-folders',
      closeBundle() {
        for (const dir of ['assets/js', 'assets/documents']) {
          cpSync(resolve(root, dir), resolve(root, 'dist', dir), {
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
