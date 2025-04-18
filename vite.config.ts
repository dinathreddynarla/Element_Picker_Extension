import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir:false,
    rollupOptions: {
      input: {
        // popup: "index.html",
        // background: "src/background-scripts/background.ts",
        content: "src/content-scripts/content.tsx",
        // content_styles: "src/content-scripts/content.css",
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
})
