import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        basisscholen: resolve(__dirname, 'aanbod/basisscholen/index.html'),
        middelbarescholen: resolve(__dirname, 'aanbod/middelbare-scholen/index.html'),
        bso: resolve(__dirname, 'aanbod/bso/index.html'),
        gemeenteBuurtsport: resolve(__dirname, 'aanbod/gemeente-buurtsport/index.html'),
        sportdagenEvenementen: resolve(__dirname, 'aanbod/sportdagen-evenementen/index.html'),
      }
    }
  }
})
