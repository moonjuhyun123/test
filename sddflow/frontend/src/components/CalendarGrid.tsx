import type { ScheduleCalendarItem } from '@/types/domain';

export interface CalendarGridProps {
  view: 'month' | 'week';
  anchor: string; // month=yyyy-MM-01, week=yyyy-MM-dd(월요일)
  events: ScheduleCalendarItem[];
  onCellClick?: (date: string) => void;
  onEventClick?: (event: ScheduleCalendarItem) => void;
}

export function CalendarGrid({ view, anchor, events, onCellClick, onEventClick }: CalendarGridProps) {
  // /build-design-system 단계는 구조만. 실제 그리드 계산은 /implement-front schedule 도메인에서.
  return (
    <div className={`calendar-grid calendar-${view}`} data-anchor={anchor}>
      <div className="calendar-placeholder">
        <div>캘린더 {view === 'month' ? '월' : '주'} 뷰</div>
        <div className="field-hint">{events.length}개 이벤트</div>
        <button type="button" onClick={() => onCellClick?.(anchor)} className="btn btn-secondary btn-sm">
          셀 클릭 핸들러
        </button>
        {events.slice(0, 3).map((ev) => (
          <button
            key={ev.id + (ev.occurrenceDate ?? '')}
            type="button"
            className="calendar-event-sample"
            onClick={() => onEventClick?.(ev)}
          >
            {ev.title}
          </button>
        ))}
      </div>
    </div>
  );
}
