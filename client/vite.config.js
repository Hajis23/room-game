import { defineConfig } from 'vite';
import vitePluginFaviconsInject from 'vite-plugin-favicons-inject';
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '',
  build: {
    assetsDir: 'assets',
    emptyOutDir: true,
    manifest: true,
    outDir: 'dist',
  },
  plugins: [
    vitePluginFaviconsInject('./public/logo.png'),
    react()
  ],
  server: { host: '0.0.0.0', port: 8000 },
  clearScreen: false,
});
