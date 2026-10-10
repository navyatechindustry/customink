import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'site',
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'site/index.html'),
        privacy: resolve(import.meta.dirname, 'site/privacy.html'),
        terms: resolve(import.meta.dirname, 'site/terms.html'),
        notFound: resolve(import.meta.dirname, 'site/404.html'),
      },
    },
  },
});
