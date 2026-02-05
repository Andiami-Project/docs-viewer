import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

const projects = [
  {
    name: 'wish-x',
    title: 'Frontend',
    description: 'Next.js 15 + React 19 UI',
    link: '/wish-x',
  },
  {
    name: 'wish-backend-x',
    title: 'Backend',
    description: 'Trigger.dev v4 orchestration',
    link: '/wish-backend-x',
  },
  {
    name: 'claude-agent-server',
    title: 'Agent',
    description: 'WebSocket + Agent SDK',
    link: '/claude-agent-server',
  },
  {
    name: 'doc-automation-hub',
    title: 'Doc Hub',
    description: 'Documentation automation',
    link: '/doc-automation-hub',
  },
  {
    name: 'workspace-claude-files',
    title: 'Claude Files',
    description: 'Configuration & skills',
    link: '/workspace-claude-files',
  },
  {
    name: 'workspace-documentation',
    title: 'Workspace Docs',
    description: 'General documentation',
    link: '/workspace-documentation',
  },
];

function ProjectCard({name, title, description, link}: {
  name: string;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <Link
      to={link}
      className="card"
      style={{
        display: 'block',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid var(--ifm-color-emphasis-300)',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
      }}
    >
      <h3 style={{margin: '0 0 0.5rem 0'}}>{title}</h3>
      <code style={{fontSize: '0.85rem', color: 'var(--ifm-color-primary)'}}>{name}</code>
      <p style={{margin: '0.5rem 0 0 0', color: 'var(--ifm-color-emphasis-700)'}}>
        {description}
      </p>
    </Link>
  );
}

export default function Home(): React.JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Documentation Hub"
      description="As You Wish Ecosystem Documentation - AI Friendly"
    >
      <main style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
        <div style={{textAlign: 'center', marginBottom: '3rem'}}>
          <h1 style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>
            {siteConfig.title}
          </h1>
          <p style={{fontSize: '1.25rem', color: 'var(--ifm-color-emphasis-700)'}}>
            {siteConfig.tagline}
          </p>
        </div>

        <h2 style={{marginBottom: '1.5rem'}}>Projects</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          {projects.map((project) => (
            <ProjectCard key={project.name} {...project} />
          ))}
        </div>

        <div
          style={{
            padding: '2rem',
            borderRadius: '8px',
            background: 'var(--ifm-color-emphasis-100)',
          }}
        >
          <h2 style={{marginTop: 0}}>AI Access</h2>
          <p>
            This documentation is AI-friendly. All pages are static HTML - no JavaScript required.
          </p>
          <ul>
            <li>
              <strong>llms.txt</strong>:{' '}
              <a href="https://y1.andiami.tech/docs-viewer/llms.txt">/docs-viewer/llms.txt</a> - AI instructions
            </li>
            <li>
              <strong>Sitemap</strong>:{' '}
              <a href="https://y1.andiami.tech/docs-viewer/sitemap.xml">/docs-viewer/sitemap.xml</a> - All page URLs
            </li>
            <li>
              <strong>robots.txt</strong>:{' '}
              <a href="https://y1.andiami.tech/docs-viewer/robots.txt">/docs-viewer/robots.txt</a> - All crawlers allowed
            </li>
          </ul>
        </div>
      </main>
    </Layout>
  );
}
