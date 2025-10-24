import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import { API_URL } from './src/shared/constants';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // всё, что начинается с /api, уходит на твой бэк
      '/api': {
        target: `${API_URL}`,
        changeOrigin: true,
        // если на бэке нет префикса /api — раскомментируй следующую строку
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
