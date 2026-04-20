import type { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  type?: 'button' | 'submit';
  onClick?: () => void;
  children?: ReactNode;
}

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    type = 'button',
    onClick,
    children
  } = props;

  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size}${fullWidth ? ' btn-full' : ''}`}
      disabled={disabled || loading}
      data-loading={loading ? 'true' : undefined}
      onClick={onClick}
    >
      {leftIcon ? <span className="btn-icon">{leftIcon}</span> : null}
      <span className="btn-label">{children}</span>
      {rightIcon ? <span className="btn-icon">{rightIcon}</span> : null}
    </button>
  );
}
