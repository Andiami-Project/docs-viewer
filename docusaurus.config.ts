import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'As You Wish Ecosystem',
  tagline: 'Documentation Hub for the As You Wish Ecosystem',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // Production URL
  url: 'https://y1.andiami.tech',
  // Base path - matches your current setup
  baseUrl: '/docs-viewer/',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Docs at root path for cleaner URLs
          routeBasePath: '/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  // Plugin for multiple doc instances (one per project)
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'wish-x',
        path: 'projects/wish-x',
        routeBasePath: 'wish-x',
        sidebarPath: './sidebars-wish-x.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'wish-backend-x',
        path: 'projects/wish-backend-x',
        routeBasePath: 'wish-backend-x',
        sidebarPath: './sidebars-wish-backend-x.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'claude-agent-server',
        path: 'projects/claude-agent-server',
        routeBasePath: 'claude-agent-server',
        sidebarPath: './sidebars-claude-agent-server.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'workspace-claude-files',
        path: 'projects/workspace-claude-files',
        routeBasePath: 'workspace-claude-files',
        sidebarPath: './sidebars-workspace-claude-files.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'workspace-documentation',
        path: 'projects/workspace-documentation',
        routeBasePath: 'workspace-documentation',
        sidebarPath: './sidebars-workspace-documentation.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'doc-automation-hub',
        path: 'projects/doc-automation-hub',
        routeBasePath: 'doc-automation-hub',
        sidebarPath: './sidebars-doc-automation-hub.ts',
      },
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'As You Wish Ecosystem',
      logo: {
        alt: 'As You Wish Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'dropdown',
          label: 'Projects',
          position: 'left',
          items: [
            {to: '/wish-x', label: 'wish-x (Frontend)'},
            {to: '/wish-backend-x', label: 'wish-backend-x (Backend)'},
            {to: '/claude-agent-server', label: 'claude-agent-server (Agent)'},
            {to: '/doc-automation-hub', label: 'doc-automation-hub'},
            {to: '/workspace-claude-files', label: 'Workspace Claude Files'},
            {to: '/workspace-documentation', label: 'Workspace Documentation'},
          ],
        },
        {
          href: 'https://y1.andiami.tech/docs-viewer/llms.txt',
          label: 'AI Access',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Projects',
          items: [
            {label: 'wish-x', to: '/wish-x'},
            {label: 'wish-backend-x', to: '/wish-backend-x'},
            {label: 'claude-agent-server', to: '/claude-agent-server'},
          ],
        },
        {
          title: 'Resources',
          items: [
            {label: 'Workspace Docs', to: '/workspace-documentation'},
            {label: 'Claude Files', to: '/workspace-claude-files'},
          ],
        },
        {
          title: 'AI Access',
          items: [
            {label: 'llms.txt', href: 'https://y1.andiami.tech/docs-viewer/llms.txt'},
            {label: 'Sitemap', href: 'https://y1.andiami.tech/docs-viewer/sitemap.xml'},
          ],
        },
      ],
      copyright: `As You Wish Ecosystem Documentation`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'python'],
    },
  } satisfies Preset.ThemeConfig,

  // Static files for AI access
  staticDirectories: ['static'],
};

export default config;
