import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// El puerto se fija para que coincida exactamente con el CORS del backend (S7).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  }
});
