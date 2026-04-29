import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Xbox Wallpaper',
        short_name: 'Xbox Wallpaper',
        description: 'Gerencie seus wallpapers do Xbox de forma simples',
        theme_color: '#00ab00', //107c10
        background_color: '#00ab00',
        display: 'standalone',
        icons: [
          {
            src: '/icons/logo-44.png',
            sizes: '44x44',
            type: 'image/png',
          },
          {
            src: '/icons/logo-50.png',
            sizes: '50x50',
            type: 'image/png',
          },
          {
            src: '/icons/logo-150.png',
            sizes: '150x150',
            type: 'image/png',
          },
          {
            src: '/icons/logo-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/logo-512-transparent.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/logo-512-green.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/logo-1024.png',
            sizes: '1024x1024',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/__/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|webp)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/__/': {
        target: 'https://xboxwallpaper-734da.firebaseapp.com',
        changeOrigin: true,
      },
    },
  },
});
