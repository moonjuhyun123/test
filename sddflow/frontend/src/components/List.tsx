import type { ReactNode } from 'react';

export interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyOf: (item: T, index: number) => string | number;
  onItemClick?: (item: T, index: number) => void;
  emptyState?: ReactNode;
}

export function List<T>({ items, renderItem, keyOf, onItemClick, emptyState }: ListProps<T>) {
  if (items.length === 0) return <>{emptyState ?? null}</>;
  return (
    <ul className="list" role="list">
      {items.map((item, i) => (
        <li
          key={keyOf(item, i)}
          className={`list-item${onItemClick ? ' list-item-clickable' : ''}`}
          onClick={onItemClick ? () => onItemClick(item, i) : undefined}
        >
          {renderItem(item, i)}
        </li>
      ))}
    </ul>
  );
}
