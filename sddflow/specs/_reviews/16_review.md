# 리뷰: MODULE_SPEC + FRONT_SPEC 전체
- 일시: 2026-04-20
- 기준: 03/05/07/09/10/11/12/13

## Part A: MODULE_SPEC

### 모듈 존재 확인
| 모듈 (04 기준) | SPEC 파일 | 상태 |
|--------------|---------|------|
| 사용자/인증 | modules/user_SPEC.md | ✅ |
| 일정 | modules/schedule_SPEC.md | ✅ |
| 메모 | modules/memo_SPEC.md | ✅ |
| 연결 | modules/schedule-memo-link_SPEC.md | ✅ (04 리뷰 경미 메모의 네이밍 확정) |
| 태그 | modules/tag_SPEC.md | ✅ |
| 첨부 | modules/attachment_SPEC.md | ✅ |
| 검색 | modules/search_SPEC.md | ✅ |
| 알림 | modules/notification_SPEC.md | ✅ |

- 8/8 (100%)

### 모듈별 상세
| 모듈 | API일치 | 테스트일치 | 테이블일치 | 인터페이스 | Stub목록 | 시드데이터 | 필수어댑터 |
|-----|-----|-----|-----|-----|-----|-----|-----|
| user | ✅ POST /auth/login, GET /auth/me | ✅ 12와 일치 | ✅ user | ✅ CurrentUser 제공 | ✅ | ✅ (1건) | 없음(근거 기재) |
| schedule | ✅ 7 API | ✅ | ✅ schedule | ✅ ScheduleReader 제공 | ✅ | ✅ (3건) | 없음 |
| memo | ✅ 7 API | ✅ | ✅ memo | ✅ MemoReader 제공 | ✅ | ✅ (3건) | 없음 |
| schedule-memo-link | ✅ POST/DELETE /links + linked-* | ✅ | ✅ schedule_memo_link | ✅ LinkReader 제공 + ScheduleReader/MemoReader 소비 | ✅ | ✅ (2건) | 없음 |
| tag | ✅ 4 API | ✅ | ✅ tag/schedule_tag/memo_tag | ✅ TagReader 제공 | ✅ | ✅ (3+2+2건) | 없음 |
| attachment | ✅ 3 API + linked 조회 실구현 주체 | ✅ | ✅ attachment | ✅ ScheduleReader/MemoReader 소비 | ✅ | ✅ (0건 근거 기재) | 없음 (내부 파일 스토리지 명시) |
| search | ✅ GET /search | ✅ | n/a(테이블 없음) | ✅ ScheduleReader/MemoReader/TagReader 소비 | ✅ | ✅ (없음 근거) | 없음 |
| notification | ✅ GET /notifications/stream | ✅ | n/a | ✅ 다수 소비 + 이벤트 구독 | ✅ | ✅ (없음 근거) | 없음 |

- 전 모듈 "필수 외부 연동 어댑터" 표 = "없음 + 근거" 기재. 15 법률과 일치. **/session17은 본 "없음 확정"을 확인리스트 문서로 보존하는 용도**로 진행 예정.

## Part B: FRONT_SPEC

### 화면 포함 검증 (07의 12 화면)
| 화면 | FRONT_SPEC | 상태 |
|------|-----------|------|
| S001 | common_FRONT_SPEC.md | ✅ |
| S002 | common_FRONT_SPEC.md | ✅ |
| S003 | common_FRONT_SPEC.md | ✅ |
| S101 | schedule_FRONT_SPEC.md | ✅ |
| S102 | schedule_FRONT_SPEC.md | ✅ |
| S103 | schedule_FRONT_SPEC.md | ✅ |
| S104 | schedule_FRONT_SPEC.md | ✅ |
| S201 | memo_FRONT_SPEC.md | ✅ |
| S202 | memo_FRONT_SPEC.md | ✅ |
| S203 | memo_FRONT_SPEC.md | ✅ |
| S301 | tag_FRONT_SPEC.md | ✅ |
| S401 | notification_FRONT_SPEC.md | ✅ |

- 12/12 (100%)

