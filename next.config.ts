import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/docs-viewer',
  assetPrefix: '/docs-viewer',
  // Public files are automatically served with basePath prefix
  // Images in public/ are accessible at /docs-viewer/image.png
};

export default nextConfig;
