import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.jamn',
  appName: 'JAMN',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    GoogleAuth: {
      scopes: ['email'],
      clientId: '752107153785-5tggr0pc3t5ll8vddlppkk37k83ln5j5.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  }
};

export default config;
