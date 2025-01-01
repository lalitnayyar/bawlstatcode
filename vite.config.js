import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  plugins: [
    // ...existing code...
  ],
  server: {
    port: process.env.VITE_PORT || 3000,
    // ...existing code...
  },
  // ...existing code...
  define: {
    'process.env': { ...process.env }
  }
});