import type { ReactNode } from 'react';
import { useState } from 'react';

export interface PopoverProps {
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  children: ReactNode;
}

export function Popover({ content, placement = 'bottom', trigger = 'hover', children }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const toggle = (next: boolean) => () => setOpen(next);

  const triggers = trigger === 'hover'
    ? { onMouseEnter: toggle(true), onMouseLeave: toggle(false) }
    : { onClick: () => setOpen(!open) };

  return (
    <span className="popover-anchor" {...triggers}>
      {children}
      {open ? <span className={`popover popover-${placement}`} role="tooltip">{content}</span> : null}
    </span>
  );
}
