import type { ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'solid' | 'subtle' | 'outline';
  size?: 'sm' | 'md';
  children?: ReactNode;
}

export function Badge({ variant = 'subtle', size = 'md', children }: BadgeProps) {
  return <span className={`badge badge-${variant} badge-${size}`}>{children}</span>;
}
