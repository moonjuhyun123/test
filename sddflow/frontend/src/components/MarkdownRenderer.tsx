// 본 버전은 체크박스 토글만 지원하는 경량 렌더러.
// 완전한 마크다운 렌더링은 /implement-front memo 도메인에서.

export interface MarkdownRendererProps {
  value: string;
  onChange?: (value: string) => void;
}

export function MarkdownRenderer({ value, onChange }: MarkdownRendererProps) {
  const lines = value.split('\n');
  return (
    <div className="md-renderer">
      {lines.map((line, i) => {
        const unchecked = line.match(/^(\s*)- \[ \] (.*)$/);
        const checked = line.match(/^(\s*)- \[x\] (.*)$/i);
        if (unchecked) {
          const [, prefix, text] = unchecked;
          return (
            <label key={i} className="md-checkbox">
              <input
                type="checkbox"
                checked={false}
                disabled={!onChange}
                onChange={() => onChange?.(replaceLine(value, i, `${prefix ?? ''}- [x] ${text ?? ''}`))}
              />
              <span>{text}</span>
            </label>
          );
        }
        if (checked) {
          const [, prefix, text] = checked;
          return (
            <label key={i} className="md-checkbox">
              <input
                type="checkbox"
                checked
                disabled={!onChange}
                onChange={() => onChange?.(replaceLine(value, i, `${prefix ?? ''}- [ ] ${text ?? ''}`))}
              />
              <span style={{ textDecoration: 'line-through' }}>{text}</span>
            </label>
          );
        }
        return <p key={i} className="md-paragraph">{line}</p>;
      })}
    </div>
  );
}

function replaceLine(text: string, index: number, replacement: string): string {
  const lines = text.split('\n');
  lines[index] = replacement;
  return lines.join('\n');
}
