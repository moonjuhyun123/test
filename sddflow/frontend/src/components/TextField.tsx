import type { ReactNode } from 'react';

export interface TextFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password' | 'search' | 'email';
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
  maxLength?: number;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function TextField(props: TextFieldProps) {
  const { label, value, onChange, type = 'text', placeholder, error, hint, disabled, required,
    readonly, maxLength, leftIcon, rightIcon, onKeyDown } = props;

  return (
    <label className="field" data-invalid={error ? 'true' : undefined}>
      {label ? <span className="field-label">{label}{required ? ' *' : ''}</span> : null}
      <div className="field-input-wrap">
        {leftIcon ? <span className="field-icon">{leftIcon}</span> : null}
        <input
          type={type}
          className="field-input"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readonly}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
        {rightIcon ? <span className="field-icon">{rightIcon}</span> : null}
      </div>
      {error ? <span className="field-error">{error}</span>
        : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
