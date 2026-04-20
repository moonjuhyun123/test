import type { TagSummary } from '@/types/domain';
import { Tag } from './Tag';

export interface TagPickerProps {
  label?: string;
  options: TagSummary[];
  value: TagSummary[];
  onChange: (value: TagSummary[]) => void;
  allowCreate?: boolean;
  maxDepth?: number;
  disabled?: boolean;
  placeholder?: string;
}

export function TagPicker(props: TagPickerProps) {
  const { label, options, value, onChange, disabled, placeholder } = props;

  function toggle(tag: TagSummary): void {
    const exists = value.some((t) => t.id === tag.id);
    onChange(exists ? value.filter((t) => t.id !== tag.id) : [...value, tag]);
  }

  return (
    <div className="tag-picker" data-disabled={disabled ? 'true' : undefined}>
      {label ? <span className="field-label">{label}</span> : null}
      <div className="tag-picker-selected">
        {value.length === 0 && placeholder ? <span className="field-hint">{placeholder}</span> : null}
        {value.map((t) => (
          <Tag key={t.id} label={t.name} onRemove={() => toggle(t)} />
        ))}
      </div>
      <div className="tag-picker-options">
        {options.map((opt) => (
          <Tag
            key={opt.id}
            label={opt.name}
            selected={value.some((v) => v.id === opt.id)}
            onClick={() => toggle(opt)}
          />
        ))}
      </div>
    </div>
  );
}
