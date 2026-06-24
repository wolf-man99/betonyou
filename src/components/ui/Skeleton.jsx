export default function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-card ${className}`} />
}

// A bet-card-shaped skeleton used on Home / Bets while loading.
export function BetCardSkeleton() {
  return (
    <div className="bg-white rounded-card shadow-card p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <Skeleton className="h-7 w-20 rounded" />
      <Skeleton className="h-[5px] w-full rounded-full" />
      <Skeleton className="h-3 w-40 rounded" />
      <Skeleton className="h-11 w-full rounded-btn" />
    </div>
  )
}
