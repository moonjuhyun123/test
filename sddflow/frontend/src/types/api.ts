// 06_공통_구조_설계서.md 기준. 백엔드 ApiResponse<T> / PagedResponse<T> / ErrorBody 와 1:1

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ErrorBody | null;
  timestamp: string;
}

export interface ErrorBody {
  code: string;
  message: string;
  details: FieldError[];
  path: string;
}

export interface FieldError {
  field: string;
  reason: string;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface PageQuery {
  page?: number;
  size?: number;
  sort?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly fieldErrors: FieldError[],
    public readonly path: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromErrorBody(status: number, body: ErrorBody): ApiError {
    return new ApiError(status, body.code, body.details ?? [], body.path ?? '', body.message);
  }
}
