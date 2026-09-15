import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.daralilm.app',
  appName: 'Dar al-Ilm',
  webDir: 'dist',
  backgroundColor: '#5c2a3a',
  android: {
    allowMixedContent: false,
  },
}

export default config
