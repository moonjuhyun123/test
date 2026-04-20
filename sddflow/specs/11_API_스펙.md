# API 스펙

기준 입력: 01_요구사항명세서.md, 03_ERD.md, 04_도메인_분리.md, 06_공통_구조_설계서.md, 10_표시_데이터_명세.md

## 통합 디테일
- Base URL: `/api`
- 응답 봉투: 06 §ApiResponse<T>, §PagedResponse<T>, §ErrorBody. 204 삭제는 본문 없음.
- 날짜: ISO-8601 로컬(`yyyy-MM-dd'T'HH:mm:ss`). 타임존 제외 (01 MVP 제외 범위).
- 파라미터·필드: **camelCase** (06 §JacksonConfig)
- enum: **문자열 대문자** (`NONE`, `DAILY`, `ALL`, `SCHEDULE`, `MEMO` 등)
- nullable 허용 필드는 각 API 응답 표에 명시. 기본은 `nullable=false`.
- 빈 목록: `[]` (null 금지).
- 페이징 요청: `page`(int, 기본 0), `size`(int, 기본 20, 최대 100), `sort`(`field,asc|desc`, 선택).
- 정렬: 기본 정렬은 API별 명시. 사용자 지정 가능 필드는 enum 제한.
- 인증: 모든 API `Authorization: Bearer {jwt}` 필수. 예외: `POST /api/auth/login`.
- 권한: `@PreAuthorize("isAuthenticated()")` + Service 소유자 검사(06). 403 실질 미사용.
- 에러 코드: 06 §에러 코드 규칙 (`{MODULE}-{4자리}`).

---

# B1 — 사용자/인증

## POST /api/auth/login
- 설명: ID/비밀번호로 JWT 발급 (F001)
- 인증: 불요
- 권한: 불요

### 요청 (application/json)
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | String | Y | login_id |
| password | String | Y | 평문 (HTTPS 전제) |

### 응답 (200) — `ApiResponse<LoginResult>`
| 필드 | 타입 | nullable | 설명 |
|------|------|---------|------|
| accessToken | String | N | JWT |
| expiresIn | Integer | N | 만료 초 (기본 3600) |
| user.id | Long | N | user.id |
| user.loginId | String | N | user.login_id |
| user.role | enum | N | `USER` |

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| USER-4010 | 401 | ID 또는 비밀번호 불일치 |
| COMM-4000 | 400 | 필수 입력 누락 |

---

## GET /api/auth/me
- 설명: 현재 사용자 정보 (S002 셸 초기 로드)
- 인증: 필요

### 응답 (200) — `ApiResponse<UserMe>`
| 필드 | 타입 | nullable | 설명 |
|------|------|---------|------|
| id | Long | N | |
| loginId | String | N | |
| role | enum | N | `USER` |

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| AUTH-4010 | 401 | 토큰 없음/만료 |

---

# B2-1 — 일정 (schedule)

## POST /api/schedules
- 설명: 일정 생성 (F002, F005, F008)
- 인증: 필요

### 요청
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | String | Y | 1~200 |
| startAt | DateTime | Y | ISO-8601 |
| endAt | DateTime | Y | ≥ startAt |
| location | String | N | ≤ 200 |
| repeatRule | enum | N | NONE/DAILY/WEEKLY/MONTHLY (기본 NONE) |
| remindBeforeMinutes | Integer | N | 0~1440 (기본 30) |
| tagIds | List&lt;Long&gt; | N | 본인 소유 태그 |
| sourceMemoId | Long | N | F005 진입 시. 제공되면 링크 자동 생성 (origin=MEMO_TO_SCHEDULE) |

### 응답 (201) — `ApiResponse<ScheduleDetail>`
(응답 DTO 상세는 GET /api/schedules/:id와 동일)

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| SCHED-4000 | 400 | startAt > endAt 또는 필드 형식 오류 |
| TAG-4040 | 404 | tagIds 중 본인 소유 아닌 태그 포함 |
| MEMO-4040 | 404 | sourceMemoId가 본인 메모 아님 |

