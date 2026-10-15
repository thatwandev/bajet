import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Change './' to '/your-repo-name/' if deploying to a GitHub Pages project site
  // e.g. base: '/financial-dashboard/'
  base: '/bajet',
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
})
