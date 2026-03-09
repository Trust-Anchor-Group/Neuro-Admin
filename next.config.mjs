/** @type {import('next').NextConfig} */
const backendHost = process.env.NEXT_PUBLIC_AGENT_HOST || process.env.AGENT_HOST || 'mateo.lab.tagroot.io';

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
    NEXT_PUBLIC_PROTOCOL: process.env.NEXT_PUBLIC_PROTOCOL,
    NEXT_PUBLIC_ORIGIN: process.env.NEXT_PUBLIC_ORIGIN,
    NEXT_PUBLIC_AGENT_HOST: process.env.NEXT_PUBLIC_AGENT_HOST,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  },
 images: {
   dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: backendHost,
      },
    ],
  },
};

export default nextConfig;