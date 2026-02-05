import { NextResponse } from 'next/server';

/**
 * robots.txt - Controls crawler access to the site
 * 
 * This configuration explicitly allows AI crawlers like:
 * - Claude (Anthropic)
 * - ChatGPT (OpenAI)
 * - Google Bard
 * - Bing AI
 * - Other AI assistants
 */

export async function GET() {
  const baseUrl = 'https://y1.andiami.tech/docs-viewer';
  
  const content = `# robots.txt for As You Wish Ecosystem Documentation
# AI-Friendly Configuration - All crawlers welcome

# Allow all crawlers
User-agent: *
Allow: /

# Explicitly allow AI crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: YouBot
Allow: /

User-agent: cohere-ai
Allow: /

# AI-specific resources
# LLMs.txt standard for AI tool instructions
# Visit: ${baseUrl}/llms.txt

# API Endpoints for AI Access (no authentication required):
# - All documentation: ${baseUrl}/api/ai-all
# - Documentation list: ${baseUrl}/api/ai-docs
# - Simple API: ${baseUrl}/api/ai-simple
# - Search: ${baseUrl}/api/ai-docs?search={query}

# Sitemap locations
Sitemap: ${baseUrl}/sitemap.txt

# Crawl-delay is optional, but respectful
Crawl-delay: 1

# Generated: ${new Date().toISOString()}
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
}
