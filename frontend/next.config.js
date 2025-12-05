/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com", "s3.amazonaws.com"],
  },
};

module.exports = nextConfig;
