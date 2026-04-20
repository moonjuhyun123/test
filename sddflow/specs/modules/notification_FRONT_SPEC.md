# FRONT_SPEC: 알림

## 포함 화면
| 번호 | 화면명 | 경로 |
|------|--------|------|
| S401 | 알림 토스트·패널 | — (S002 부속) |

> S401은 독립 라우트가 아닌 메인 셸(S002) 부속 UI. SSE 이벤트로 트리거.

---

## S401: 알림 토스트/패널

### 화면 정보
- 경로: 없음 (전역 레이어)
- 접근 권한: isAuthenticated (SSE 연결 성립 시점)
- 소속 그룹: 알림

### 사용하는 공통 컴포넌트
NotificationToast, List, Popover, Toast, Button, IconButton, EmptyState, MarkdownRenderer

### 레이아웃
- **Toast 모드**: 우상단 스택 (Toast Portal)
  - 각 토스트: 제목("곧 시작: {일정 제목}") + 시작 시각 + "연결된 메모 N개 보기"(펼치기) + 닫기
  - 펼치면 내부에 List(MarkdownRenderer 메모 요약 1~2줄씩)
- **패널 모드**: 헤더 Bell IconButton 클릭 시 Popover로 열림
  - "최근 받은 알림" List — 세션 내 수신 누적

### 표시 데이터
| 영역 | 항목 | 타입 | 출처 |
|------|------|------|------|
| Toast | scheduleId/title/startAt/linkedMemos | SSE payload | `GET /api/notifications/stream` |
| 패널 | 세션 내 수신 목록 | List | 인메모리 |
| Banner(끊김) | 안내 문구 | String | 정적 |

### API 호출
| 시점 | API | Mock |
|------|-----|------|
| 로그인 후 상시 | GET /api/notifications/stream (SSE) | notifications/schedule_reminder_sample.json, notifications/schedule_reminder_empty_memos.json |

(정적 Mock은 참고용. 로컬 프로파일에서 Mock SSE 서버가 10초마다 가상 이벤트 1건 발행 — /build-design-system 구현)

### 상태별 표시
| 상태 | 표시 | 컴포넌트 |
|------|------|----------|
| 로딩 | 해당 없음 (수신 즉시 반영) | — |
| 데이터 있음 | Toast + 패널 항목 | NotificationToast |
| 빈값(패널) | "최근 알림이 없습니다" | EmptyState |
| API 에러(SSE 끊김) | 상단 배너 "알림 연결이 끊겼습니다" | Banner |
| 성공(재연결) | Toast("알림 연결이 복구되었습니다") | Toast |

### 사용자 행위
| 행위 | 동작 |
|------|------|
| SSE 이벤트 수신 | Toast 자동 표시(duration=8000ms) + 패널에 누적 |
| Toast/패널 항목 클릭 | /schedules/:scheduleId 이동 |
| "연결된 메모 N개" 펼치기 | 토스트 내부 확장 |
| 닫기 | 해당 토스트 제거 |
| Bell 클릭 | 패널 open/close |
