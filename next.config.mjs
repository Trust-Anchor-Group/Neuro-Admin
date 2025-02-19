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
    NEXT_PUBLIC_PROTOCOL: process.env.NEXT_PUBLIC_PROTOCOL,
    NEXT_PUBLIC_ORIGIN: process.env.NEXT_PUBLIC_ORIGIN,
    NEXT_PUBLIC_AGENT_HOST: process.env.NEXT_PUBLIC_AGENT_HOST,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  },
  images:{
    domains:['images.unsplash.com',
        "plus.unsplash.com",
        "res.cloudinary.com"]
  }
};

export default nextConfig;