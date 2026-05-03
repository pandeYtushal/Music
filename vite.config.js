import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Melody - Premium Music Streaming',
        short_name: 'Melody',
        description: 'A premium, ad-free music streaming experience featuring the latest hits, curated playlists, and high-quality audio.',
        theme_color: '#8b5cf6',
        background_color: '#030014',
        display: 'standalone',
        icons: [
          {
            src: 'https://ui-avatars.com/api/?name=Melody&background=8B5CF6&color=fff&size=192',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://ui-avatars.com/api/?name=Melody&background=8B5CF6&color=fff&size=512',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    }
  }
})
