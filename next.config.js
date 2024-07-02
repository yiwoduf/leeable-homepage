/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.notion.so",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
