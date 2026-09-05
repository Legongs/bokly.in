export default function AnalyticsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-36 bg-stone-200 rounded-lg" />
        <div className="h-4 w-64 bg-stone-100 rounded-lg" />
      </div>
      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-[1.5rem] p-5 border border-stone-100 space-y-2">
            <div className="h-3 w-16 bg-stone-100 rounded" />
            <div className="h-8 w-20 bg-stone-200 rounded-lg" />
          </div>
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="bg-white rounded-[2rem] p-6 border border-stone-100 h-64" />
    </div>
  );
}
