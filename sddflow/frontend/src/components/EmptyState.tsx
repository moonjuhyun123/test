import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon ? <div className="empty-state-icon">{icon}</div> : null}
      <div className="empty-state-title">{title}</div>
      {description ? <div className="empty-state-description">{description}</div> : null}
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  );
}
