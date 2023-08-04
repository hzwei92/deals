import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'

import { defineConfig } from 'vite'
import adapter from 'webrtc-adapter';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: 'janus-gateway/npm',
        replacement: path.resolve(__dirname, 'node_modules/janus-gateway/npm/dist/janus.es.js'),
      }
    ],
  },
  plugins: [
    react(),
    legacy(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
