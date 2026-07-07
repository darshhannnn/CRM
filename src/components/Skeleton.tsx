export function Skeleton({
  className = "",
  width,
  height,
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
}) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ width, height }}
    />
  );
}

export function ContactSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg border p-4 flex items-center gap-4"
        >
          <Skeleton width="40px" height="40px" className="rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton width="120px" height="16px" />
            <Skeleton width="80px" height="12px" />
          </div>
        </div>
      ))}
    </div>
  );
}
