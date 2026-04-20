import { useState } from 'react';
import type { ScheduleReminderEvent } from '@/types/domain';

export interface NotificationToastProps {
  event: ScheduleReminderEvent;
  onOpenSchedule: (scheduleId: number) => void;
  onClose?: () => void;
}

export function NotificationToast({ event, onOpenSchedule, onClose }: NotificationToastProps) {
  const [expanded, setExpanded] = useState(false);
  const time = event.startAt.slice(11, 16);

  return (
    <div className="toast toast-info toast-notification">
      <div className="toast-body">
        <button
          type="button"
          className="toast-title notification-title"
          onClick={() => onOpenSchedule(event.scheduleId)}
        >
          곧 시작: {event.title} ({time})
        </button>
        {event.linkedMemos.length > 0 ? (
          <button
            type="button"
            className="notification-expand"
            onClick={() => setExpanded(!expanded)}
          >
            연결된 메모 {event.linkedMemos.length}개 {expanded ? '접기' : '보기'}
          </button>
        ) : null}
        {expanded ? (
          <ul className="notification-memos">
            {event.linkedMemos.map((m) => (
              <li key={m.memoId}>
                <strong>{m.title}</strong>
                {m.bodyExcerpt ? <p>{m.bodyExcerpt}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {onClose ? (
        <button type="button" className="toast-close" aria-label="닫기" onClick={onClose}>×</button>
      ) : null}
    </div>
  );
}
