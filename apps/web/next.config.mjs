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
      { source: '/admin/drivers', destination: '/admin/chauffeurs', permanent: false },
      { source: '/admin/drivers/:id', destination: '/admin/chauffeurs/:id', permanent: false },
      { source: '/admin/vehicles', destination: '/admin/vehicules', permanent: false },
      { source: '/admin/vehicles/:id', destination: '/admin/vehicules/:id', permanent: false },
      { source: '/admin/paiements', destination: '/admin/revenus', permanent: false },
      { source: '/admin/payments', destination: '/admin/revenus', permanent: false },
      { source: '/admin/dispatch', destination: '/admin/courses', permanent: false },
      { source: '/admin/fares', destination: '/admin/parametres', permanent: false },
    ];
  },
};

export default nextConfig;
