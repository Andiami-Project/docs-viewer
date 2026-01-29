import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Documentation file not found
        </p>
        <Link
          href="/docs-viewer"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
