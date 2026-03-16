import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({ mode }) => {
  // Use __dirname so `pnpm dev` works regardless of the process CWD.
  // Restrict to Vite-exposed vars to avoid accidentally reading unrelated env.
  const env = loadEnv(mode, __dirname, 'VITE_');
  const apiUrl = env.VITE_API_URL?.trim();
  console.log(apiUrl);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      proxy: apiUrl
        ? {
            '/api': {
              target: apiUrl,
              changeOrigin: true,
            },
          }
        : undefined,
    }
  };
});
