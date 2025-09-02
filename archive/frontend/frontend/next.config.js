/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // typedRoutes: true, // Temporairement désactivé pour éviter les erreurs de type
  },
  async redirects() {
    return [
      { source: '/', destination: '/workspace', permanent: true },
      { source: '/simulate', destination: '/workspace?step=simulate', permanent: true },
// LEGACY REMOVED       { source: '/REMOVED_LEGACY', destination: '/workspace', permanent: true },
    ];
  },
};
module.exports = nextConfig;
