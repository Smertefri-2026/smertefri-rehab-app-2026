declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PWAOptions = {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: (string | RegExp | ((args: { asset: any; compilation: any }) => boolean))[];
    runtimeCaching?: any[];
    fallbacks?: any;
  };

  const nextPWA: (options?: PWAOptions) => (nextConfig: NextConfig) => NextConfig;
  export default nextPWA;
}