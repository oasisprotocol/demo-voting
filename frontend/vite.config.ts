import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 2**20,
    rollupOptions: {
      output: {
        // Watch the output of `pnpm build`, make it fit in single 1mb chunk
        manualChunks: () => 'app'
      },
    },
  },
  // define: {
  //   __VUE_OPTIONS_API__: false
  // },
  plugins: [vue(), visualizer({ sourcemap: true, gzipSize: true })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8788',
    }
  }
});
