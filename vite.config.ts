import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ["uncanny-geometric-basis.ngrok-free.dev"],
  },
  build: {
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks keep the app shell small and cache well.
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
            {
              name: "radix",
              test: /node_modules[\\/](radix-ui|@radix-ui|cmdk|react-remove-scroll|@floating-ui)/,
            },
            {
              name: "forms",
              test: /node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
            },
            {
              name: "charts",
              test: /node_modules[\\/](recharts|d3-|victory-vendor|es-toolkit|immer|@reduxjs|redux|reselect)/,
            },
            { name: "mock-data", test: /src[\\/]data[\\/]/ },
          ],
        },
      },
    },
  },
});
