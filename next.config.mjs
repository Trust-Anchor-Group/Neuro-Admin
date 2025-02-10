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
  
   images:{
    domains:['images.unsplash.com',
        "plus.unsplash.com",
        "res.cloudinary.com"]
  }

};

export default nextConfig;

