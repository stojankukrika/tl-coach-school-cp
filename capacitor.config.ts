import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sport.trenirajlako',
  appName: 'Treniraj lako skola-sporta',
  webDir: 'www',
   server: {
    cleartext: true,
    androidScheme: 'http',
    'allowNavigation': ['*']
  },
  android: {
    allowMixedContent: true
  },
  plugins: {
    "SplashScreen": {
      "launchAutoHide": false,
      "showSpinner": false,
      "androidScaleType":"CENTER_CROP",
      "splashFullScreen":true,
      "launchFadeOutDuration":500
    },
    Keyboard: {
      "resize": "body",
      "style": "DARK",
      "resizeOnFullScreen": false
    },
    PushNotifications: {
      "presentationOptions": ["badge", "sound", "alert"]
    },
  }
};

export default config;
