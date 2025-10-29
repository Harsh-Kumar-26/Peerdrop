import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base:"./",
  server: {
    proxy:{
      '/api': `${import.meta.env.VITE_SOCKET_URL}`
    }
  },
  plugins: [react(), tailwindcss(),],
});