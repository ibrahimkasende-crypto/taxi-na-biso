import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminUrl = (process.env.NEXT_PUBLIC_ADMIN_URL ?? '').replace(/\/$/, '');
const remoteAdmin =
  adminUrl.startsWith('https://') && !adminUrl.includes('localhost');

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
    if (!remoteAdmin) return [];
    return [
      { source: '/admin', destination: `${adminUrl}/dashboard`, permanent: false },
      { source: '/admin/login', destination: `${adminUrl}/login`, permanent: false },
      { source: '/admin/:path*', destination: `${adminUrl}/:path*`, permanent: false },
    ];
  },
};

export default nextConfig;
