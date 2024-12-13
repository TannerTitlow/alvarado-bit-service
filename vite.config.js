import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Add assetsInclude for video files
  assetsInclude: ['**/*.mp4'],
  // Add build options to handle large files
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
        assetFileNames: assetInfo => {
          if (assetInfo.name.endsWith('.mp4')) {
            return 'assets/videos/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    // Increase chunk size limit if needed
    chunkSizeWarningLimit: 2000,
  },
  vue: {
    compilerOptions: {
      isCustomElement: tag => false,
      whitespace: 'preserve',
    },
  },
})
