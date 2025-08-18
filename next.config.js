/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/", destination: "/strategy-tester", permanent: false },
      { source: "/strategy-t", destination: "/strategy-tester", permanent: false },
    ];
  },
};
module.exports = nextConfig;
