export default function ServicesLoading() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-7 w-48 bg-stone-200 rounded-lg" />
        <div className="h-4 w-80 bg-stone-100 rounded-lg" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-[1.5rem] p-5 border border-stone-100 flex items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="h-5 w-36 bg-stone-200 rounded-lg" />
              <div className="h-3 w-24 bg-stone-100 rounded-lg" />
            </div>
            <div className="h-8 w-20 bg-stone-100 rounded-xl flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
