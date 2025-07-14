import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite carga automáticamente los archivos .env y expone las variables con el prefijo VITE_
  // a import.meta.env. No se necesita configuración manual aquí si sigues
  // la convención del prefijo VITE_ para tus variables de entorno.
});
