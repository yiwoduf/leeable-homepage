import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// React + Fast Refresh. Three.js is bundled from npm (pinned 0.137.5).
export default defineConfig({
  plugins: [react()],
  build: {
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
