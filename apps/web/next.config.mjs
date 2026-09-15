import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../..'),
  transpilePackages: [
    '@openride/api-client',
    '@openride/db',
    '@openride/domain',
    '@openride/realtime',
    '@openride/ui',
  ],
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/admin/chauffeurs', destination: '/admin/drivers', permanent: false },
      { source: '/admin/chauffeurs/:id', destination: '/admin/drivers/:id', permanent: false },
      { source: '/admin/vehicules', destination: '/admin/vehicles', permanent: false },
      { source: '/admin/paiements', destination: '/admin/payments', permanent: false },
    ];
  },
};

export default nextConfig;