---

## GET /api/schedules
- 설명: 기간 내 일정 목록 (S101 월·S102 주 뷰). **반복 일정은 서버에서 가상 인스턴스로 확장(F008)** — from~to 범위 내 발생분을 펼쳐 반환.
- 인증: 필요

### 요청 (쿼리)
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| from | Date(yyyy-MM-dd) | Y | 조회 시작 (포함) |
| to | Date(yyyy-MM-dd) | Y | 조회 종료 (포함) |
| tagIds | List&lt;Long&gt; | N | 필터 |

### 응답 (200) — `ApiResponse<List<ScheduleCalendarItem>>`
`ScheduleCalendarItem`
| 필드 | 타입 | nullable | 설명 |
|------|------|---------|------|
| id | Long | N | 원본 schedule.id (반복 인스턴스도 동일 id + occurrence 구분) |
| occurrenceDate | Date | Y | 반복 발생일. 비반복은 null |
| title | String | N | |
| startAt | DateTime | N | 해당 인스턴스의 시각 |
| endAt | DateTime | N | |
| location | String | Y | |
| isRepeat | Boolean | N | repeatRule ≠ NONE |

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| COMM-4000 | 400 | from > to, 기간 > 90일(과도한 확장 방지) |

---

## GET /api/schedules/{id}
- 설명: 일정 상세 (S103) + 태그 임베드
- 인증: 필요

### 응답 (200) — `ApiResponse<ScheduleDetail>`
`ScheduleDetail`
| 필드 | 타입 | nullable | 설명 |
|------|------|---------|------|
| id | Long | N | |
| title | String | N | |
| startAt | DateTime | N | |
| endAt | DateTime | N | |
| location | String | Y | |
| repeatRule | enum | N | |
| remindBeforeMinutes | Integer | N | |
| tags | List&lt;TagSummary&gt; | N | 빈 배열 가능. 태그 모듈 JOIN (★) |
| createdAt | DateTime | N | |
| updatedAt | DateTime | N | |

- 첨부·붙은 메모는 별도 API(아래)로 분리 — 페이로드 경량화 + 모듈 경계 유지

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| SCHED-4040 | 404 | 존재하지 않거나 본인 소유 아님 |

---

## PATCH /api/schedules/{id}
- 설명: 일정 수정 (F002)
- 인증: 필요

### 요청
POST와 동일 필드 (`sourceMemoId` 제외). 전부 선택 — 부분 수정.

### 응답 (200) — `ApiResponse<ScheduleDetail>`

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| SCHED-4000 | 400 | startAt > endAt |
| SCHED-4040 | 404 | 미존재/소유 불일치 |

---

## DELETE /api/schedules/{id}
- 설명: 일정 삭제 (F002). 삭제 시 공통 이벤트 `ResourceDeletedEvent(SCHEDULE)` 발행 → 링크·태그 매핑·첨부 정리 (05).
- 인증: 필요

### 응답 (204) — 본문 없음

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| SCHED-4040 | 404 | 미존재/소유 불일치 |

---

## GET /api/schedules/{id}/linked-memos
- 설명: S103 우측 "붙은 메모" 패널 (연결+메모 모듈 교차, ★). **연결 모듈이 제공**하되 편의상 schedule 하위 경로로 노출.
- 인증: 필요

### 응답 (200) — `ApiResponse<List<LinkedMemoItem>>`
`LinkedMemoItem`
| 필드 | 타입 | nullable | 설명 |
|------|------|---------|------|
| linkId | Long | N | schedule_memo_link.id |
| memoId | Long | N | |
| title | String | N | `memo.title` |
| bodyExcerpt | String | Y | 앞 200자 |
| updatedAt | DateTime | N | |
| linkedAt | DateTime | N | link.created_at |

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| SCHED-4040 | 404 | 일정 미존재/소유 불일치 |

---

