// Force static export - no React Server Components streaming
export const dynamic = 'force-static';

export default function AICrawlPage() {
  const baseUrl = 'https://y1.andiami.tech/docs-viewer';

  // All URLs as simple constants
  const urls = {
    sitemap: `${baseUrl}/sitemap.txt`,
    hub: baseUrl,
    projects: [
      { name: 'Frontend Layer (wish-x)', url: `${baseUrl}/project/wish-x/docs-list` },
      { name: 'Backend Layer (wish-backend-x)', url: `${baseUrl}/project/wish-backend-x/docs-list` },
      { name: 'Agent Layer (claude-agent-server)', url: `${baseUrl}/project/claude-agent-server/docs-list` },
      { name: 'Workspace Claude Files', url: `${baseUrl}/project/workspace-claude-files/docs-list` },
      { name: 'Workspace Documentation', url: `${baseUrl}/project/workspace-documentation/docs-list` },
      { name: 'Documentation Automation Hub', url: `${baseUrl}/project/doc-automation-hub/docs-list` },
    ],
    apis: [
      { name: 'Get All Projects', url: `${baseUrl}/api/projects` },
      { name: 'Get Files List (Flat)', url: `${baseUrl}/api/files-list?project=workspace-documentation` },
      { name: 'Get Document Tree', url: `${baseUrl}/api/docs?project=wish-x` },
    ]
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>AI Documentation Index - As You Wish Ecosystem</title>
        <meta name="description" content="Machine-readable documentation index for AI tools and web crawlers" />
        <style dangerouslySetInnerHTML={{__html: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            padding: 2rem;
            margin: 0;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            color: #fbbf24;
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          h2 {
            color: #fbbf24;
            font-size: 1.5rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          h3 {
            color: #94a3b8;
            font-size: 1.1rem;
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
          }
          .url-box {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 1rem;
          }
          .url {
            font-family: 'Courier New', monospace;
            color: #60a5fa;
            word-break: break-all;
            font-size: 0.9rem;
          }
          .sitemap-box {
            background: #78350f;
            border: 2px solid #fbbf24;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin: 2rem 0;
          }
          .sitemap-url {
            font-family: 'Courier New', monospace;
            color: #fbbf24;
            font-size: 1.1rem;
            word-break: break-all;
            font-weight: bold;
          }
          .info-box {
            background: #1e3a8a;
            border: 1px solid #3b82f6;
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 2rem 0;
          }
          ul {
            margin: 0.5rem 0;
            padding-left: 2rem;
          }
          li {
            margin-bottom: 0.5rem;
          }
        `}} />
      </head>
      <body>
        <div className="container">
          <h1>📋 AI Documentation Index</h1>
          <p>
            Machine-readable URL index for AI tools and web crawlers.
            All 898 documentation pages in the As You Wish Ecosystem.
          </p>

          {/* Sitemap - Most Important */}
          <div className="sitemap-box">
            <h2>Complete Sitemap (898 pages)</h2>
            <p>Fetch this URL to get all documentation page URLs:</p>
            <div className="sitemap-url">{urls.sitemap}</div>
          </div>

          {/* Documentation Hub */}
          <h2>Documentation Hub</h2>
          <div className="url-box">
            <div className="url">{urls.hub}</div>
          </div>

          {/* Project Documentation Pages */}
          <h2>Project Documentation</h2>
          {urls.projects.map(project => (
            <div key={project.url} className="url-box">
              <h3>{project.name}</h3>
              <div className="url">{project.url}</div>
            </div>
          ))}

          {/* API Endpoints */}
          <h2>API Endpoints</h2>
          {urls.apis.map(api => (
            <div key={api.url} className="url-box">
              <h3>{api.name}</h3>
              <div className="url">{api.url}</div>
            </div>
          ))}

          {/* Usage Instructions */}
          <div className="info-box">
            <h2>For AI Tools & Web Crawlers</h2>
            <ul>
              <li>Fetch {urls.sitemap} to get complete URL list</li>
              <li>Each documentation page is server-side rendered (SSR)</li>
              <li>All pages return full HTML content without JavaScript</li>
              <li>Use /api/files-list for flat JSON structure</li>
              <li>Use /api/docs for nested tree structure</li>
              <li>Direct page access: /project/[projectName]/docs/[...path]</li>
            </ul>
          </div>

          {/* Project Structure */}
          <h2>Project Structure</h2>
          <ul>
            <li><strong>Frontend Layer:</strong> wish-x - Next.js 15 + React 19 + TypeScript</li>
            <li><strong>Backend Layer:</strong> wish-backend-x - Trigger.dev v4 orchestration</li>
            <li><strong>Agent Layer:</strong> claude-agent-server - WebSocket + Agent SDK</li>
            <li><strong>Total Documentation:</strong> 898 pages across 6 projects</li>
            <li><strong>Update Frequency:</strong> Sitemap regenerates dynamically on each request</li>
          </ul>

          {/* Footer */}
          <hr style={{border: 'none', borderTop: '1px solid #334155', margin: '3rem 0 2rem'}} />
          <p style={{textAlign: 'center', color: '#64748b', fontSize: '0.9rem'}}>
            As You Wish Ecosystem Documentation<br />
            This page is fully static HTML for maximum AI tool accessibility
          </p>
        </div>
      </body>
    </html>
  );
}
