import { defineConfig } from 'vite'

export default defineConfig({
  base: '/bumbu_journal/docs/',
  build: {
    outDir: '../docs',
    emptyOutDir: true
  }
})
