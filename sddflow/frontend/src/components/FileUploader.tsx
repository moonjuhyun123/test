import type { AttachmentItem } from '@/types/domain';

export interface FileUploaderProps {
  value: AttachmentItem[];
  onAdd: (file: File) => void | Promise<void>;
  onRemove: (id: number) => void | Promise<void>;
  maxCount?: number;        // default 5
  maxSizeBytes?: number;    // default 10MB
  accept?: string;          // default "image/jpeg,image/png,image/gif,application/pdf"
  disabled?: boolean;
}

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/gif,application/pdf';
const DEFAULT_MAX = 10 * 1024 * 1024;

export function FileUploader(props: FileUploaderProps) {
  const {
    value,
    onAdd,
    onRemove,
    maxCount = 5,
    maxSizeBytes = DEFAULT_MAX,
    accept = DEFAULT_ACCEPT,
    disabled
  } = props;

  const remaining = Math.max(0, maxCount - value.length);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length && i < remaining; i++) {
      const file = files.item(i);
      if (!file) continue;
      if (file.size > maxSizeBytes) continue;
      void onAdd(file);
    }
    e.target.value = '';
  }

  return (
    <div className="file-uploader">
      <ul className="file-uploader-list">
        {value.map((a) => (
          <li key={a.id} className="file-uploader-item">
            <span className="file-uploader-name">{a.fileName}</span>
            <span className="file-uploader-size">{formatSize(a.fileSize)}</span>
            <button
              type="button"
              className="file-uploader-remove"
              aria-label="첨부 제거"
              onClick={() => void onRemove(a.id)}
              disabled={disabled}
            >×</button>
          </li>
        ))}
      </ul>
      <label className="file-uploader-add">
        <input
          type="file"
          accept={accept}
          multiple
          disabled={disabled || remaining === 0}
          onChange={handleSelect}
          hidden
        />
        <span className="btn btn-secondary btn-sm" data-disabled={disabled || remaining === 0 ? 'true' : undefined}>
          파일 추가 ({value.length}/{maxCount})
        </span>
      </label>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
