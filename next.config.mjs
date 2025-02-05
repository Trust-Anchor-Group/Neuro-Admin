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
<<<<<<< HEAD
    env: {
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  },

=======
  images:{
    domains:['images.unsplash.com',
        "plus.unsplash.com",
        "res.cloudinary.com"]
  }
>>>>>>> access
};

export default nextConfig;