// 서드파티 선택(Lexical/TipTap/plain)은 /implement-front memo 도메인에서 확정.
// 본 버전은 textarea 기반 plain editor로 시작.

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  onUpload?: (file: File) => Promise<string>; // returns inserted URL
}

export function MarkdownEditor(props: MarkdownEditorProps) {
  const { value, onChange, placeholder, maxLength } = props;
  return (
    <div className="md-editor">
      <textarea
        className="md-editor-textarea"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