### 상태/API/표시데이터 일치 (샘플)
| 화면 | 상태정의 | API매핑 | 표시데이터 | 행위 |
|------|--------|--------|----------|-----|
| S001 | ✅ 09 7종 상태 그대로 | ✅ 13 일치 | ✅ 10 일치 | ✅ |
| S002 | ✅ | ✅ (`/auth/me` + SSE) | ✅ | ✅ |
| S003 | ✅ 7종 | ✅ GET /tags + /search | ✅ SearchItem 전 필드 | ✅ |
| S101 | ✅ | ✅ from/to | ✅ ScheduleCalendarItem | ✅ |
| S103 | ✅ 7종 포함 권한없음(404) | ✅ 상세+linked-memos+attachments+PATCH+DELETE+업로드+링크 해제 | ✅ 14종 필드 | ✅ |
| S104 | ✅ | ✅ /tags+/memos/:sourceMemoId+POST | ✅ | ✅ |
| S201 | ✅ 선택 모드 포함 | ✅ list+tags+(선택 시 schedule)+POST /links | ✅ | ✅ |
| S202 | ✅ | ✅ detail+linked-schedules+attachments+PATCH+DELETE+업로드+링크 해제 | ✅ | ✅ |
| S203 | ✅ | ✅ /tags+attach target+POST /memos | ✅ | ✅ |
| S301 | ✅ 409 별도 표시 | ✅ 4 API | ✅ TagNode | ✅ |
| S401 | ✅ 6종(로딩 n/a) | ✅ SSE | ✅ payload 스키마 | ✅ |

- 전 화면 일치. 불일치 0건.

## Part C: 교차 일관성

| 검증 항목 | 결과 |
|----------|------|
| API 엔드포인트 일치 (MODULE_SPEC 11 + FRONT_SPEC 13) | ✅ 양쪽 모두 11의 27 엔드포인트에 근거. 누락/추가 없음 |
| Stub-Mock 대응 | ✅ MODULE_SPEC의 Stub(`CurrentUserStub`, `ScheduleReaderStub`, `MemoReaderStub`, `TagReaderStub`, `LinkReaderStub`)와 FRONT_SPEC의 Mock 파일(tags/list_*, search/mixed_*, schedules/detail_* 등)이 대응. SSE Mock은 정적 파일 + Mock SSE 서버로 보완 |
| 모듈-도메인 경계 일치 | ✅ 05의 모듈(8개) ≅ FRONT_SPEC 그룹(5개: 공통/일정/메모/태그/알림). 연결/첨부/검색은 기존 화면(S103/S202/S003)에 흡수 — 07 리뷰와 일관 |

## AI 추가 의심 / 불일치
- `TagAssignmentService` 개념이 tag_SPEC.md에 처음 등장(05에 명시 없음) — 16에서 "태그 부여/해제 흐름"을 모듈 내부 서비스로 귀속한 설계 결정. 05 재작성 불요(공통 인터페이스 아님, 모듈 내부). **경미 지적**: /build-interfaces에서 공통 인터페이스 추가 여부 재확인 권장.
- 나머지는 모두 기존 명세 조립.

## 모듈-도메인 경계 정합성
- 04의 8 모듈 ↔ 07의 5 화면 도메인: 검색/연결/첨부가 독립 화면 없음은 07 시점부터 의도. 16에서 각 모듈 SPEC이 관련 화면을 명시적으로 참조(예: attachment_SPEC이 S103/S202 화면 내 사용 명시) — 일관.

## 수치
- MODULE_SPEC 모듈 커버율: **8/8 (100%)**
- FRONT_SPEC 화면 커버율: **12/12 (100%)**
- 교차 일관성: **3/3 항목 통과**
- API 매핑 일치: 27/27 (100%)
- 필수 외부 연동 어댑터 기재: 8/8 모듈 "없음 + 근거"

## 판단
✅ 개발 진행 가능

### 경미 메모 (/build-* 단계 이전 해소 권장)
1. **`TagAssignmentService`**(내부)는 실제 구현 시 schedule/memo 모듈이 태그 모듈의 Bean을 직접 주입하는 모양 — 헌법 §모듈 격리 원칙에 반할 수 있음. 05에 `TagAssignment` 인터페이스 추가 고려 또는 schedule/memo가 `POST /api/tags/bulk-assign`을 호출하는 내부 API로 변환 가능. /build-interfaces에서 결정.
2. **/session17** 실행 전 상태 — 외부 연동 "없음" 확정이 modules/ SPEC에 전부 명시되어 있으나, 17에서 확인 리스트 문서로 총괄 필요.
3. **MarkdownEditor 서드파티 선택**, **Mock SSE 서버 구현**은 /build-design-system 시작 시 확정.
4. **archunit 기반 모듈 격리 테스트**는 15 법률에서 제안됨 — /build-infra에서 구현.
