export default function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-surface">
      <div className="aspect-[4/5] animate-pulse bg-surface-elevated" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/3 animate-pulse rounded bg-surface-elevated" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-elevated" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-surface-elevated" />
      </div>
    </div>
  );
}