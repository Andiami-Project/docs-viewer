export default function Loading() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="h-4 bg-slate-200 rounded w-64 mb-6"></div>

          {/* Content skeleton */}
          <div className="bg-white rounded-xl p-8 border border-slate-200">
            <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-slate-100 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
