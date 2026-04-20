// 공용 enum — 11_API_스펙 / 06_공통_구조 / 03_ERD 상태값 기준

export type UserRole = 'USER';

export type ResourceType = 'SCHEDULE' | 'MEMO';

export type RepeatRule = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type LinkOrigin = 'SCHEDULE_TO_MEMO' | 'MEMO_TO_SCHEDULE';

export type SearchType = 'ALL' | 'SCHEDULE' | 'MEMO';

export type AttachmentTargetType = 'SCHEDULE' | 'MEMO';
