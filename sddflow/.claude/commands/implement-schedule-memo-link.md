# /implement-schedule-memo-link — schedule-memo-link 모듈 구현

## 역할
너는 Dev다. 명세에 있는 것만 구현한다.

## 읽을 파일
1. CLAUDE.md
2. specs/modules/schedule-memo-link_SPEC.md
3. specs/06_공통_구조_설계서.md
4. src/common/

## 할 일

### 0. 체크포인트 생성
```bash
git add -A && git commit -m "checkpoint: pre-implement-schedule-memo-link" --allow-empty
git tag -f pre-implement-schedule-memo-link
```

### 1. 모듈 전체 구현

## 만들 파일 위치
src/schedule-memo-link/main/java/calendar/link/
├── controller/
│   ├── LinkController.java                   (POST/DELETE /api/links)
│   ├── ScheduleLinkedMemoController.java     (GET /api/schedules/{id}/linked-memos)
│   └── MemoLinkedScheduleController.java     (GET /api/memos/{id}/linked-schedules)
├── service/LinkService.java
├── repository/ScheduleMemoLinkRepository.java
├── entity/
│   ├── ScheduleMemoLink.java (BaseEntity 상속)
│   └── LinkOrigin.java      (enum: SCHEDULE_TO_MEMO / MEMO_TO_SCHEDULE)
├── dto/
│   ├── LinkRequest.java
│   ├── LinkResult.java          (alreadyExisted 포함)
│   ├── LinkedMemoItemResponse.java
│   └── LinkedScheduleItemResponse.java
├── reader/DefaultLinkReader.java (common.api.LinkReader 구현, @Profile("!local"))
├── listener/LinkCleanupListener.java (ResourceDeletedEvent 구독)
└── src/schedule-memo-link/test/java/calendar/link/
    ├── service/LinkServiceTest.java
    ├── listener/LinkCleanupListenerTest.java
    └── controller/LinkControllerTest.java

## 이 모듈의 테이블
- `schedule_memo_link` — id, schedule_id (FK schedule), memo_id (FK memo), origin, created_at
- 제약: `UNIQUE (schedule_id, memo_id)` — F004 "재연결 무시"
- 인덱스: `idx_link_memo(memo_id)`

## 이 모듈의 API
| METHOD | 경로 | 설명 |
|--------|-----|------|
| POST | /api/links | 링크 생성. 멱등 — 기존 pair면 200 + alreadyExisted=true |
| DELETE | /api/links/{id} | 해제 |
| GET | /api/schedules/{id}/linked-memos | 일정에 연결된 메모 요약 |
| GET | /api/memos/{id}/linked-schedules | 메모에 연결된 일정 요약 |

## 이 모듈이 사용하는 공통 인터페이스
- `CurrentUser`
- `ScheduleReader` (schedule.id 존재/소유자 검증) — local에선 `ScheduleReaderStub`, 실제는 `DefaultScheduleReader`
- `MemoReader` (memo.id 존재/소유자 검증) — 동일 패턴
- `@TransactionalEventListener<ResourceDeletedEvent>` — SCHEDULE/MEMO 삭제 시 link 일괄 삭제
- 공통 유틸: `OwnershipGuard`

## 본 모듈이 제공하는 공통 인터페이스
- `common.api.LinkReader` — `DefaultLinkReader` (@Profile("!local"))

## 이 모듈의 Stub 사용 목록
| interface | stub (local) | real |
|-----------|--------------|------|
| CurrentUser | common.stub.CurrentUserStub | user.security.DefaultCurrentUser |
| ScheduleReader | common.stub.ScheduleReaderStub | schedule.reader.DefaultScheduleReader |
| MemoReader | common.stub.MemoReaderStub | memo.reader.DefaultMemoReader |
| LinkReader | common.stub.LinkReaderStub | link.reader.DefaultLinkReader |

## 시드 데이터
| table | count | description |
|-------|-------|-------------|
| schedule_memo_link | 2 | schedule=1↔memo=1(SCHEDULE_TO_MEMO), schedule=2↔memo=2(MEMO_TO_SCHEDULE) |

→ src/schedule-memo-link/main/resources/data.sql

## 에러 코드
- LINK-4030 (403): schedule·memo 소유자 불일치 (이론상 불가, 방어)
- LINK-4040 (404): 링크 미존재/소유 불일치
- SCHED-4040, MEMO-4040 (404): 참조 대상
- COMM-4000 (400): origin 누락

## 멱등 규약 (F004 "재연결 무시")
- POST /api/links: 동일 `(scheduleId, memoId)` 재요청 시
  - 기존 row 반환
  - HTTP 200 (신규는 201)
  - `alreadyExisted=true`
  - `origin`은 **기존 값 유지** (요청 origin 무시)

## 이벤트 구독
- `ResourceDeletedEvent(SCHEDULE, id, ownerId)` → `schedule_memo_link WHERE schedule_id=id` 일괄 삭제
- `ResourceDeletedEvent(MEMO, id, ownerId)` → `schedule_memo_link WHERE memo_id=id` 일괄 삭제
- `@TransactionalEventListener(phase=AFTER_COMMIT)` (06 동기 발행)

## 검증 절차
1. `./gradlew :schedule-memo-link:build` → 통과
2. 테스트 API 확인:
   - POST /links 신규 → 201, alreadyExisted=false
   - POST /links 동일 pair 재요청 → 200, alreadyExisted=true, origin 기존 유지
   - POST /links 타인 일정 → 404 SCHED-4040
   - POST /links 타인 메모 → 404 MEMO-4040
   - DELETE /links/{id} 본인 → 204, 일정·메모는 유지
   - GET /schedules/{id}/linked-memos 본인 → 200
   - GET /schedules/{id}/linked-memos 타인 → 404 SCHED-4040
   - 일정 삭제 후 → 해당 link 행 없음 (이벤트 구독)
   - 메모 삭제 후 → 동일
3. `.http` 파일 생성
4. 전부 통과 → git commit

## 수정 3회 초과 시 — 멈추고 안내
```
⛔ 수정 3회 초과 — 이 세션을 중단합니다.

권장 조치:
1. SPEC 점검: specs/modules/schedule-memo-link_SPEC.md
2. 롤백: /rollback schedule-memo-link
3. 재시작: 새 세션에서 /implement-schedule-memo-link 재실행
```

## 절대 규칙
- 명세 없는 API 추가 금지
- schedule_memo_link 외 테이블 생성 금지
- schedule/memo 모듈 직접 import 금지 — ScheduleReader/MemoReader 인터페이스만 사용
- 멱등 규약 준수 (409 충돌 반환 금지, F004 "재연결 무시")
- ON DELETE CASCADE 금지 — 이벤트 리스너로 정리
- 수정 3회 초과 시 멈춤
- Step 0 체크포인트 건너뛰지 마라
