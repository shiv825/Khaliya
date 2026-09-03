import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true,
        ws: false,
        secure: false
      },
      '/uploads': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true,
        ws: false,
        secure: false
      }
    }
  }
})
