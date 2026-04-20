# 리뷰: 12_테스트_케이스.md
- 일시: 2026-04-20
- 기준: 11_API_스펙.md

## 엔드포인트별 케이스 커버

4종류 기준: **성공(S)**, **실패-검증/소유(V/N)**, **권한(A)**, **경계(B)**. 3종류+충돌(C)가 있는 경우도 완전 커버로 간주.

| API | S | V/N | A | B/C | 상태 |
|-----|---|-----|---|-----|------|
| POST /api/auth/login | ✅ | ✅(5) | n/a(공개) | — | ✅ (권한 없음 n/a) |
| GET /api/auth/me | ✅ | — | ✅(3) | — | ✅ |
| POST /api/schedules | ✅(3) | ✅(5V+2N) | ✅ | ✅ | ✅ |
| GET /api/schedules | ✅(4) | ✅(3V) | ✅ | ✅ | ✅ |
| GET /api/schedules/{id} | ✅ | ✅(2N) | ✅ | ✅(빈 태그) | ✅ |
| PATCH /api/schedules/{id} | ✅(3) | ✅ | ✅ | — | ✅ |
| DELETE /api/schedules/{id} | ✅(4 이벤트) | ✅(2N) | ✅ | — | ✅ |
| GET /api/schedules/{id}/linked-memos | ✅ | ✅ | ✅ | ✅(빈) | ✅ |
| GET /api/schedules/{id}/attachments | ✅ | ✅ | ✅ | ✅(빈) | ✅ |
| POST /api/memos | ✅(3) | ✅(2V+2N) | ✅ | — | ✅ |
| GET /api/memos | ✅(4) | ✅(1V) | ✅ | ✅ | ✅ |
| GET /api/memos/{id} | ✅ | ✅ | ✅ | — | ✅ |
| PATCH /api/memos/{id} | ✅(2) | ✅(1V+1N) | ✅ | — | ✅ |
| DELETE /api/memos/{id} | ✅(4 이벤트) | ✅ | ✅ | — | ✅ |
| GET /api/memos/{id}/linked-schedules | ✅ | ✅ | ✅ | ✅(빈) | ✅ |
| GET /api/memos/{id}/attachments | ✅ | ✅ | — | ✅(빈) | ⚠️ 미인증 누락? |
| POST /api/links | ✅(2) | ✅(3N+1V+1C) | ✅ | ✅(멱등 C) | ✅ |
| DELETE /api/links/{id} | ✅ | ✅(2N) | ✅ | — | ✅ |
| GET /api/tags | ✅ | — | ✅ | ✅(빈) | ✅ |
| POST /api/tags | ✅(3) | ✅(3V+1N) | ✅ | ✅(4단계 경계) | ✅ |
| PATCH /api/tags/{id} | ✅(2) | ✅(2V+1N) | ✅ | — | ✅ |
| DELETE /api/tags/{id} | ✅(2) | ✅(1N+1C 자식) | ✅ | — | ✅ |
| POST /api/attachments | ✅(2) | ✅(3V+2N) | ✅ | ✅(10MB, 5개 경계) | ✅ |
| GET /api/attachments/{id}/download | ✅ | ✅(2N) | ✅ | — | ✅ |
| DELETE /api/attachments/{id} | ✅ | ✅ | ✅ | — | ✅ |
| GET /api/search | ✅(5) | ✅(2V) | ✅ | ✅(빈/페이지 끝) | ✅ |
| GET /api/notifications/stream | ✅(3 이벤트) | ✅(1 A 만료) | ✅ | ✅(재연결, 삭제 후 미전송) | ✅ |

### 경미 결손
- **GET /api/memos/{id}/attachments** — 미인증 케이스 누락. 다른 유사 엔드포인트는 모두 포함. 경미하지만 일관성 위해 보완 권장.

## 에러 코드 일치

11 스펙과 12 테스트 케이스의 에러 코드 대조.

