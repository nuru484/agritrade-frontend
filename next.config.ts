import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets CI / verification builds run alongside a live `next dev` without the
  // two fighting over .next (e.g. NEXT_DIST_DIR=.next-build next build).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    // Photography is served from Wikimedia Commons (CC BY-SA, credited in the
    // footer). Special:FilePath 302s to upload.wikimedia.org, so both hosts
    // are allowed.
    remotePatterns: [
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      // Commodity photos uploaded from the console (Cloudinary).
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
