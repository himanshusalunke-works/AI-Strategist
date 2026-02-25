import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Vercel serves from the root path.
  base: '/',
  server: {
    port: 5173,
    open: true
  }
})