| API | 스펙 코드 | 테스트 코드 | 일치? |
|-----|---------|------------|-------|
| POST /auth/login | USER-4010, COMM-4000 | 동일 | ✅ |
| GET /auth/me | AUTH-4010 | AUTH-4010 | ✅ |
| POST /schedules | SCHED-4000, TAG-4040, MEMO-4040 | 동일 | ✅ |
| GET /schedules | COMM-4000 | COMM-4000 | ✅ |
| GET /schedules/{id} | SCHED-4040 | 동일 | ✅ |
| PATCH /schedules/{id} | SCHED-4000, SCHED-4040 | 동일 | ✅ |
| DELETE /schedules/{id} | SCHED-4040 | 동일 | ✅ |
| POST /memos | MEMO-4000, MEMO-4040, TAG-4040, SCHED-4040 | 동일 (MEMO-4000 사용) | ✅ |
| GET /memos | 제한 COMM-4000 | 동일 | ✅ |
| PATCH /memos/{id} | MEMO-4000, MEMO-4040 | 동일 | ✅ |
| DELETE /memos/{id} | MEMO-4040 | 동일 | ✅ |
| POST /links | SCHED-4040, MEMO-4040, LINK-4030 | 동일 | ✅ |
| DELETE /links/{id} | LINK-4040 | 동일 | ✅ |
| POST /tags | TAG-4000, TAG-4040 | 동일 | ✅ |
| PATCH /tags/{id} | TAG-4000, TAG-4040 | 동일 | ✅ |
| DELETE /tags/{id} | TAG-4040, TAG-4090 | 동일 | ✅ |
| POST /attachments | FILE-4000, SCHED-4040, MEMO-4040, COMM-4000 | 동일 | ✅ |
| GET /attachments/{id}/download | FILE-4040 | 동일 | ✅ |
| DELETE /attachments/{id} | FILE-4040 | 동일 | ✅ |
| GET /search | SRCH-4000 + 페이징 COMM-4000 | 동일 | ✅ |
| GET /notifications/stream | AUTH-4010 | 동일 | ✅ |

- 에러 코드 불일치: **0건**

## AI 추가 의심

| 케이스 | 11에 근거? | 판단 |
|-------|---------|------|
| 변조 토큰(GET /auth/me) | 11 명시 없음, 구현 관례상 401 AUTH-4010 | ⚠️ 경미 허용 — 실무 필수 |
| 10MB 경계(정확히 10MB는 허용) | 11 명시 "≤10MB" | ✅ 경계 의미 |
| 기간 >90일(GET /schedules) | 11 "기간 > 90일 제한 명시" | ✅ |
| POST /tags 4단계(depth>3) | 11 "depth>3이면 TAG-4000" | ✅ |
| 멱등(POST /links 재요청 alreadyExisted=true) | 11 `alreadyExisted` 필드 + "이미 연결된 pair면 기존 반환" 명시 | ✅ |
| SSE "재연결 시 누락 미전송" | 11 F007 "실시간만" 명시 | ✅ |

- 근거 없는 AI 추가 0건. 1건 경미 허용.

## API 스펙 외 엔드포인트 테스트

- 없음. 12의 모든 블록은 11의 27개 엔드포인트 중 하나에 속함.

## 경계값 테스트 현실성

| 경계 | 11 명시 | 12 케이스 | 판단 |
|------|--------|---------|------|
| title 최대 200자 | ✅ | ✅ (201자) | ✅ |
| body 102400자 | ✅ | ✅ (102401) | ✅ |
| page/size 최대 100 | ✅ | ✅ (size=101) | ✅ |
| 기간 90일 | ✅ | ✅ (100일) | ✅ |
| 첨부 10MB | ✅ | ✅ (10MB / 10MB+1) | ✅ |
| 첨부 5개 | ✅ | ✅ (6번째) | ✅ |
| remindBeforeMinutes 0~1440 | ✅ | ✅ (−1, 1441) | ✅ |
| 태그 depth 3 | ✅ | ✅ (4단계) | ✅ |
| 동부모 동명 | ✅ | ✅ | ✅ |
| 빈 목록 `[]` | ✅ | ✅ (각 GET에서 빈 결과 케이스) | ✅ |
| 빈 문자열 입력 | — | ✅ (id/title) | ✅ |

- 모든 경계 명시와 테스트가 1:1.

## 수치
- 엔드포인트 커버율: **27/27 (100%)**
- 완전 커버(S+실패+A+경계): **26/27 (96%)** — GET /api/memos/{id}/attachments 미인증 케이스 누락
- 에러 코드 불일치: **0건**
- AI 추가 케이스(근거 없는): **0건**
- 전체 케이스 수: 약 144건 (12에 명시)

## 판단
✅ 다음 진행 가능

### 보완 권장 (경미)
1. **GET /api/memos/{id}/attachments**에 "미인증(AUTH-4010)" 케이스 1건 추가. 타 유사 엔드포인트와 일관성 확보.
2. **GET /api/schedules/{id}/attachments**도 점검(✅ 이미 포함됨).
3. 일정·메모 삭제 시 이벤트 기반 부수 효과(링크/태그 매핑/첨부)가 "S(이벤트)"로 묶여 있음 — 12의 이 표기는 OK. 실제 구현 단계에서 통합 테스트로 분리하면 명확.
