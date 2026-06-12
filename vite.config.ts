import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { devApiPlugin } from './server/devApiPlugin'

export default defineConfig({
  plugins: [tailwindcss(), react(), devApiPlugin()],
})
