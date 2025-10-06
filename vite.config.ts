import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import https from 'https';

const agent = new https.Agent({
  key: fs.readFileSync("../certs/one_test.key"),
  cert: fs.readFileSync("../certs/one_test.pem"),
  ca: fs.readFileSync("../certs/rootCA.pem"),
  rejectUnauthorized: false,                       // 嚴格驗證
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://192.168.1.20:50050',
        changeOrigin: true,
        secure: true,
        agent
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