## GET /api/schedules/{id}/attachments
- 설명: S103 첨부 목록 (첨부 모듈 교차, ★). **첨부 모듈이 제공**하되 schedule 하위 경로로 노출.
- 인증: 필요

### 응답 (200) — `ApiResponse<List<AttachmentItem>>`
(AttachmentItem 정의는 아래 첨부 섹션)

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| SCHED-4040 | 404 | 일정 미존재/소유 불일치 |

---

# B2-2 — 메모 (memo)

## POST /api/memos
- 설명: 메모 생성 (F003, F004)
- 인증: 필요

### 요청
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | String | Y | 1~200 |
| body | String | N | 마크다운, ≤ 102400자 |
| tagIds | List&lt;Long&gt; | N | |
| attachToScheduleId | Long | N | F004 진입. 제공 시 링크 자동 생성 (origin=SCHEDULE_TO_MEMO) |

### 응답 (201) — `ApiResponse<MemoDetail>`

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| MEMO-4000 | 400 | title 빈값, body 길이 초과 |
| TAG-4040 | 404 | 태그 소유 불일치 |
| SCHED-4040 | 404 | attachToScheduleId 소유 불일치 |

---

## GET /api/memos
- 설명: 메모 목록 (S201) — keyword/tagIds 서버 필터 + 페이징, `updatedAt DESC`
- 인증: 필요

### 요청 (쿼리)
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| keyword | String | N | title/body LIKE |
| tagIds | List&lt;Long&gt; | N | AND 매칭 (전부 포함) |
| page | int | N | 기본 0 |
| size | int | N | 기본 20, 최대 100 |

### 응답 (200) — `ApiResponse<PagedResponse<MemoCardItem>>`
`MemoCardItem`
| 필드 | 타입 | nullable | 설명 |
|------|------|---------|------|
| id | Long | N | |
| title | String | N | |
| bodyExcerpt | String | Y | 앞 200자 |
| updatedAt | DateTime | N | |
| tags | List&lt;TagSummary&gt; | N | 빈 배열 가능 |

---

## GET /api/memos/{id}
- 설명: 메모 상세 (S202) + 태그 임베드
- 인증: 필요

### 응답 (200) — `ApiResponse<MemoDetail>`
`MemoDetail`
| 필드 | 타입 | nullable | 설명 |
|------|------|---------|------|
| id | Long | N | |
| title | String | N | |
| body | String | Y | 마크다운 원문 |
| tags | List&lt;TagSummary&gt; | N | |
| createdAt | DateTime | N | |
| updatedAt | DateTime | N | |

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| MEMO-4040 | 404 | 미존재/소유 불일치 |

---

## PATCH /api/memos/{id}
- 설명: 메모 수정 (F003, F010 체크박스 토글도 동일 엔드포인트)
- 인증: 필요

### 요청
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | String | N | 1~200 |
| body | String | N | |
| tagIds | List&lt;Long&gt; | N | 전체 교체 의미 |

### 응답 (200) — `ApiResponse<MemoDetail>`

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| MEMO-4040 | 404 | 미존재/소유 불일치 |
| MEMO-4000 | 400 | 유효성 실패 |

---

## DELETE /api/memos/{id}
- 설명: 메모 삭제 (F003). `ResourceDeletedEvent(MEMO)` 발행.
- 응답 (204)
- 에러: MEMO-4040 / 404

---

## GET /api/memos/{id}/linked-schedules
- 설명: S202 하단 연결된 일정 섹션 (연결+일정 교차, ★)
- 응답 (200) — `ApiResponse<List<LinkedScheduleItem>>`

`LinkedScheduleItem`
| 필드 | 타입 | nullable | 설명 |
|------|------|---------|------|
| linkId | Long | N | |
| scheduleId | Long | N | |
| title | String | N | |
| startAt | DateTime | N | |
| endAt | DateTime | N | |
| location | String | Y | |
| linkedAt | DateTime | N | |

---

## GET /api/memos/{id}/attachments
- 설명: S202 첨부 목록
- 응답: `ApiResponse<List<AttachmentItem>>` (첨부 섹션 참조)

