import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: process.env.NODE_ENV === 'production' ? [] : ['@babel/plugin-transform-typescript']
      }
    }),
    runtimeErrorOverlay(),
    themePlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    target: "esnext",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'monaco-editor': ['monaco-editor']
        }
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    tsconfigRaw: process.env.NODE_ENV === 'production' ? 
      { compilerOptions: { noUnusedLocals: false, noUnusedParameters: false } } : undefined
  }
});
