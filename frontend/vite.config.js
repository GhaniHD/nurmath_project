import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],
  base: '/', // Pindahkan base ke tingkat root
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    historyApiFallback: true, // Tetap gunakan untuk pengembangan lokal
  },
  build: {
    outDir: 'dist'
  }
});