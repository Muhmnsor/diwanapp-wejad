export const EventLoadingState = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 animate-pulse">
        {/* Header skeleton */}
        <div className="h-[400px] bg-gray-200 rounded-lg w-full" />
        
        {/* Title skeleton */}
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        
        {/* Action buttons skeleton */}
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-gray-200 rounded" />
          <div className="h-10 w-10 bg-gray-200 rounded" />
          <div className="h-10 w-10 bg-gray-200 rounded" />
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
};