import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import autoInjectImports from "./vite.auto-imports.js"

export default defineConfig({
  plugins: [
    autoInjectImports(),
    react()
  ],
  server: {
    allowedHosts: true,
  },
})
