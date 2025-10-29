import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base:"./",
  server: {
    proxy:{
      '/api': `http://localhost:${process.env.PORT || 8000}`
    }
  },
  plugins: [react(), tailwindcss(),],
});