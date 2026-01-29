export default function Loading() {
  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-6"></div>

          {/* Content skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-slate-200 dark:border-gray-700">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
