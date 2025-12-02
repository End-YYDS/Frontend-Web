import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import checker from 'vite-plugin-checker';
import fs from 'fs';
import https from 'https';

const agent = new https.Agent({
  ca: fs.readFileSync('../certs/rootCA.pem'), // 信任的 Root/Intermediate CA
  // 若後端需要客戶端憑證（mTLS），再加上：
  // cert: fs.readFileSync("../certs/client-cert.pem"),
  // key:  fs.readFileSync("../certs/client-key.pem"),
  rejectUnauthorized: true, // 嚴格驗證
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"', // 依你的config修改
        useFlatConfig: true,
      },
    }),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://127.0.0.1:50050',
        changeOrigin: true,
        secure: true,
        agent,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
