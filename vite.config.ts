import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      // Dev: avoid CORS — same as POST https://image-z.created.app/api/generate-image + json { prompt }
      '/api/image/generate-image': {
        target: 'https://image-z.created.app',
        changeOrigin: true,
        rewrite: () => '/api/generate-image',
      },
    },
  },
})
