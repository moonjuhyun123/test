export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return <span className={`avatar avatar-${size}`} aria-label={name}>{initial}</span>;
}
