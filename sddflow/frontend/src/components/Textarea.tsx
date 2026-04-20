export interface TextareaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  autoResize?: boolean;
  error?: string;
  hint?: string;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
}

export function Textarea(props: TextareaProps) {
  const { label, value, onChange, rows = 4, error, hint, maxLength, placeholder, disabled } = props;
  return (
    <label className="field" data-invalid={error ? 'true' : undefined}>
      {label ? <span className="field-label">{label}</span> : null}
      <textarea
        className="field-textarea"
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? <span className="field-error">{error}</span>
        : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
