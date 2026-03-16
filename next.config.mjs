/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true, // Enables gzip/brotli compression
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"], // Modern image formats
    remotePatterns: [], // Add external domains if needed
  },
  // TypeScript build-time ignore rules
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizeCss: true, // Optimizes CSS (if using CSS modules)
    scrollRestoration: true, // Smoother scroll behavior
  },
  // Cache tuning for development
  onDemandEntries: {
    maxInactiveAge: 1000 * 60 * 5, // 5 minutes (shorter for dev)
  },
};

export default nextConfig;
