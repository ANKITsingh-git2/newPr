import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const wpBase = env.VITE_WP_BASE_URL || '';
  const target = wpBase || 'http://localhost:8000';
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        '/wp-json': {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
