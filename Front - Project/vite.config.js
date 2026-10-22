import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración mínima: Vite + plugin de React.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }, // el backend permite este origen por defecto (CORS_ALLOWED_ORIGINS)
});
