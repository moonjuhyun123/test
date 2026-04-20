// 도메인 DTO — 11_API_스펙 응답 구조 그대로

import type { AttachmentTargetType, LinkOrigin, RepeatRule, SearchType, UserRole } from './enums';

// ── 사용자/인증 ───────────────────────────────────────

export interface LoginRequest {
  id: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  expiresIn: number;
  user: UserMe;
}

export interface UserMe {
  id: number;
  loginId: string;
  role: UserRole;
}

// ── 일정 ─────────────────────────────────────────────

export interface ScheduleCreateRequest {
  title: string;
  startAt: string;
  endAt: string;
  location?: string | null;
  repeatRule?: RepeatRule;
  remindBeforeMinutes?: number;
  tagIds?: number[];
  sourceMemoId?: number | null;
}

export type ScheduleUpdateRequest = Partial<Omit<ScheduleCreateRequest, 'sourceMemoId'>>;

export interface TagSummary {
  id: number;
  ownerId: number;
  name: string;
  parentId: number | null;
  depth: number;
}

export interface ScheduleDetail {
  id: number;
  title: string;
  startAt: string;
  endAt: string;
  location: string | null;
  repeatRule: RepeatRule;
  remindBeforeMinutes: number;
  tags: TagSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleCalendarItem {
  id: number;
  occurrenceDate: string | null;
  title: string;
  startAt: string;
  endAt: string;
  location: string | null;
  isRepeat: boolean;
}

export interface ScheduleQuery {
  from: string;
  to: string;
  tagIds?: number[];
}

// ── 메모 ─────────────────────────────────────────────

export interface MemoCreateRequest {
  title: string;
  body?: string | null;
  tagIds?: number[];
  attachToScheduleId?: number | null;
}

export type MemoUpdateRequest = Partial<Pick<MemoCreateRequest, 'title' | 'body' | 'tagIds'>>;

export interface MemoDetail {
  id: number;
  title: string;
  body: string | null;
  tags: TagSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface MemoCardItem {
  id: number;
  title: string;
  bodyExcerpt: string | null;
  updatedAt: string;
  tags: TagSummary[];
}

export interface MemoQuery {
  keyword?: string;
  tagIds?: number[];
}

// ── 연결 ─────────────────────────────────────────────

export interface LinkRequest {
  scheduleId: number;
  memoId: number;
  origin: LinkOrigin;
}

export interface LinkResult {
  linkId: number;
  scheduleId: number;
  memoId: number;
  origin: LinkOrigin;
  createdAt: string;
  alreadyExisted: boolean;
}

export interface LinkedMemoItem {
  linkId: number;
  memoId: number;
  title: string;
  bodyExcerpt: string | null;
  updatedAt: string;
  linkedAt: string;
}

export interface LinkedScheduleItem {
  linkId: number;
  scheduleId: number;
  title: string;
  startAt: string;
  endAt: string;
  location: string | null;
  linkedAt: string;
}

// ── 태그 ─────────────────────────────────────────────

export interface TagCreateRequest {
  name: string;
  parentId?: number | null;
}

export interface TagUpdateRequest {
  name?: string;
  parentId?: number | null;
}

export interface TagNode {
  id: number;
  name: string;
  parentId: number | null;
  depth: number;
}

// ── 첨부 ─────────────────────────────────────────────

export interface AttachmentItem {
  id: number;
  targetType: AttachmentTargetType;
  targetId: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  downloadUrl: string;
  createdAt: string;
}

// ── 검색 ─────────────────────────────────────────────

export interface SearchItem {
  type: SearchType extends 'ALL' ? never : 'SCHEDULE' | 'MEMO';
  id: number;
  title: string;
  summary: string | null;
  startAt: string | null;
  endAt: string | null;
  updatedAt: string | null;
  sortAt: string;
  tags: TagSummary[];
}

export interface SearchQuery {
  q: string;
  type?: SearchType;
  tagIds?: number[];
}

// ── 알림 (SSE 페이로드) ──────────────────────────────

export interface NotificationLinkedMemo {
  memoId: number;
  title: string;
  bodyExcerpt: string | null;
}

export interface ScheduleReminderEvent {
  scheduleId: number;
  title: string;
  startAt: string;
  linkedMemos: NotificationLinkedMemo[];
}
