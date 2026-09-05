export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-stone-50 pb-20 overflow-x-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white border-b border-stone-200 px-4 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="w-14 h-14 rounded-[1.2rem] bg-stone-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-40 bg-stone-200 rounded-lg" />
            <div className="h-4 w-56 bg-stone-100 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            {/* Metric cards skeleton */}
            <div className="flex gap-4 overflow-hidden">
              <div className="min-w-[200px] flex-shrink-0 lg:min-w-0 bg-white rounded-[2rem] p-6 h-32 border border-stone-100" />
              <div className="min-w-[200px] flex-shrink-0 lg:min-w-0 bg-stone-100 rounded-[2rem] p-6 h-32 border border-stone-100" />
            </div>
            {/* Timeline skeleton */}
            <div className="bg-white rounded-[2rem] p-6 border border-stone-100 space-y-4">
              <div className="h-5 w-32 bg-stone-200 rounded-lg" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-stone-200 mt-2 flex-shrink-0" />
                  <div className="flex-1 h-14 bg-stone-100 rounded-2xl" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2rem] p-6 border border-stone-100 h-64" />
          </div>
        </div>
      </div>
    </main>
  );
}
