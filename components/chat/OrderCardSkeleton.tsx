export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full max-w-sm my-2 animate-pulse">
      <div className="p-4 border-b border-gray-50 flex justify-between items-start bg-gray-50/30">
        <div>
          <div className="h-3 bg-gray-200 rounded w-24 mb-1.5"></div>
          <div className="h-2.5 bg-gray-100 rounded w-32"></div>
        </div>
        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
      </div>

      <div className="p-4">
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="h-10 w-10 bg-gray-200 rounded-md shrink-0"></div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}
