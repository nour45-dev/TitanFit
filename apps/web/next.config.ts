import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output:
    process.platform === 'win32' && process.env.NEXT_STANDALONE !== 'true'
      ? undefined
      : 'standalone',
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  reactStrictMode: true,
  transpilePackages: ['@gymos/config', '@gymos/contracts', '@gymos/ui'],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
