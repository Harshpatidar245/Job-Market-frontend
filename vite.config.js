import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
 
  server: {
    allowedHosts: 'all', // Allows external hosts like ngrok or LAN IP
    proxy: {
      '/api': {
        target: `http://localhost:5000`, // Your backend server
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Optional: strip '/api' if needed
      },
    },
  },
})
