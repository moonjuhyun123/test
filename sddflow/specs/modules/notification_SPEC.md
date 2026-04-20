# MODULE_SPEC: notification (알림)

## 소유 테이블
없음 — 03 §알림 "테이블 없음" 확정 (F007 "실시간만, 누락 미복구" 근거).

## 사용하는 공용 테이블
| 테이블 | 읽기/쓰기 |
|--------|----------|
| schedule | 읽기 (start_at, remind_before_minutes로 트리거 계산) |
| schedule_memo_link, memo | 읽기 (페이로드에 연결 메모 요약) |
| user | 읽기 (SSE 연결 ↔ 사용자 매핑) |

## API 엔드포인트 (11)
| METHOD | 경로 | 설명 |
|--------|-----|------|
| GET | /api/notifications/stream | SSE 스트림 (Accept: text/event-stream) |

## 테스트 케이스 (12)
- 유효 JWT 연결 / 30분 전 이벤트 / 페이로드 연결 메모 포함 / 연결 메모 없음(`[]`) / JWT 만료 시 종료 / 미인증 401 / 타인 일정 미전송 / 삭제된 일정 미전송 / 재연결 누락 미전송

## 사용하는 공통 인터페이스
| 인터페이스 | 용도 |
|-----------|------|
| CurrentUser | SSE 연결의 사용자 식별 |
| ScheduleReader.findUpcoming | 향후 N분 내 시작 일정 스캔 |
| LinkReader.findMemoIdsByScheduleId | 페이로드의 연결 메모 id |
| MemoReader.findSummariesByIds | 메모 요약 본문 |
| @TransactionalEventListener<ResourceDeletedEvent> | SCHEDULE 삭제 시 인메모리 트리거 큐 제거 |

### 본 모듈이 제공하는 인터페이스
- 없음

## 필수 외부 연동 어댑터
없음 — SSE는 서블릿 내장. 외부 푸시 서비스 불사용.

## Stub 사용 목록
| interface | stub | real_module | real_class |
|-----------|------|-------------|-----------|
| ScheduleReader | ScheduleReaderStub (upcoming=[]) | schedule | DefaultScheduleReader |
| LinkReader | LinkReaderStub | link | DefaultLinkReader |
| MemoReader | MemoReaderStub | memo | DefaultMemoReader |
| CurrentUser | CurrentUserStub | user | DefaultCurrentUser |

## 시드 데이터
없음. 로컬 개발용 Mock SSE 서버가 10초마다 가상 이벤트 1건 발행 (옵션, /build-design-system 단계에서 구현).

## 권한
- 연결 시 `@PreAuthorize("isAuthenticated()")`
- 이벤트 발행 시 수신자 = 연결의 currentUser. 타인 일정은 미전송.

## 에러 코드
- AUTH-4010 (401) 연결 시 인증 실패

## 구현 메모
- 스케줄러 1분 주기로 `ScheduleReader.findUpcoming(ownerId, now, now+1min)` 스캔 → remind_before_minutes와 일치하는 일정 발행
- `SseEmitter` per user. 중복 연결 허용(탭별). 만료 JWT 감지 시 서버가 종료.
- 이벤트 이름: `schedule_reminder`
- 페이로드 스키마: 11 §SSE 페이로드

## 이벤트 구독
- `ResourceDeletedEvent(SCHEDULE, id)` → 인메모리 예정 큐에서 해당 id 제거 (DB 작업 없음)

## 의존 방향
- 의존: user, schedule(Reader), link(Reader), memo(Reader)
- 이 모듈을 의존: 없음 (화면이 직접 SSE 연결)
