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
  }
};

module.exports = nextConfig;
