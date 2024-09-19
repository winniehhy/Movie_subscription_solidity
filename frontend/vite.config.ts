import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    rollupOptions: {
      input: "../frontend/index.html"
    }
  },
  resolve: {
    alias: {
      // Add aliases for Node.js core modules if needed
      'web3': 'web3/dist/web3.min.js'
    }
  }
});