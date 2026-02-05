import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/docs-viewer',
  assetPrefix: '/docs-viewer',
  // Public files are automatically served with basePath prefix
  // Images in public/ are accessible at /docs-viewer/image.png
  
  // Headers for AI crawler accessibility
  async headers() {
    return [
      {
        // Allow CORS for all AI-related API endpoints
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
      {
        // robots.txt and llms.txt should be accessible
        source: '/robots.txt',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Content-Type', value: 'text/plain' },
        ],
      },
      {
        source: '/llms.txt',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Content-Type', value: 'text/plain' },
        ],
      },
      {
        source: '/sitemap.txt',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Content-Type', value: 'text/plain' },
        ],
      },
    ];
  },
};

export default nextConfig;
