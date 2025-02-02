/** @type {import('next').NextConfig} */
const nextConfig = {

  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
    ];
  },
  reactStrictMode: true,
   output: 'standalone',
    env: {
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  },

};

export default nextConfig;