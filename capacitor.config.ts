import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.tailordeck',
  appName: 'TailorDeck',
  webDir: 'dist',
  bundledWebRuntime: false,
  // Pinch-to-zoom for users who need larger text (also requires the viewport meta in index.html to allow it).
  zoomEnabled: true,
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#FAF8F5',
      androidScaleType: 'CENTER',
      showSpinner: false,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_tailordeck',
      iconColor: '#7B1E37',
    },
  },
}

export default config