---

# B3-1 — 연결 (schedule_memo_link)

모듈명 네이밍 유보(04 리뷰 메모). 본 API는 모듈 구현 단계에서 `schedule-memo-link` 패키지로 귀속 예정. 경로는 `/api/links`.

## POST /api/links
- 설명: 일정-메모 링크 생성 (F004, F005). **이미 연결된 pair면 `origin` 유지한 채 기존 레코드 반환** (F004 "재연결 무시" → idempotent).
- 인증: 필요

### 요청
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| scheduleId | Long | Y | |
| memoId | Long | Y | |
| origin | enum | Y | SCHEDULE_TO_MEMO / MEMO_TO_SCHEDULE |

### 응답 (201 또는 200) — `ApiResponse<LinkResult>`
| 필드 | 타입 | nullable | 설명 |
|------|------|---------|------|
| linkId | Long | N | |
| scheduleId | Long | N | |
| memoId | Long | N | |
| origin | enum | N | |
| createdAt | DateTime | N | |
| alreadyExisted | Boolean | N | 기존 링크 재사용 시 true (멱등) |

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| SCHED-4040 | 404 | 일정 미존재 또는 소유 불일치 |
| MEMO-4040 | 404 | 메모 미존재 또는 소유 불일치 |
| LINK-4030 | 403 | 일정·메모가 서로 다른 소유자 (실질 발생 X, 방어적 검사) |

---

## DELETE /api/links/{id}
- 설명: 링크 해제 (F004). 일정·메모 자체는 유지 (01 근거).
- 응답 (204)

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| LINK-4040 | 404 | 링크 미존재/소유 불일치 |

---

# B3-2 — 태그

## GET /api/tags
- 설명: 태그 트리 전체 조회 (S301, 필터 옵션). 본인 소유 전부.
- 인증: 필요

### 응답 (200) — `ApiResponse<List<TagNode>>`
`TagNode`
| 필드 | 타입 | nullable | 설명 |
|------|------|---------|------|
| id | Long | N | |
| name | String | N | |
| parentId | Long | Y | null이면 루트 |
| depth | Integer | N | 1~3 |

- 정렬: parentId ASC NULLS FIRST, name ASC

---

## POST /api/tags
- 설명: 태그 생성 (S301)
- 인증: 필요

### 요청
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| name | String | Y | 1~50 |
| parentId | Long | N | 없으면 루트, 있으면 본인 소유 태그 |

### 응답 (201) — `ApiResponse<TagNode>`

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| TAG-4000 | 400 | name 검증/같은 부모 아래 동명 존재/depth>3 |
| TAG-4040 | 404 | parentId 소유 불일치 |

---

## PATCH /api/tags/{id}
- 설명: 태그 이름/상위 변경 (S301 Edit 내 상위 선택)
- 인증: 필요

### 요청
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| name | String | N | 1~50 |
| parentId | Long | N | 제공 시 변경. depth 재계산. |

### 응답 (200) — `ApiResponse<TagNode>`

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| TAG-4000 | 400 | 동명 충돌/depth>3 |
| TAG-4040 | 404 | 미존재/소유 불일치 |

---

## DELETE /api/tags/{id}
- 설명: 태그 삭제 + `schedule_tag`/`memo_tag` 매핑 정리. 일정·메모 자체는 유지.
- 응답 (204)

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| TAG-4040 | 404 | 미존재/소유 불일치 |
| TAG-4090 | 409 | 자식 태그 존재 (명시적으로 자식부터 삭제 요구) |

---

# B3-3 — 첨부

## POST /api/attachments
- 설명: 첨부 업로드 (F011). 다형 (target = SCHEDULE|MEMO)
- 인증: 필요
- Content-Type: `multipart/form-data`

### 요청
| 파트 | 타입 | 필수 | 설명 |
|------|------|------|------|
| targetType | String(enum) | Y | SCHEDULE/MEMO |
| targetId | Long | Y | 본인 소유 |
| file | binary | Y | 이미지(jpg/jpeg/png/gif)·PDF, ≤10MB |

