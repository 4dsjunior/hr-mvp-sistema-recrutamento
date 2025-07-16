//import { defineConfig } from 'vite';
//import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
//export default defineConfig({
//  plugins: [react()],
// optimizeDeps: {
//    exclude: ['lucide-react'],
//  },
//});


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true, // Permite acesso externo
    allowedHosts: ['.ngrok-free.app'], // Permite qualquer subdomínio do ngrok
  },
})
