import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import https from "https";
import fs from "fs";
const agent = new https.Agent({
  ca: fs.readFileSync("/Users/dodo/Downloads/rootCA.pem"),      // 信任的 Root/Intermediate CA
  // 若後端需要客戶端憑證（mTLS），再加上：
  cert: fs.readFileSync("/Users/dodo/Downloads/one_test.pem"),
  key:  fs.readFileSync("/Users/dodo/Downloads/one_test.key"),
  rejectUnauthorized: true,                       // 嚴格驗證
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
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
