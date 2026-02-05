export default function AIDocsHelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          AI-Accessible Documentation API
        </h1>
        <p className="text-lg text-slate-600 dark:text-gray-300 mb-8">
          This API provides documentation in a format optimized for AI consumption (Claude, ChatGPT, etc.)
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
            Quick Start
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-slate-800 dark:text-gray-200 mb-2">
                1. List all projects
              </h3>
              <code className="block bg-slate-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                GET https://y1.andiami.tech/docs-viewer/api/ai-simple
              </code>
            </div>

            <div>
              <h3 className="font-medium text-slate-800 dark:text-gray-200 mb-2">
                2. Get document content
              </h3>
              <code className="block bg-slate-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                GET https://y1.andiami.tech/docs-viewer/api/ai-simple?project=workspace-documentation&file=PM2-NATIVE-MEMORY-ARCHITECTURE.md
              </code>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
            Usage with Claude/ChatGPT
          </h2>
          <p className="text-slate-600 dark:text-gray-300 mb-4">
            AI tools can now access your documentation using WebFetch:
          </p>
          <div className="bg-slate-100 dark:bg-gray-900 p-4 rounded overflow-x-auto">
            <pre className="text-sm">
{`# Example for Claude:
"Using WebFetch, access this URL and list available projects:
https://y1.andiami.tech/docs-viewer/api/ai-simple"

# Get a specific document:
"Using WebFetch, get the PM2 architecture document:
https://y1.andiami.tech/docs-viewer/api/ai-simple
?project=workspace-documentation
&file=PM2-NATIVE-MEMORY-ARCHITECTURE.md
and summarize it"`}
            </pre>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
            Response Format
          </h2>
          <div className="bg-slate-100 dark:bg-gray-900 p-4 rounded overflow-x-auto">
            <pre className="text-sm">
{`{
  "project": "workspace-documentation",
  "file": "PM2-NATIVE-MEMORY-ARCHITECTURE.md",
  "title": "PM2-Native Memory Architecture",
  "content": "# Full markdown content...",
  "size": 28000,
  "lastModified": "2026-02-03T14:22:00.000Z"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