### 응답 (201) — `ApiResponse<AttachmentItem>`
`AttachmentItem`
| 필드 | 타입 | nullable | 설명 |
|------|------|---------|------|
| id | Long | N | |
| targetType | enum | N | |
| targetId | Long | N | |
| fileName | String | N | |
| contentType | String | N | |
| fileSize | Long | N | bytes |
| downloadUrl | String | N | `/api/attachments/{id}/download` (동일 인증) |
| createdAt | DateTime | N | |

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| FILE-4000 | 400 | 확장자/용량 초과/개수 초과(5개) |
| SCHED-4040 | 404 | targetType=SCHEDULE 미존재/소유 불일치 |
| MEMO-4040 | 404 | targetType=MEMO 미존재/소유 불일치 |

---

## GET /api/attachments/{id}/download
- 설명: 첨부 원본/미리보기 바이너리 반환
- 인증: 필요
- 응답 (200): `Content-Type`=원본 MIME, body=바이너리

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| FILE-4040 | 404 | 미존재/소유 불일치 |

---

## DELETE /api/attachments/{id}
- 설명: 첨부 단건 삭제 (사용자 수동 삭제)
- 응답 (204)

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| FILE-4040 | 404 | 미존재/소유 불일치 |

---

# B4-1 — 검색

## GET /api/search
- 설명: 일정·메모 통합 검색 (F006, S003). 시간 역순 정렬(일정=`startAt`, 메모=`updatedAt`)을 통일 정렬키 `sortAt`로 반환.
- 인증: 필요

### 요청 (쿼리)
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| q | String | Y | 1자 이상 |
| type | enum | N | ALL/SCHEDULE/MEMO (기본 ALL) |
| tagIds | List&lt;Long&gt; | N | AND |
| page | int | N | 기본 0 |
| size | int | N | 기본 20, 최대 100 |

### 응답 (200) — `ApiResponse<PagedResponse<SearchItem>>`
`SearchItem` (유니온)
| 필드 | 타입 | nullable | 설명 |
|------|------|---------|------|
| type | enum | N | SCHEDULE/MEMO |
| id | Long | N | |
| title | String | N | |
| summary | String | Y | 일정=`location`, 메모=`bodyExcerpt` (앞 200자) |
| startAt | DateTime | Y | 일정일 때 |
| endAt | DateTime | Y | 일정일 때 |
| updatedAt | DateTime | Y | 메모일 때 |
| sortAt | DateTime | N | 통일 정렬키 (일정=startAt, 메모=updatedAt) |
| tags | List&lt;TagSummary&gt; | N | 빈 배열 가능 |

- 정렬: `sortAt DESC`. 동률 시 `id DESC`.

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| SRCH-4000 | 400 | q 길이 0 |

---

# B4-2 — 알림

## GET /api/notifications/stream
- 설명: SSE 스트림 (F007). 일정 시작 N분 전(스케줄러 주기 스캔) 이벤트 푸시. 실시간만(누락 미복구).
- 인증: 필요
- `Accept: text/event-stream`
- 응답: SSE — `event: schedule_reminder`, `data: {JSON payload}`

### SSE 페이로드 (event=schedule_reminder)
| 필드 | 타입 | nullable | 설명 |
|------|------|---------|------|
| scheduleId | Long | N | |
| title | String | N | |
| startAt | DateTime | N | |
| linkedMemos | List&lt;LinkedMemoItem&gt; | N | 본 섹션 아래 DTO (빈 배열 가능) |

`LinkedMemoItem` (SSE 내부)
| 필드 | 타입 | nullable |
|------|------|---------|
| memoId | Long | N |
| title | String | N |
| bodyExcerpt | String | Y |

### 에러
| 코드 | HTTP | 상황 |
|------|------|------|
| AUTH-4010 | 401 | 인증 필요 (연결 시) |

---

# 요약

