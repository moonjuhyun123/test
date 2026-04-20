import type { ReactNode } from 'react';

export interface CardProps {
  children?: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  elevation?: 0 | 1 | 2;
}

export function Card({ children, onClick, selected, elevation = 1 }: CardProps) {
  const clickable = Boolean(onClick);
  return (
    <div
      className={`card card-e${elevation}${selected ? ' card-selected' : ''}${clickable ? ' card-clickable' : ''}`}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (clickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {children}
    </div>
  );
}
