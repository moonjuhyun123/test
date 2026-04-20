export interface TabItem<V extends string> {
  value: V;
  label: string;
}

export interface TabsProps<V extends string> {
  items: TabItem<V>[];
  value: V;
  onChange: (value: V) => void;
  size?: 'sm' | 'md';
}

export function Tabs<V extends string>(props: TabsProps<V>) {
  const { items, value, onChange, size = 'md' } = props;
  return (
    <div className={`tabs tabs-${size}`} role="tablist">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          className={`tab${value === item.value ? ' tab-active' : ''}`}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
