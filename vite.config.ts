import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    define: {
      'import.meta.env.VITE_EMAIL_OTP_EXPIRY_SECONDS': JSON.stringify(env.VITE_EMAIL_OTP_EXPIRY_SECONDS),
      'import.meta.env.VITE_SENTRY_DSN': JSON.stringify(env.VITE_SENTRY_DSN),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_ALLOW_WEB_APP': JSON.stringify(env.VITE_ALLOW_WEB_APP),
    },
    // TailorDeck is installed from Google Play, not as a web app. public/sw.js only removes the service worker
    // of the old PWA; main.tsx also unregisters it and clears its caches.
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
