import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      includeAssets: ['favicon.svg'],
      manifest: {
        name:             'Montra — Personal Finance',
        short_name:       'Montra',
        description:      'Manajemen keuangan pribadi yang simpel dan elegan',
        theme_color:      '#121212',
        background_color: '#121212',
        display:          'standalone',
        orientation:      'portrait',
        scope:            '/',
        start_url:        '/',
        icons: [
          { src: 'montra-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'montra-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 31536000 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    chunkSizeWarningLimit: 1600,
  },
})
