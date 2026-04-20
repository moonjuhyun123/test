export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
}

export function Divider({ orientation = 'horizontal' }: DividerProps) {
  return <span role="separator" aria-orientation={orientation} className={`divider divider-${orientation}`} />;
}
