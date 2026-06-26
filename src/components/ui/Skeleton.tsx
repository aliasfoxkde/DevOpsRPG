interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonQuestCard() {
  return (
    <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center gap-4 mb-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function SkeletonShopItem() {
  return (
    <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 text-center">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-3" />
        <Skeleton className="h-5 w-24 mx-auto mb-2" />
        <Skeleton className="h-3 w-16 mx-auto" />
      </div>
      <div className="p-4 border-t border-slate-700/50">
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export function SkeletonRealmCard() {
  return (
    <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-2/3 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}
