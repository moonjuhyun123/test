export interface PaginationProps {
  page: number;
  size: number;
  totalPages: number;
  onChange: (page: number) => void;
  boundary?: number;
  sibling?: number;
}

export function Pagination(props: PaginationProps) {
  const { page, totalPages, onChange, sibling = 1 } = props;
  if (totalPages <= 0) return null;

  const start = Math.max(0, page - sibling);
  const end = Math.min(totalPages - 1, page + sibling);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="pagination" role="navigation" aria-label="페이지 이동">
      <button
        type="button"
        className="pagination-btn"
        disabled={page <= 0}
        onClick={() => onChange(page - 1)}
      >이전</button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`pagination-btn${p === page ? ' pagination-current' : ''}`}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onChange(p)}
        >{p + 1}</button>
      ))}
      <button
        type="button"
        className="pagination-btn"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >다음</button>
    </nav>
  );
}
