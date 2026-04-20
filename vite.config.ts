import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { devImagePlugin } from './server/devImagePlugin'

export default defineConfig({
  plugins: [tailwindcss(), react(), devImagePlugin()],
})
