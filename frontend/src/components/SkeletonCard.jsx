/**
 * SkeletonCard — shimmer placeholder while issue cards are loading
 */
export default function SkeletonCard() {
  return (
    <div className="issue-card flex flex-col pointer-events-none" aria-hidden="true">
      {/* Image area */}
      <div className="skeleton h-44 w-full rounded-none" />
      {/* Content */}
      <div className="p-4 space-y-3 flex-1">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-full rounded-lg" />
        <div className="skeleton h-3 w-4/5 rounded-lg" />
        <div className="flex gap-2 pt-2">
          <div className="skeleton h-3 w-24 rounded-lg" />
          <div className="skeleton h-3 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
