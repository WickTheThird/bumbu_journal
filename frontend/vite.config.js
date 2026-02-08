import { defineConfig } from 'vite'

export default defineConfig({
  base: '/bumbu_journal/',
  build: {
    outDir: '../docs',
    emptyOutDir: true
  }
})
