export interface RadioOption<V extends string> {
  value: V;
  label: string;
}

export interface RadioGroupProps<V extends string> {
  name: string;
  options: RadioOption<V>[];
  value: V;
  onChange: (value: V) => void;
  disabled?: boolean;
}

export function RadioGroup<V extends string>(props: RadioGroupProps<V>) {
  const { name, options, value, onChange, disabled } = props;
  return (
    <div className="radio-group" role="radiogroup">
      {options.map((opt) => (
        <label key={opt.value} className="radio">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            disabled={disabled}
            onChange={() => onChange(opt.value)}
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
