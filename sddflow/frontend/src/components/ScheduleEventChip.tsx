export interface ScheduleEventChipProps {
  title: string;
  startAt: string;
  endAt: string;
  isRepeat?: boolean;
  onClick?: () => void;
}

export function ScheduleEventChip({ title, startAt, endAt, isRepeat, onClick }: ScheduleEventChipProps) {
  const time = startAt.slice(11, 16);
  return (
    <button
      type="button"
      className="schedule-chip"
      title={`${startAt} ~ ${endAt}`}
      onClick={onClick}
    >
      <span className="schedule-chip-time">{time}</span>
      <span className="schedule-chip-title">{title}</span>
      {isRepeat ? <span className="schedule-chip-repeat" aria-label="반복">R</span> : null}
    </button>
  );
}
