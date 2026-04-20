export interface SelectOption<V extends string | number> {
  value: V;
  label: string;
}

export interface SelectProps<V extends string | number> {
  label?: string;
  options: SelectOption<V>[];
  value: V | null;
  onChange: (value: V) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function Select<V extends string | number>(props: SelectProps<V>) {
  const { label, options, value, onChange, placeholder, disabled, error } = props;
  return (
    <label className="field" data-invalid={error ? 'true' : undefined}>
      {label ? <span className="field-label">{label}</span> : null}
      <select
        className="field-select"
        value={value === null ? '' : String(value)}
        disabled={disabled}
        onChange={(e) => {
          const v = e.target.value;
          const picked = options.find((o) => String(o.value) === v);
          if (picked) onChange(picked.value);
        }}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
        ))}
      </select>
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
