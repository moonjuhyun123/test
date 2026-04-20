import type { ReactNode } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

export function Modal(props: ModalProps) {
  const { open, onClose, title, footer, size = 'md', children } = props;
  if (!open) return null;
  return (
    <div className="modal-root" role="dialog" aria-modal="true" onClick={onClose}>
      <div className={`modal-panel modal-${size}`} onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
        </header>
        <div className="modal-body">{children}</div>
        {footer ? <footer className="modal-footer">{footer}</footer> : null}
      </div>
    </div>
  );
}
