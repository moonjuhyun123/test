import type { ReactNode } from 'react';

export interface IconButtonProps {
  icon: ReactNode;
  tooltip: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  onClick?: () => void;
}

export function IconButton({ icon, tooltip, size = 'md', disabled, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`icon-btn icon-btn-${size}`}
      aria-label={tooltip}
      title={tooltip}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}
