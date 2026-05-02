import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'check-mate',
  brand: {
    displayName: '체크메이트',
    primaryColor: '#00C896',
    icon: 'https://a-scene-tence.github.io/checkmate/icon-512.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
