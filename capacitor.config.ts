import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.tailordeck',
  appName: 'TailorDeck',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#FAF8F5',
      androidScaleType: 'CENTER',
      showSpinner: false,
    },
  },
}

export default config
