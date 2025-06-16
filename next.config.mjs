/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "grateful-ferret-485.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
