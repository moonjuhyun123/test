# MODULE_SPEC: schedule (일정)

## 소유 테이블
`schedule` — id, owner_id (FK user), title, start_at, end_at, location, repeat_rule (NONE/DAILY/WEEKLY/MONTHLY 기본 NONE), remind_before_minutes (기본 30), created_at, updated_at
- 인덱스: `idx_schedule_owner_start(owner_id, start_at)`, `idx_schedule_owner_title(owner_id, title)`

## 사용하는 공용 테이블
| 테이블 | 읽기/쓰기 |
|--------|----------|
| user | 읽기 (owner_id로 소유자 존재 확인) |

## API 엔드포인트 (11)
| METHOD | 경로 | 설명 |
|--------|-----|------|
| POST | /api/schedules | 생성 (F002, F005 sourceMemoId 동반) |
| GET | /api/schedules | 기간(from,to, ≤90일) 내 조회. F008 반복 전개 |
| GET | /api/schedules/{id} | 상세 + 태그 임베드 |
| PATCH | /api/schedules/{id} | 수정 |
| DELETE | /api/schedules/{id} | 삭제 → ResourceDeletedEvent(SCHEDULE) 발행 |
| GET | /api/schedules/{id}/linked-memos | 연결 모듈이 실제 구현 (본 모듈 소유는 schedule) |
| GET | /api/schedules/{id}/attachments | 첨부 모듈이 실제 구현 |

> linked-memos, attachments 엔드포인트는 **실구현은 각 모듈(연결/첨부)**. schedule 모듈은 존재/소유자 검증 헬퍼 제공 또는 라우팅만.

## 테스트 케이스 (12)
- POST: 최소/전필드/F005 sourceMemoId / startAt>endAt(SCHED-4000) / 타인 태그(TAG-4040) / 타인 메모(MEMO-4040) / 검증값 경계
- GET 기간: 기본 조회 / 반복 전개 / from>to / >90일 / 빈 결과 / 미인증
- GET 상세: 본인/타인(SCHED-4040)/태그 없음
- PATCH: title/전필드/검증/타인
- DELETE: 본인 + 이벤트 부수효과 검증 / 타인 / 재삭제 / 미인증

## 사용하는 공통 인터페이스
| 인터페이스 | 용도 |
|-----------|------|
| CurrentUser | owner_id 주입 |
| ApplicationEventPublisher | ResourceDeletedEvent(SCHEDULE) 발행 |

### 본 모듈이 제공하는 인터페이스
- `ScheduleReader` (05) — findById, existsByIdAndOwner, findSummariesByIds, search, findUpcoming
  - 구현: `DefaultScheduleReader` (실제), `ScheduleReaderStub` (@Profile("local"))

## 필수 외부 연동 어댑터
없음 — 01 F002/F008 "외부 연동: 없음"

## Stub 사용 목록
| interface | stub | real_module | real_class |
|-----------|------|-------------|-----------|
| CurrentUser | CurrentUserStub | user | DefaultCurrentUser |
| ScheduleReader | 본 모듈이 ScheduleReaderStub 제공(@Profile("local")) | schedule | DefaultScheduleReader |

## 시드 데이터
| table | count | description |
|-------|-------|-------------|
| schedule | 3 | 오늘/내일/다음 주 샘플 일정 (owner=1, repeat_rule=NONE/WEEKLY/NONE) |

## 권한
- 모든 엔드포인트 `@PreAuthorize("isAuthenticated()")`
- 소유자 검사: Service에서 `OwnershipGuard.requireOwner(schedule.getOwnerId(), currentUser.getId())`

## 에러 코드
- SCHED-4000 (400) 유효성 (startAt>endAt 등)
- SCHED-4040 (404) 미존재/소유 불일치
- TAG-4040 (404) 타인 태그
- MEMO-4040 (404) 타인 sourceMemo

## 반복 전개 정책 (F008)
- 서버가 `from ~ to` 구간 내에서 repeat_rule에 따라 가상 인스턴스를 생성해 `ScheduleCalendarItem`으로 반환.
- `occurrenceDate` 필드로 실제 발생일 표시. 원본 `id`는 동일.
- 기간 > 90일이면 `COMM-4000`.

## 의존 방향
- 의존: user/인증
- 이벤트 발행: 연결/태그/첨부/알림 모듈이 구독
