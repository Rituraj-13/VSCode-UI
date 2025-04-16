import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [],
        parserOpts: {
          strictMode: !isProduction
        }
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
    // outDir: path.resolve(__dirname, "dist"),
    outDir: 'workers-site',
    emptyOutDir: true,
    target: "esnext",
    sourcemap: !isProduction,
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
    tsconfigRaw: isProduction ? {
      compilerOptions: {
        noUnusedLocals: false,
        noUnusedParameters: false,
        noImplicitAny: false,
        noImplicitThis: false,
        noImplicitReturns: false,
        strictNullChecks: false,
        strictFunctionTypes: false,
        strictBindCallApply: false,
        strictPropertyInitialization: false,
        noStrictGenericChecks: false,
        skipLibCheck: true
      }
    } : undefined
  }
});
