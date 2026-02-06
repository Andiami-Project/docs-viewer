import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'As You Wish Ecosystem',
  tagline: 'Documentation Hub',
  favicon: 'img/favicon.ico',
  url: 'https://y1.andiami.tech',
  baseUrl: '/docs-viewer/',
  onBrokenLinks: 'warn',
  i18n: { defaultLocale: 'en', locales: ['en'] },
  
  // Use plain markdown, not MDX
  markdown: {
    format: 'md',
  },

  presets: [
    ['classic', {
      docs: { 
        sidebarPath: './sidebars.ts', 
        routeBasePath: '/',
      },
      blog: false,
      theme: { customCss: './src/css/custom.css' },
    } satisfies Preset.Options],
  ],
  themeConfig: {
    colorMode: { defaultMode: 'dark', respectPrefersColorScheme: true },
    navbar: { 
      title: 'As You Wish Docs',
      items: [
        { href: 'https://y1.andiami.tech/docs-viewer/llms.txt', label: 'AI Access', position: 'right' },
      ],
    },
    footer: { style: 'dark', copyright: 'As You Wish Ecosystem' },
    prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula, additionalLanguages: ['bash', 'json', 'typescript'] },
  } satisfies Preset.ThemeConfig,
  staticDirectories: ['static'],
};

export default config;
