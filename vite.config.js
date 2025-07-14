import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Las variables de entorno son inyectadas en el entorno de ejecución como `process.env`.
  // No se necesita configuración de Vite para cargarlas, pero asegúrate
  // de que las variables (ej. VITE_API_KEY, API_KEY) estén disponibles en tu entorno de despliegue.
});