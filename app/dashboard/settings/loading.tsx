export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-36 bg-stone-200 rounded-lg" />
        <div className="h-4 w-60 bg-stone-100 rounded-lg" />
      </div>
      {/* Tab bar skeleton */}
      <div className="flex gap-2 border-b border-stone-200 pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-24 bg-stone-100 rounded-xl" />
        ))}
      </div>
      {/* Form skeleton */}
      <div className="bg-white rounded-[2rem] p-6 border border-stone-100 space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 bg-stone-200 rounded" />
            <div className="h-10 w-full bg-stone-100 rounded-xl" />
          </div>
        ))}
        <div className="h-10 w-28 bg-stone-200 rounded-xl mt-4" />
      </div>
    </div>
  );
}
