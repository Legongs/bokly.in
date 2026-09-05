export default function StaffLoading() {
  return (
    <main className="min-h-screen bg-stone-50 pb-20 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-200" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-stone-200 rounded-lg" />
              <div className="h-3 w-28 bg-stone-100 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
      {/* List skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-[1.5rem] p-5 border border-stone-100 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-stone-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 bg-stone-200 rounded-lg" />
              <div className="h-3 w-20 bg-stone-100 rounded-lg" />
            </div>
            <div className="h-8 w-8 bg-stone-100 rounded-xl flex-shrink-0" />
          </div>
        ))}
      </div>
    </main>
  );
}
