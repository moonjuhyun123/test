# /implement-notification — notification 모듈 구현

## 역할
너는 Dev다. 명세에 있는 것만 구현한다.

## 읽을 파일
1. CLAUDE.md
2. specs/modules/notification_SPEC.md
3. specs/06_공통_구조_설계서.md
4. src/common/

## 할 일

### 0. 체크포인트 생성
```bash
git add -A && git commit -m "checkpoint: pre-implement-notification" --allow-empty
git tag -f pre-implement-notification
```

### 1. 모듈 전체 구현

## 만들 파일 위치
src/notification/main/java/calendar/notification/
├── controller/NotificationStreamController.java
├── service/
│   ├── NotificationScheduler.java         (@Scheduled 1분 주기 스캔)
│   ├── SseEmitterRegistry.java            (사용자 ID → SseEmitter 매핑)
│   └── NotificationPayloadAssembler.java  (페이로드 조립 — schedule + link + memo)
├── dto/
│   ├── ScheduleReminderPayload.java
│   └── NotificationLinkedMemo.java
├── listener/ScheduleDeletionListener.java  (ResourceDeletedEvent 구독)
└── src/notification/test/java/calendar/notification/
    ├── service/NotificationSchedulerTest.java
    ├── service/SseEmitterRegistryTest.java
    ├── service/NotificationPayloadAssemblerTest.java
    └── controller/NotificationStreamControllerTest.java

## 이 모듈의 테이블
- 없음 (03 §알림 "테이블 없음" 확정. F007 "실시간만, 누락 미복구")

## 이 모듈의 API
| METHOD | 경로 | 설명 |
|--------|-----|------|
| GET | /api/notifications/stream | SSE 스트림 (Accept: text/event-stream) |

### SSE 이벤트
- 이벤트 이름: `schedule_reminder`
- 페이로드: `ScheduleReminderPayload { scheduleId, title, startAt, linkedMemos[] }`

## 이 모듈이 사용하는 공통 인터페이스
- `CurrentUser` (SSE 연결의 사용자 식별)
- `ScheduleReader.findUpcoming` (향후 N분 내 시작 일정 스캔)
- `LinkReader.findMemoIdsByScheduleId` (페이로드의 연결 메모 id)
- `MemoReader.findSummariesByIds` (메모 요약 본문)
- `@TransactionalEventListener<ResourceDeletedEvent>` — SCHEDULE 삭제 시 인메모리 트리거 큐 제거

## 본 모듈이 제공하는 공통 인터페이스
- 없음

## 이 모듈의 Stub 사용 목록
| interface | stub (local) | real |
|-----------|--------------|------|
| CurrentUser | common.stub.CurrentUserStub | user.security.DefaultCurrentUser |
| ScheduleReader | common.stub.ScheduleReaderStub (upcoming=[]) | schedule.reader.DefaultScheduleReader |
| LinkReader | common.stub.LinkReaderStub | link.reader.DefaultLinkReader |
| MemoReader | common.stub.MemoReaderStub | memo.reader.DefaultMemoReader |

## 시드 데이터
- 없음. 로컬 프로파일에서 `MockSseBroadcaster`(@Profile("local"))가 10초마다 가상 이벤트 1건 푸시 (옵션).

## 에러 코드
- AUTH-4010 (401): 연결 시 인증 실패

## 구현 메모
- 스케줄러 1분 주기: `ScheduleReader.findUpcoming(ownerId, now, now+1min)` 스캔 → `remind_before_minutes`와 일치하는 일정만 발행
- `SseEmitter` per user. 중복 연결 허용(탭별). 만료 JWT 감지 시 서버 종료.
- Spring `@EnableScheduling`이 본 모듈에서 필요 → `calendar.notification.config.NotificationConfig`에서 활성화

## 이벤트 구독
- `ResourceDeletedEvent(SCHEDULE, id)` → 인메모리 예정 큐에서 해당 id 제거 (DB 작업 없음)

## 검증 절차
1. `./gradlew :notification:build` → 통과
2. 테스트 API 확인:
   - GET /notifications/stream 유효 JWT → 200 text/event-stream 열림
   - 30분 전 이벤트 수신 → event=schedule_reminder + 페이로드
   - 페이로드 연결 메모 있음/없음(`[]`) 둘 다 케이스
   - JWT 만료 → 서버 연결 종료
   - 미인증 → 401 AUTH-4010
   - 타인 일정 이벤트 미전송
   - 삭제된 일정 이벤트 미전송 (이벤트 구독)
   - 재연결 시 누락 이벤트 미전송 (F007 "실시간만")
3. `.http` 파일 생성 (SSE는 curl로 검증)
4. 전부 통과 → git commit

## 수정 3회 초과 시 — 멈추고 안내
```
⛔ 수정 3회 초과 — 이 세션을 중단합니다.

권장 조치:
1. SPEC 점검: specs/modules/notification_SPEC.md
2. 롤백: /rollback notification
3. 재시작: 새 세션에서 /implement-notification 재실행
```

## 절대 규칙
- 명세 없는 API 추가 금지 (예: 알림 이력 조회, 알림 설정, 푸시 구독)
- 알림 이력 테이블 생성 금지 (03·14 확정 — "실시간만")
- schedule/link/memo 모듈 직접 import 금지 — Reader 인터페이스만 사용
- 외부 푸시 서비스(FCM/APNs) 사용 금지 — 내부 SSE만
- 재연결 시 누락 이벤트 재전송 금지 (F007)
- 수정 3회 초과 시 멈춤
- Step 0 체크포인트 건너뛰지 마라
