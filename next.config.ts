import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // ✅ อนุญาตรูปจาก Unsplash
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co', // ✅ อนุญาตรูปจาก Supabase (เผื่อไว้)
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // ✅ อนุญาตรูป placeholder (เผื่อใช้)
      },
    ],
  },
};

export default nextConfig;