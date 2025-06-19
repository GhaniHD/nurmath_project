import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
      base: '/',
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    historyApiFallback: true, // Tambahkan ini
  },
  build: {
    outDir: 'dist'
  }
});
