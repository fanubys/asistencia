import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Para exponer variables de entorno al código del cliente,
  // Vite las carga desde archivos .env y las expone en el objeto
  // especial `import.meta.env`.
  // Es importante que las variables estén prefijadas con `VITE_` 
  // (ej. VITE_API_KEY) para que Vite las procese por seguridad.
});