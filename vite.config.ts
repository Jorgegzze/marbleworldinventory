
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensure assets are correctly linked for GitHub Pages
  build: {
    outDir: 'dist', // GitHub Pages will serve from 'dist'
  },
});
