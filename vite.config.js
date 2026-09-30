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
        id: 'spartan-wallpaper-app',
        name: 'Spartan Wallpapers',
        short_name: 'Spartan',
        description:
          'A forma mais fácil de personalizar o fundo do seu Xbox. Wallpapers em 4K para toda a comunidade.',
        lang: 'pt-BR',
        dir: 'ltr',
        theme_color: '#030303',
        background_color: '#030303',
        start_url: '/?source=pwa',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'any',
        categories: ['personalization', 'entertainment', 'games'],
        iarc_rating_id: 'e',
        prefer_related_applications: false,
        related_applications: [],
        scope_extensions: [{ origin: 'https://xboxwallpaper-734da.firebaseapp.com' }],
        shortcuts: [
          {
            name: 'Explorar Wallpapers',
            short_name: 'Explorar',
            description: 'Veja a galeria completa de wallpapers',
            url: '/gallery',
            icons: [{ src: '/icons/logo-192.png', sizes: '192x192' }],
          },
          {
            name: 'Meus Wallpapers',
            short_name: 'Meus',
            description: 'Veja os wallpapers que você enviou',
            url: '/my-wallpapers',
            icons: [{ src: '/icons/logo-192.png', sizes: '192x192' }],
          },
        ],
        launch_handler: {
          client_mode: ['navigate-existing', 'auto'],
        },
        file_handlers: [],
        protocol_handlers: [],
        screenshots: [
          {
            src: '/screenshots/desktop-1.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Home Page',
          },
          {
            src: '/screenshots/desktop-2.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Wallpapers Gallery',
          },
          {
            src: '/screenshots/mobile-1.png',
            sizes: '640x1386',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Mobile Home Page',
          },
          {
            src: '/screenshots/mobile-2.png',
            sizes: '640x1386',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Mobile Gallery Page',
          },
          {
            src: '/screenshots/mobile-3.png',
            sizes: '640x1386',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Mobile Wallpaper Detail',
          },
        ],
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
            urlPattern: /\/api\/wallpapers\/.*\/view/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wallpapers-images-cache',
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/api\/hero-slides\/.*\/view/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'hero-images-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/api\/(?:wallpapers|hero-slides|collections)(?:\?.*)?$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-catalog-cache',
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|webp)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60,
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
