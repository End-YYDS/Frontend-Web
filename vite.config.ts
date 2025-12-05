import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import checker from 'vite-plugin-checker';
import fs from 'fs';
import https from 'https';

function getDevHttpsAgent() {
  const caPath = path.resolve(__dirname, '../certs/rootCA.pem');

  if (!fs.existsSync(caPath)) {
    console.warn('[vite] 開發用 Root CA 檔案不存在：', caPath);
    return undefined;
  }

  const ca = fs.readFileSync(caPath);

  return new https.Agent({
    ca,
    rejectUnauthorized: true,
  });
}

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  const devServer = isDev
    ? {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'https://127.0.0.1:50050',
            changeOrigin: true,
            secure: true,
            agent: getDevHttpsAgent(),
          },
        },
      }
    : undefined;

  return {
    plugins: [
      react(),
      tailwindcss(),
      checker({
        typescript: true,
        eslint: {
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
          useFlatConfig: true,
        },
      }),
    ],
    server: devServer,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
