import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/operatore': { target: 'http://localhost:8000', changeOrigin: true },
      '/auth': { target: 'http://localhost:8000', changeOrigin: true },
      '/cittadino': { target: 'http://localhost:8000', changeOrigin: true },
      '/votazioni': { target: 'http://localhost:8000', changeOrigin: true },
      '/sondaggio': { target: 'http://localhost:8000', changeOrigin: true },
      '/iniziative': { target: 'http://localhost:8000', changeOrigin: true },
      '/categorie': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
});
