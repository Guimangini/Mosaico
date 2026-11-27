import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// No GitHub Pages o app fica em /<repo>/; o workflow define BASE_PATH.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png'],
      workbox: { globPatterns: ['**/*.{js,css,html,png,woff2}'] },
      manifest: {
        name: 'Mosaico',
        short_name: 'Mosaico',
        description: 'Corte uma foto em pedaços 3:4 para montar um mosaico no perfil do Instagram.',
        lang: 'pt-BR',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1F4A3E',
        theme_color: '#1F4A3E',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
