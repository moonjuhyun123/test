export interface DateTimePickerProps {
  label?: string;
  value: string | null; // ISO-8601 `yyyy-MM-ddTHH:mm:ss`
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  step?: number; // minutes
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function DateTimePicker(props: DateTimePickerProps) {
  const { label, value, onChange, min, max, step = 15, error, disabled, required } = props;
  // `datetime-local`는 초 단위 없이 `yyyy-MM-ddTHH:mm`까지만 입력. 저장 시 `:00` 보정.
  const display = value ? value.slice(0, 16) : '';
  return (
    <label className="field" data-invalid={error ? 'true' : undefined}>
      {label ? <span className="field-label">{label}{required ? ' *' : ''}</span> : null}
      <input
        type="datetime-local"
        className="field-input"
        value={display}
        min={min?.slice(0, 16)}
        max={max?.slice(0, 16)}
        step={step * 60}
        disabled={disabled}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v.length === 16 ? `${v}:00` : v);
        }}
      />
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
