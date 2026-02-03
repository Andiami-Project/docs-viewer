export default function Loading() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Hero skeleton */}
        <div className="bg-white rounded-2xl p-8 md:p-12 mb-8 animate-pulse border border-slate-200">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-slate-200 rounded w-3/4 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
