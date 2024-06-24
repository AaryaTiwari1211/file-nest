/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "moonlit-butterfly-303.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
