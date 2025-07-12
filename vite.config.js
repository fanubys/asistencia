import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Externalize dependencies that are loaded via the importmap in index.html.
      // This prevents Vite from bundling them, allowing the browser to handle
      // these imports at runtime.
      external: [
        'react',
        'react-router-dom',
        'papaparse',
        'recharts',
        '@google/genai',
        // Regex to match deep imports for packages like react-dom and firebase
        /^react\//,
        /^react-dom\//,
        /^firebase\//,
      ],
    },
  },
});
