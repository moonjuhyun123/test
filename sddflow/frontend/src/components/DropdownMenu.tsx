import type { ReactNode } from 'react';
import { useState } from 'react';

export interface MenuItem {
  key: string;
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface DropdownMenuProps {
  trigger: ReactNode;
  items: MenuItem[];
  align?: 'start' | 'end';
}

export function DropdownMenu({ trigger, items, align = 'end' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="dropdown">
      <button type="button" className="dropdown-trigger" onClick={() => setOpen(!open)}>
        {trigger}
      </button>
      {open ? (
        <ul className={`dropdown-menu dropdown-align-${align}`} role="menu">
          {items.map((item) => (
            <li key={item.key} role="menuitem">
              <button
                type="button"
                className="dropdown-item"
                disabled={item.disabled}
                onClick={() => { item.onSelect(); setOpen(false); }}
              >
                {item.icon ? <span className="dropdown-item-icon">{item.icon}</span> : null}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
