/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com", "s3.amazonaws.com"],
  },
  // Allow access from other devices in local network
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  },
  // Rewrite /api calls to backend to prevent mixed content errors
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://34.228.26.121/api/:path*'
        }
      ]
    };
  }
};

module.exports = nextConfig;
