import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // sorgt dafür, dass Vite auf 0.0.0.0 lauscht (hast du bereits aktiv)
    port: 5173,
    allowedHosts: [
      '.sslip.io',   // Erlaubt frontend.178.105... und backend.178.105...
      'localhost',
      '127.0.0.1'
    ]
  }
})
