export function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`}></div>
  );
}

export function ChannelSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-transparent bg-white shadow-sm">
      <Skeleton className="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-2 w-1/2" />
      </div>
    </div>
  );
}

export function EmissionSkeleton() {
    return (
      <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl">
        <Skeleton className="w-14 h-14" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-full" />
        </div>
        <Skeleton className="w-20 h-8" />
      </div>
    );
  }
