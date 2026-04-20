# MODULE_SPEC: schedule-memo-link (연결)

> 04의 "연결" 도메인. 패키지명 확정: `schedule-memo-link` (04 리뷰 경미 메모 해소).

## 소유 테이블
`schedule_memo_link` — id, schedule_id (FK schedule), memo_id (FK memo), origin (SCHEDULE_TO_MEMO / MEMO_TO_SCHEDULE), created_at
- 제약: `UNIQUE (schedule_id, memo_id)` (F004 "재연결 무시" 근거)
- 인덱스: `idx_link_memo(memo_id)` (역방향 조회)

## 사용하는 공용 테이블
| 테이블 | 읽기/쓰기 |
|--------|----------|
| schedule | 읽기 (존재/소유자 검증) |
| memo | 읽기 (존재/소유자 검증) |
| user | 읽기 |

## API 엔드포인트 (11)
| METHOD | 경로 | 설명 |
|--------|-----|------|
| POST | /api/links | 링크 생성 (F004, F005). 멱등 — 기존 pair면 alreadyExisted=true |
| DELETE | /api/links/{id} | 링크 해제 |
| GET | /api/schedules/{id}/linked-memos | 실구현(연결 모듈) — 일정에 연결된 메모 요약 |
| GET | /api/memos/{id}/linked-schedules | 실구현(연결 모듈) — 메모에 연결된 일정 요약 |

## 테스트 케이스 (12)
- POST: 신규 / 재요청 멱등(200, alreadyExisted=true) / 타인 일정(SCHED-4040) / 타인 메모(MEMO-4040) / 소유자 불일치(LINK-4030 방어) / origin 누락
- DELETE: 본인 / 타인(LINK-4040) / 미존재
- GET linked-memos: 있음 / 없음 `[]` / 타인 일정 / 미인증
- GET linked-schedules: 동일

## 사용하는 공통 인터페이스
| 인터페이스 | 용도 |
|-----------|------|
| CurrentUser | 소유자 식별 |
| ScheduleReader | schedule.id 존재/소유자 검증 (05) |
| MemoReader | memo.id 존재/소유자 검증 (05) |
| @TransactionalEventListener<ResourceDeletedEvent> | SCHEDULE/MEMO 삭제 시 해당 link 일괄 삭제 |

### 본 모듈이 제공하는 인터페이스
- `LinkReader` (05) — findMemoIdsByScheduleId, findScheduleIdsByMemoId
  - 구현: `DefaultLinkReader`, Stub `LinkReaderStub`

## 필수 외부 연동 어댑터
없음

## Stub 사용 목록
| interface | stub | real_module | real_class |
|-----------|------|-------------|-----------|
| ScheduleReader | ScheduleReaderStub | schedule | DefaultScheduleReader |
| MemoReader | MemoReaderStub | memo | DefaultMemoReader |
| CurrentUser | CurrentUserStub | user | DefaultCurrentUser |
| LinkReader | 본 모듈이 LinkReaderStub 제공 | link | DefaultLinkReader |

## 시드 데이터
| table | count | description |
|-------|-------|-------------|
| schedule_memo_link | 2 | schedule=1↔memo=1, schedule=2↔memo=2 (샘플 연결) |

## 권한
- 전 API `@PreAuthorize("isAuthenticated()")`
- 소유자 검사 규칙: schedule/memo 양쪽 조회 후 두 owner_id가 모두 currentUser.getId()와 일치해야 함. 불일치 시 404 (존재 숨김).

## 에러 코드
- LINK-4030 (403) 소유자 불일치 방어
- LINK-4040 (404) 링크 미존재/소유 불일치
- SCHED-4040, MEMO-4040 (404)
- COMM-4000 (400) origin 누락/형식 오류

## 멱등 규약 (F004 "재연결 무시")
- POST /api/links: 동일 `(schedule_id, memo_id)` 재요청 시 기존 row 반환 + `alreadyExisted=true`, HTTP 200 (신규는 201).

## 이벤트 구독
- `ResourceDeletedEvent(SCHEDULE, id, ownerId)` → `schedule_memo_link WHERE schedule_id=id` 일괄 삭제
- `ResourceDeletedEvent(MEMO, id, ownerId)` → `schedule_memo_link WHERE memo_id=id` 일괄 삭제

## 의존 방향
- 의존: user, schedule(Reader), memo(Reader)
- 이 모듈을 의존: 알림 (LinkReader 사용)
