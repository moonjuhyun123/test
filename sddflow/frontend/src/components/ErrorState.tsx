export interface ErrorStateProps {
  title: string;
  description?: string;
  retry?: () => void;
}

export function ErrorState({ title, description, retry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state-title">{title}</div>
      {description ? <div className="error-state-description">{description}</div> : null}
      {retry ? (
        <button type="button" className="btn btn-secondary btn-sm" onClick={retry}>다시 시도</button>
      ) : null}
    </div>
  );
}
