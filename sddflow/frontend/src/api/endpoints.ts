// 11_API_스펙의 엔드포인트 목록을 타입 세이프 함수로 노출.
// /implement-front 단계에서 각 도메인이 이 함수들을 호출.

import { apiDelete, apiGet, apiPatch, apiPost } from './client';
import type {
  AttachmentItem,
  LinkRequest,
  LinkResult,
  LinkedMemoItem,
  LinkedScheduleItem,
  LoginRequest,
  LoginResult,
  MemoCardItem,
  MemoCreateRequest,
  MemoDetail,
  MemoUpdateRequest,
  ScheduleCalendarItem,
  ScheduleCreateRequest,
  ScheduleDetail,
  ScheduleUpdateRequest,
  SearchItem,
  SearchQuery,
  TagCreateRequest,
  TagNode,
  TagUpdateRequest,
  UserMe
} from '@/types/domain';
import type { PagedResponse } from '@/types/api';

// auth
export const authApi = {
  login: (body: LoginRequest) => apiPost<LoginResult>('/auth/login', body),
  me: () => apiGet<UserMe>('/auth/me')
};

// schedules
export const scheduleApi = {
  create: (body: ScheduleCreateRequest) => apiPost<ScheduleDetail>('/schedules', body),
  list: (from: string, to: string, tagIds?: number[]) =>
    apiGet<ScheduleCalendarItem[]>('/schedules', { from, to, tagIds }),
  get: (id: number) => apiGet<ScheduleDetail>(`/schedules/${id}`),
  update: (id: number, body: ScheduleUpdateRequest) =>
    apiPatch<ScheduleDetail>(`/schedules/${id}`, body),
  remove: (id: number) => apiDelete<void>(`/schedules/${id}`),
  linkedMemos: (id: number) => apiGet<LinkedMemoItem[]>(`/schedules/${id}/linked-memos`),
  attachments: (id: number) => apiGet<AttachmentItem[]>(`/schedules/${id}/attachments`)
};

// memos
export const memoApi = {
  create: (body: MemoCreateRequest) => apiPost<MemoDetail>('/memos', body),
  list: (params: { keyword?: string; tagIds?: number[]; page?: number; size?: number }) =>
    apiGet<PagedResponse<MemoCardItem>>('/memos', params),
  get: (id: number) => apiGet<MemoDetail>(`/memos/${id}`),
  update: (id: number, body: MemoUpdateRequest) => apiPatch<MemoDetail>(`/memos/${id}`, body),
  remove: (id: number) => apiDelete<void>(`/memos/${id}`),
  linkedSchedules: (id: number) => apiGet<LinkedScheduleItem[]>(`/memos/${id}/linked-schedules`),
  attachments: (id: number) => apiGet<AttachmentItem[]>(`/memos/${id}/attachments`)
};

// links
export const linkApi = {
  create: (body: LinkRequest) => apiPost<LinkResult>('/links', body),
  remove: (id: number) => apiDelete<void>(`/links/${id}`)
};

// tags
export const tagApi = {
  list: () => apiGet<TagNode[]>('/tags'),
  create: (body: TagCreateRequest) => apiPost<TagNode>('/tags', body),
  update: (id: number, body: TagUpdateRequest) => apiPatch<TagNode>(`/tags/${id}`, body),
  remove: (id: number) => apiDelete<void>(`/tags/${id}`)
};

// attachments
export const attachmentApi = {
  upload: (targetType: 'SCHEDULE' | 'MEMO', targetId: number, file: File) => {
    const form = new FormData();
    form.append('targetType', targetType);
    form.append('targetId', String(targetId));
    form.append('file', file);
    return apiPost<AttachmentItem>('/attachments', form);
  },
  downloadUrl: (id: number) => `${import.meta.env.VITE_API_BASE || '/api'}/attachments/${id}/download`,
  remove: (id: number) => apiDelete<void>(`/attachments/${id}`)
};

// search
export const searchApi = {
  search: (query: SearchQuery & { page?: number; size?: number }) =>
    apiGet<PagedResponse<SearchItem>>('/search', { ...query, q: query.q })
};
