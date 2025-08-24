import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Required for Docker container to expose the server
    port: 5173,      // Default Vite port
    // Allow access from a custom DNS name in development
    // This is useful when using a reverse proxy or custom host entries like /etc/hosts.
    allowedHosts: [
      'otp.ozfe-digital.de',
      'localhost',
      '127.0.0.1'
    ],
  }
})