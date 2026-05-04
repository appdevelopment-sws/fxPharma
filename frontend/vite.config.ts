import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
    host: true, // important for docker
    port: 5173,
    proxy: {
      "/api": {
        target: "http://backend:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://backend:5000",
        changeOrigin: true,
      },
    },
  },
})
