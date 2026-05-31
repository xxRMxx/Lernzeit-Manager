import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // sorgt dafür, dass Vite auf 0.0.0.0 lauscht
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
    allowedHosts: [
      '.sslip.io',
      'localhost',
      '127.0.0.1'
    ]
  }
})
