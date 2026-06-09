import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera una build standalone óptima para Docker / Dokploy
  output: "standalone",
};

export default nextConfig;
