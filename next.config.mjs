/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Top-level in Next.js 16 (was experimental in 15)
  typedRoutes: true,
};

export default nextConfig;
