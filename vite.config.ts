import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// --------------- CONFIGURAÇÃO DO VITE ---------------
export default defineConfig(({ mode }) => ({
  plugins: [
    react(), // plugin principal do React com SWC
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // atalho @ aponta para src/
    },
  },
}));
