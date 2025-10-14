import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.PNG"], //allows for PNG images retrieval for vite
  server: {
    host: '0.0.0.0',
    port: 5173 // you can change this if needed
  }
})
