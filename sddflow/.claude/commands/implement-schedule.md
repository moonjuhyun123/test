# /implement-schedule — schedule 모듈 구현

## 역할
너는 Dev다. 명세에 있는 것만 구현한다.

## 읽을 파일
1. CLAUDE.md
2. specs/modules/schedule_SPEC.md
3. specs/06_공통_구조_설계서.md
4. src/common/ — ScheduleReader 인터페이스·이벤트 확인

## 할 일

### 0. 체크포인트 생성
```bash
git add -A && git commit -m "checkpoint: pre-implement-schedule" --allow-empty
git tag -f pre-implement-schedule
```

### 1. 모듈 전체 구현

## 만들 파일 위치
src/schedule/main/java/calendar/schedule/
├── controller/ScheduleController.java
├── service/
│   ├── ScheduleCommandService.java   (생성/수정/삭제)
│   ├── ScheduleQueryService.java     (조회)
│   └── ScheduleRepeatExpander.java   (F008 반복 전개)
├── repository/ScheduleRepository.java
├── entity/
│   ├── Schedule.java                 (BaseEntity 상속)
│   └── RepeatRule.java               (enum: NONE/DAILY/WEEKLY/MONTHLY)
├── dto/
│   ├── ScheduleCreateRequest.java
│   ├── ScheduleUpdateRequest.java
│   ├── ScheduleDetailResponse.java
│   └── ScheduleCalendarItemResponse.java
├── reader/DefaultScheduleReader.java (common.api.ScheduleReader 구현, @Profile("!local"))
└── src/schedule/test/java/calendar/schedule/
    ├── service/ScheduleCommandServiceTest.java
    ├── service/ScheduleQueryServiceTest.java
    ├── service/ScheduleRepeatExpanderTest.java
    └── controller/ScheduleControllerTest.java

## 이 모듈의 테이블
- `schedule` — id, owner_id (FK user), title, start_at, end_at, location, repeat_rule, remind_before_minutes, created_at, updated_at
- 인덱스: `idx_schedule_owner_start(owner_id, start_at)`, `idx_schedule_owner_title(owner_id, title)`

## 이 모듈의 API
| METHOD | 경로 | 설명 |
|--------|-----|------|
| POST | /api/schedules | 생성 (F002, F005 sourceMemoId 동반) |
| GET | /api/schedules | 기간 조회 (from/to ≤90일, F008 반복 전개) |
| GET | /api/schedules/{id} | 상세 + 태그 임베드 |
| PATCH | /api/schedules/{id} | 수정 |
| DELETE | /api/schedules/{id} | 삭제 + ResourceDeletedEvent(SCHEDULE) 발행 |
| GET | /api/schedules/{id}/linked-memos | 연결 모듈이 실구현 — 본 모듈은 라우팅만 |
| GET | /api/schedules/{id}/attachments | 첨부 모듈이 실구현 — 본 모듈은 라우팅만 |

> linked-memos/attachments는 schedule-memo-link / attachment 모듈에 위임. 경로만 /api/schedules/... 유지 위해 별도 Controller 배치. 실구현은 해당 모듈에서.

## 이 모듈이 사용하는 공통 인터페이스
- `CurrentUser` (주입, owner_id 획득)
- `ApplicationEventPublisher` → `ResourceDeletedEvent(SCHEDULE, id, ownerId)` 발행
- 공통 유틸: `OwnershipGuard`, `PageRequestFactory`
- 공통 예외: `ResourceNotFoundException`, `ValidationException`

## 본 모듈이 제공하는 공통 인터페이스
- `common.api.ScheduleReader` — `DefaultScheduleReader` 구현 (@Profile("!local"))
  - 로컬에선 `common.stub.ScheduleReaderStub` 사용 (이미 공통에 있음)

## 이 모듈의 Stub 사용 목록
| interface | stub (local) | real |
|-----------|--------------|------|
| CurrentUser | common.stub.CurrentUserStub | user.security.DefaultCurrentUser |
| ScheduleReader | common.stub.ScheduleReaderStub | schedule.reader.DefaultScheduleReader |

## 시드 데이터
| table | count | description |
|-------|-------|-------------|
| schedule | 3 | owner=1, 오늘/내일/다음 주 샘플. repeat_rule=NONE/WEEKLY/NONE |

→ src/schedule/main/resources/data.sql

## 에러 코드
- SCHED-4000 (400): startAt > endAt, title 길이 등 유효성
- SCHED-4040 (404): 미존재/소유 불일치 (존재 숨김)
- TAG-4040 (404): tagIds 중 본인 소유 아님
- MEMO-4040 (404): sourceMemoId 본인 메모 아님
- COMM-4000 (400): from>to, 기간 90일 초과, 페이징 제약

## 반복 전개 (F008)
- GET /api/schedules의 from~to 범위 내에서 `repeat_rule`에 따라 가상 인스턴스를 `ScheduleCalendarItem`으로 반환.
- `occurrenceDate`: 반복 발생일. 비반복은 null.
- 기간 > 90일 → COMM-4000.

## 검증 절차
1. `./gradlew :schedule:build` → 통과
2. 테스트 API 확인:
   - POST /schedules 최소 필드 → 201
   - POST /schedules startAt>endAt → 400 SCHED-4000
   - POST /schedules F005(sourceMemoId) → 201, 링크 자동 생성
   - GET /schedules 기본 월 → 200, `[]` 가능
   - GET /schedules 반복 전개 → 동일 id + occurrenceDate 다름
   - GET /schedules 기간>90일 → 400
   - GET /schedules/{id} 본인 → 200, tags 임베드
   - GET /schedules/{id} 타인 → 404 SCHED-4040
   - PATCH /schedules/{id} 수정 → 200
   - DELETE /schedules/{id} 본인 → 204, 이벤트 발행 확인
3. `.http` 파일 생성
4. 전부 통과 → git commit

## 수정 3회 초과 시 — 멈추고 안내
```
⛔ 수정 3회 초과 — 이 세션을 중단합니다.

권장 조치:
1. SPEC 점검: specs/modules/schedule_SPEC.md
2. 롤백: /rollback schedule
3. 재시작: 새 세션에서 /implement-schedule 재실행
```

## 절대 규칙
- 명세 없는 API 추가 금지 (예: 범위 밖의 "일정 복제", "일괄 삭제")
- 엔티티에 명세 없는 필드 추가 금지 (예: color, priority)
- 다른 도메인 모듈(memo/tag/attachment/link) 직접 import 금지 — 공통 인터페이스·이벤트만 사용
- ON DELETE CASCADE 금지 — 삭제 시 ResourceDeletedEvent 발행으로 처리 (CLAUDE.md §데이터 삭제 정책)
- 수정 3회 초과 시 멈추고 위의 안내문 출력
- Step 0 체크포인트 건너뛰지 마라