## 엔드포인트 목록 (총 25개)
| # | METHOD | 경로 | 도메인 |
|---|--------|------|------|
| 1 | POST | /api/auth/login | 인증 |
| 2 | GET | /api/auth/me | 인증 |
| 3 | POST | /api/schedules | 일정 |
| 4 | GET | /api/schedules | 일정 |
| 5 | GET | /api/schedules/{id} | 일정 |
| 6 | PATCH | /api/schedules/{id} | 일정 |
| 7 | DELETE | /api/schedules/{id} | 일정 |
| 8 | GET | /api/schedules/{id}/linked-memos | 연결 (schedule 하위 경로) |
| 9 | GET | /api/schedules/{id}/attachments | 첨부 (schedule 하위 경로) |
| 10 | POST | /api/memos | 메모 |
| 11 | GET | /api/memos | 메모 |
| 12 | GET | /api/memos/{id} | 메모 |
| 13 | PATCH | /api/memos/{id} | 메모 |
| 14 | DELETE | /api/memos/{id} | 메모 |
| 15 | GET | /api/memos/{id}/linked-schedules | 연결 (memo 하위 경로) |
| 16 | GET | /api/memos/{id}/attachments | 첨부 (memo 하위 경로) |
| 17 | POST | /api/links | 연결 |
| 18 | DELETE | /api/links/{id} | 연결 |
| 19 | GET | /api/tags | 태그 |
| 20 | POST | /api/tags | 태그 |
| 21 | PATCH | /api/tags/{id} | 태그 |
| 22 | DELETE | /api/tags/{id} | 태그 |
| 23 | POST | /api/attachments | 첨부 |
| 24 | GET | /api/attachments/{id}/download | 첨부 |
| 25 | DELETE | /api/attachments/{id} | 첨부 |
| 26 | GET | /api/search | 검색 |
| 27 | GET | /api/notifications/stream (SSE) | 알림 |

- 총 27 엔드포인트.

## 표시 데이터 커버리지 자체 검증
10의 화면별 표시/입력/조합 요구를 1:1로 매핑:

| 화면 | 필요 API | 11 제공 | 상태 |
|------|--------|--------|------|
| S001 | POST /auth/login | ✅ | OK |
| S002 | GET /auth/me | ✅ | OK |
| S003 | GET /search, GET /tags | ✅ | OK |
| S101 | GET /schedules | ✅ (from~to + 반복 전개) | OK |
| S102 | GET /schedules | ✅ | OK |
| S103 | GET /schedules/{id}, /linked-memos, /attachments | ✅ | OK |
| S104 | GET /tags + POST /schedules(+sourceMemoId) | ✅ | OK |
| S201 | GET /memos, GET /tags | ✅ | OK |
| S202 | GET /memos/{id}, /linked-schedules, /attachments | ✅ | OK |
| S203 | GET /tags + POST /memos(+attachToScheduleId) | ✅ | OK |
| S301 | GET/POST/PATCH/DELETE /tags | ✅ | OK |
| S401 | GET /notifications/stream | ✅ | OK |

- 표시 데이터 커버리지: **12/12 (100%)**
- 10에 나열된 17건의 ★ 교차 데이터 모두 API 응답에 포함(임베드 또는 전용 엔드포인트).

## 주의 사항 / 결정 기록
- 태그는 일정·메모 상세 **응답에 임베드**(페이로드 경량). 그 외 교차 모듈(첨부·연결)은 **전용 하위 경로**로 분리(모듈 경계 유지).
- `GET /api/schedules`는 from~to 기간 최대 **90일** 제한 — 반복 전개 폭주 방지.
- 로그아웃 전용 API **미제공** — JWT stateless. 클라이언트 측에서 토큰 폐기 후 S001로 이동. 서버 블랙리스트는 01 근거 없어 추가 금지.
- 일정 수정 시 `tags` 전체 교체 의미 (diff 처리는 서버 내부). 부분 추가/제거 별도 엔드포인트 없음 (복잡도 경감).
