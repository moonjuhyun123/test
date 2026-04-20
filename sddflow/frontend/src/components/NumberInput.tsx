export interface NumberInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  disabled?: boolean;
}

export function NumberInput({ label, value, onChange, min, max, step = 1, error, disabled }: NumberInputProps) {
  return (
    <label className="field" data-invalid={error ? 'true' : undefined}>
      {label ? <span className="field-label">{label}</span> : null}
      <input
        type="number"
        className="field-input"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
