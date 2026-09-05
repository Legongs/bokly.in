export default function PaymentsLoading() {
  return (
    <div className="space-y-6 px-4 py-8 max-w-4xl mx-auto animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-52 bg-stone-200 rounded-lg" />
        <div className="h-4 w-80 bg-stone-100 rounded-lg" />
      </div>
      <div className="bg-white rounded-[2rem] border border-stone-100 overflow-hidden">
        <div className="border-b border-stone-100 px-5 py-3 flex gap-4">
          <div className="h-3 w-24 bg-stone-200 rounded" />
          <div className="h-3 w-16 bg-stone-100 rounded ml-auto" />
          <div className="h-3 w-20 bg-stone-100 rounded" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-4 border-b border-stone-50 last:border-0">
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-32 bg-stone-200 rounded" />
              <div className="h-3 w-20 bg-stone-100 rounded" />
            </div>
            <div className="h-6 w-20 bg-stone-100 rounded-full flex-shrink-0" />
            <div className="h-8 w-8 bg-stone-100 rounded-xl flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
