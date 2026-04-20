import type { ReactNode } from 'react';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
  variant?: ToastVariant;
  title: string;
  description?: string;
  duration?: number; // ms
  action?: ReactNode;
  onClose?: () => void;
}

export function Toast({ variant = 'info', title, description, action, onClose }: ToastProps) {
  return (
    <div className={`toast toast-${variant}`} role="status">
      <div className="toast-body">
        <div className="toast-title">{title}</div>
        {description ? <div className="toast-description">{description}</div> : null}
      </div>
      {action ? <div className="toast-action">{action}</div> : null}
      {onClose ? (
        <button type="button" className="toast-close" aria-label="닫기" onClick={onClose}>×</button>
      ) : null}
    </div>
  );
}
