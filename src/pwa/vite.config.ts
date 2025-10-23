/** src/pwa/vite.config.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Cuddle Blahaj Medications',
        short_name: 'Cuddle Blahaj',
        description: 'Never miss your medication with smart reminders from Cuddle Blahaj',
        theme_color: '#5865F2',
        background_color: '#111827',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // CRITICAL: Exclude ALL API routes from service worker caching
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // ALL API requests go directly to network, no caching
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkOnly',
          }
        ]
      }
    })
  ],
  server: {
    port: 3001, // Use 3001 for PWA dev server (API is on 3000)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../../dist/pwa',
    emptyOutDir: true
  }
});