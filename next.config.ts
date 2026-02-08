import type { NextConfig } from "next";
import nextPWA from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

const withPWA = nextPWA({
  dest: "public",
  disable: isDev, // ✅ PWA av i dev, på i prod
});

const nextConfig: NextConfig = {
  // hvis du vil “roe ned” warningen:
  turbopack: {},
};

export default withPWA(nextConfig);