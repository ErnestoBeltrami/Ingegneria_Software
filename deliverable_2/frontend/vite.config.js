import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/operatore': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        bypass(req) {
          if (req.url === '/operatore/profilo') return req.url;
        },
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        bypass(req) {
          if (req.url.startsWith('/auth/callback')) return req.url;
        },
      },
      '/votazioni': { target: 'http://localhost:8000', changeOrigin: true },
      '/sondaggio': { target: 'http://localhost:8000', changeOrigin: true },
      '/categorie': { target: 'http://localhost:8000', changeOrigin: true },
      '/iniziative': { target: 'http://localhost:8000', changeOrigin: true },
      '/cittadino': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        bypass(req) {
          if (req.url.startsWith('/cittadino/dashboard') || req.url.startsWith('/cittadino/iniziativa') || req.url.startsWith('/cittadino/profilo')) {
            return req.url;
          }
        },
      },
    },
  },
});
