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
  optimizeDeps: {
    include: ['recharts', 'recharts/es6/index'],
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
      '/notifiche': { target: 'http://localhost:8000', changeOrigin: true },
      '/cittadino': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        bypass(req) {
          const frontendRoutes = [
            '/cittadino/dashboard',
            '/cittadino/bacheca',
            '/cittadino/votazione',
            '/cittadino/sondaggio',
            '/cittadino/iniziativa',
            '/cittadino/profilo',
            '/cittadino/archivio',
          ];
          if (frontendRoutes.some(p => req.url.startsWith(p))) {
            return req.url;
          }
        },
      },
    },
  },
});
