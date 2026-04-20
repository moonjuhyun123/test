import { useState } from 'react';

export interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onSubmit: (value: string) => void;
  onChange?: (value: string) => void;
}

export function SearchBar({ value, placeholder = '검색', onSubmit, onChange }: SearchBarProps) {
  const [local, setLocal] = useState(value ?? '');
  const current = value ?? local;

  function submit(): void {
    const v = current.trim();
    if (v.length === 0) return;
    onSubmit(v);
  }

  return (
    <div className="search-bar">
      <input
        type="search"
        className="search-bar-input"
        placeholder={placeholder}
        value={current}
        onChange={(e) => {
          setLocal(e.target.value);
          onChange?.(e.target.value);
        }}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
      />
      <button type="button" className="search-bar-submit" onClick={submit} aria-label="검색">🔍</button>
    </div>
  );
}
