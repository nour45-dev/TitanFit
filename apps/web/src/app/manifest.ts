import { PLATFORM_CONFIG } from '@gymos/config';
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${PLATFORM_CONFIG.appName} — ${PLATFORM_CONFIG.brandSubtitle}`,
    short_name: PLATFORM_CONFIG.appName,
    description: PLATFORM_CONFIG.tagline.en,
    start_url: '/',
    display: 'standalone',
    background_color: '#090D16',
    theme_color: '#D4AF37',
    icons: [
      {
        src: '/brand/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
