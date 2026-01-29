interface ParsedMarkdown {
  headings: Array<{
    level: number;
    text: string;
    id: string;
  }>;
  sections: Array<{
    title: string;
    content: string;
  }>;
  codeBlocks: Array<{
    language: string;
    code: string;
  }>;
  installCommands: string[];
}

export function parseMarkdownStructure(markdown: string): ParsedMarkdown {
  const headings: ParsedMarkdown['headings'] = [];
  const sections: ParsedMarkdown['sections'] = [];
  const codeBlocks: ParsedMarkdown['codeBlocks'] = [];
  const installCommands: string[] = [];

  // Split by lines
  const lines = markdown.split('\n');
  let currentSection = { title: '', content: '' };
  let inCodeBlock = false;
  let currentCodeBlock = { language: '', code: '' };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect headings (# Heading)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch && !inCodeBlock) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

      headings.push({ level, text, id });

      // Save previous section
      if (currentSection.title && currentSection.content.trim()) {
        sections.push({ ...currentSection });
      }

      // Start new section
      currentSection = { title: text, content: '' };
      continue;
    }

    // Detect code block start/end (```language)
    const codeBlockMatch = line.match(/^```(\w*)$/);
    if (codeBlockMatch) {
      if (!inCodeBlock) {
        // Start of code block
        inCodeBlock = true;
        currentCodeBlock = { language: codeBlockMatch[1] || 'text', code: '' };
      } else {
        // End of code block
        inCodeBlock = false;
        codeBlocks.push({ ...currentCodeBlock });

        // Detect install commands
        if (['bash', 'sh', 'shell'].includes(currentCodeBlock.language)) {
          const commands = currentCodeBlock.code.split('\n').filter(cmd =>
            cmd.trim().match(/^(npm|yarn|pnpm|pip|cargo|composer|gem|go get)\s+/)
          );
          installCommands.push(...commands.map(cmd => cmd.trim()));
        }

        currentCodeBlock = { language: '', code: '' };
      }
      continue;
    }

    // Accumulate code block lines
    if (inCodeBlock) {
      currentCodeBlock.code += (currentCodeBlock.code ? '\n' : '') + line;
      continue;
    }

    // Accumulate section content
    currentSection.content += (currentSection.content ? '\n' : '') + line;
  }

  // Save last section
  if (currentSection.title && currentSection.content.trim()) {
    sections.push(currentSection);
  }

  return {
    headings,
    sections,
    codeBlocks,
    installCommands: [...new Set(installCommands)], // Remove duplicates
  };
}

export function extractReadmePreview(markdown: string, charLimit: number = 300): string {
  // Remove code blocks for preview
  const withoutCodeBlocks = markdown.replace(/```[\s\S]*?```/g, '');

  // Remove headings
  const withoutHeadings = withoutCodeBlocks.replace(/^#{1,6}\s+.+$/gm, '');

  // Get first meaningful paragraph
  const paragraphs = withoutHeadings
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 20); // Skip very short paragraphs

  const preview = paragraphs[0] || withoutHeadings.substring(0, charLimit);

  return preview.substring(0, charLimit).trim() + (preview.length > charLimit ? '...' : '');
}
