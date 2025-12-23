import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  server: {
    host: true,
    port: 3000, 
    proxy: {
        '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
            secure: false
        }
    }
  },
  resolve: {
    alias: {
      process: "process/browser",
    },
  },
});