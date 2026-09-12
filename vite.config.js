import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [tailwindcss()],
  assetsInclude: ['**/*.apk'],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        adminLogin: resolve(__dirname, 'admin/admin_login.html'),
        dashboard: resolve(__dirname, 'admin/dashboard.html'),
      }
    }
  }
})