import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:5174',
            changeOrigin: true,
          },
        },
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg', 'icons/apple-touch-icon.svg'],
          manifest: {
            name: 'Tempo Gig Manager',
            short_name: 'Tempo',
            description: 'Tempo Gig Manager',
            theme_color: '#0a0a0a',
            background_color: '#0a0a0a',
            display: 'standalone',
            start_url: '/',
            scope: '/',
            icons: [
              {
                src: '/icons/icon-192.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
              },
              {
                src: '/icons/icon-512.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
              },
              {
                src: '/icons/icon-512.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'maskable',
              },
            ],
          },
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
