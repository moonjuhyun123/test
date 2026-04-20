export type TagVariant = 'solid' | 'subtle' | 'outline';
export type TagSize = 'sm' | 'md';

export interface TagProps {
  label: string;
  variant?: TagVariant;
  size?: TagSize;
  color?: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export function Tag(props: TagProps) {
  const { label, variant = 'subtle', size = 'md', color, selected, onClick, onRemove } = props;
  return (
    <span
      className={`tag tag-${variant} tag-${size}${selected ? ' tag-selected' : ''}${onClick ? ' tag-clickable' : ''}`}
      style={color ? { ['--tag-color' as string]: color } : undefined}
      onClick={onClick}
    >
      <span>{label}</span>
      {onRemove ? (
        <button
          type="button"
          className="tag-remove"
          aria-label="제거"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
        >×</button>
      ) : null}
    </span>
  );
}
