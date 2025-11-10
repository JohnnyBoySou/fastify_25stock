import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/config': resolve(__dirname, './src/config'),
      '@/features': resolve(__dirname, './src/features'),
      '@/plugins': resolve(__dirname, './src/plugins'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/services': resolve(__dirname, './src/services')
    }
  }
})

