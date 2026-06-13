import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// React + Fast Refresh. Three.js is bundled from npm (pinned 0.137.5).
export default defineConfig({
  plugins: [react()],
  build: {
    // es2022 instead of Vite 6's legacy default target list: esbuild ≥0.28
    // (forced via the package.json override for GHSA-gv7w-rqvm-qjhr) no longer
    // lowers syntax for those old targets and fails the build. Every browser
    // this site supports (incl. iPad Safari 16+) ships es2022 natively.
    target: 'es2022',
    rollupOptions: {
      output: {
        // Split heavy, rarely-changing vendors into their own cacheable chunks.
        manualChunks: {
          three: ['three'],
          react: ['react', 'react-dom'],
        },
      },
    },
    // Three.js is intentionally large; keep the advisory threshold above it.
    chunkSizeWarningLimit: 700,
  },
});
