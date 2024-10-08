import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server : {
    https: {
      key: '../key.pem',
      cert: '../cert.pem'
    },
    host: true, // Exposes the server on the network
  }
})
