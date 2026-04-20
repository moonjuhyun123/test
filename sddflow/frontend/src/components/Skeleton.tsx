export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  count?: number;
}

export function Skeleton({ width = '100%', height = 16, rounded, count = 1 }: SkeletonProps) {
  const items = Array.from({ length: count });
  return (
    <>
      {items.map((_, i) => (
        <span
          key={i}
          className={`skeleton${rounded ? ' skeleton-rounded' : ''}`}
          style={{ width, height, display: 'block', marginBottom: i < count - 1 ? 8 : 0 }}
        />
      ))}
    </>
  );
}
