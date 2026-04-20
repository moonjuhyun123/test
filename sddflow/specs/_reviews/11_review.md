# 리뷰: 11_API_스펙.md
- 일시: 2026-04-20
- 기준: 01_요구사항명세서.md, 06_공통_구조_설계서.md, 10_표시_데이터_명세.md

## 행위 → API 매핑

01의 사용자 행위를 API로 1:1 추적.

| 행위(근거) | API | 상태 |
|---------|-----|------|
| F001 로그인 | POST /api/auth/login | ✅ |
| F001 현재 사용자 확인 | GET /api/auth/me | ✅ (09 S002 Avatar 표시 근거) |
| F002 일정 생성 | POST /api/schedules | ✅ |
| F002 일정 조회(캘린더 뷰) | GET /api/schedules | ✅ |
| F002 일정 상세 | GET /api/schedules/{id} | ✅ |
| F002 일정 수정 | PATCH /api/schedules/{id} | ✅ |
| F002 일정 삭제 | DELETE /api/schedules/{id} | ✅ |
| F003 메모 생성 | POST /api/memos | ✅ |
| F003 메모 목록 | GET /api/memos | ✅ |
| F003 메모 상세 | GET /api/memos/{id} | ✅ |
| F003 메모 수정 | PATCH /api/memos/{id} | ✅ |
| F003 메모 삭제 | DELETE /api/memos/{id} | ✅ |
| F004 일정에 기존 메모 붙이기 | POST /api/links | ✅ |
| F004 일정에 새 메모 붙이기 | POST /api/memos(attachToScheduleId) → POST /api/links 자동 | ✅ (내부 조합) |
| F004 일정에 붙은 메모 목록 | GET /api/schedules/{id}/linked-memos | ✅ |
| F004 메모에 연결된 일정 목록 | GET /api/memos/{id}/linked-schedules | ✅ |
| F004 링크 해제 | DELETE /api/links/{id} | ✅ |
| F005 메모에서 일정 만들기(양방향) | POST /api/schedules(sourceMemoId) → 링크 자동 | ✅ |
| F006 통합 검색 | GET /api/search | ✅ |
| F007 일정 시작 알림 SSE | GET /api/notifications/stream | ✅ |
| F008 일정 반복(생성/저장) | POST /api/schedules(repeatRule=...) | ✅ |
| F008 반복 일정 캘린더 표시(전개) | GET /api/schedules(from,to) 서버 전개 | ✅ (11에 명시) |
| F009 태그 생성 | POST /api/tags | ✅ |
| F009 태그 목록/트리 | GET /api/tags | ✅ |
| F009 태그 수정 | PATCH /api/tags/{id} | ✅ |
| F009 태그 삭제 | DELETE /api/tags/{id} | ✅ |
| F009 일정/메모에 태그 부여 | POST/PATCH /api/schedules 또는 /api/memos 내 tagIds | ✅ (임베드) |
| F009 태그 필터링(검색/목록) | GET /api/search, /api/memos, /api/schedules(tagIds) | ✅ |
| F010 체크박스 토글(본문 저장) | PATCH /api/memos/{id}(body) | ✅ (별도 엔드포인트 없음, 09에 일치) |
| F011 파일 업로드 | POST /api/attachments | ✅ |
| F011 파일 다운로드/미리보기 | GET /api/attachments/{id}/download | ✅ |
| F011 일정/메모 삭제 시 첨부 삭제 | ResourceDeletedEvent 구독(05) → 첨부 모듈 내부, 별도 API 아님 | ✅ |
| F011 사용자 수동 첨부 삭제 | DELETE /api/attachments/{id} | ✅ |
| (로그아웃) | — (클라이언트 측 JWT 폐기, 11에 "서버 로그아웃 API 없음" 결정 기록) | ✅ 의도적 제외 |

- 01 기능 행위 100% 매핑. 로그아웃 제외는 스테이트리스 JWT 근거로 합리적.

## AI 추가 의심 (01 근거 없는 API)

| API | 01 근거 | 판단 |
|-----|--------|------|
| GET /api/auth/me | F001이 "JWT로 요청 식별" 언급 — 현 사용자 식별은 필연 | ⚠️ 경미 허용 (S002 Avatar 표시에 필요) |
| POST /api/links (별도 endpoint) | F004/F005는 "연결"만 명시. /api/links로 노출은 11의 구조 결정. 기능은 요구 내 | ✅ |
| DELETE /api/links/{id} | F004 "연결 해제" 명시 | ✅ |
| GET /api/schedules/{id}/linked-memos | F004 "일정 상세에 붙은 메모 목록" 명시 | ✅ |
| GET /api/memos/{id}/linked-schedules | F004 "메모 상세에서 연결된 일정 목록을 본다" 명시 | ✅ |
| GET /api/attachments/{id}/download | F011 "미리보기/다운로드" | ✅ |
| DELETE /api/attachments/{id} | F011 "일정/메모 삭제 시 첨부도 삭제" + 사용자 수동 삭제는 실무 관례 | ⚠️ 경미 허용 (09 FileUploader onRemove prop 근거) |
| GET /api/tags (트리) | F009 "필터 UI에 계층 트리 표시" | ✅ |
| PATCH /api/tags/{id} parentId 변경 | F009 계층 관리 일부 | ✅ (09 S301에서 드래그 제외하고 Edit에 상위 선택 존속) |

- 근거 없는 AI 추가 0건. 2건 경미 허용.

## 응답 형식 ApiResponse<T> 적용

| API | 봉투 | 판단 |
|-----|------|------|
| 전 API | `ApiResponse<T>` 명시 + 204는 본문 없음 규약 | ✅ |
| 목록 API (GET /memos, /search) | `ApiResponse<PagedResponse<T>>` | ✅ |
| SSE (/notifications/stream) | 봉투 미적용(표준 SSE 페이로드) | ✅ 관례 부합 |
| 다운로드 (/attachments/{id}/download) | 바이너리(`Content-Type`=원본 MIME) | ✅ 관례 부합 |

## 에러 코드 네임스페이스 준수

| API 샘플 | 코드 | 06 규칙 | 상태 |
|---------|------|--------|------|
| 로그인 실패 | USER-4010 (401) | USER 접두사 + 4010 401 | ✅ |
| JWT 없음/만료 | AUTH-4010 | ✅ | ✅ |
| 일정 유효성 | SCHED-4000 (400) | SCHED 접두사 + 4000 400 | ✅ |
| 일정 404 | SCHED-4040 | ✅ | ✅ |
| 태그 depth/동명 | TAG-4000 | ✅ | ✅ |
| 태그 자식 존재 | TAG-4090 (409) | ✅ | ✅ |
| 파일 용량/확장자 | FILE-4000 | ✅ | ✅ |
| 검색 | SRCH-4000 | ✅ | ✅ |
| 링크 소유자 불일치 | LINK-4030 (403) | ✅ | ✅ |

- 06의 9개 접두사(AUTH/COMM/USER/SCHED/MEMO/LINK/TAG/FILE/SRCH/NOTI) 중 NOTI가 미사용 — SSE 에러는 AUTH-4010으로 흡수 처리, 11에서 누락 아님.

## 통합 디테일

| 항목 | 11 명시 | 상태 |
|------|--------|------|
| 날짜 포맷 | ISO-8601 `yyyy-MM-dd'T'HH:mm:ss` | ✅ |
| nullable | 각 응답 표의 nullable 열 + `null` 규약 | ✅ |
| 빈 목록 | `[]` 명시 (null 금지) | ✅ |
| 페이징 | page(기본 0), size(기본 20, 최대 100), sort(`field,asc|desc`) | ✅ |
| 정렬 | API별 기본 정렬 + 사용자 지정 제한 | ✅ |
| enum 표현 | 문자열 대문자 예시 명시 | ✅ |
| 파라미터 camelCase | 통합 디테일 첫머리 명시 | ✅ |

- 6/6 (+ camelCase 7번째) 전부 명시.

## ★ 표시 데이터 커버리지 (10 대조)

| 화면 | 10의 주요 표시 항목 | 11 API 응답 필드 | 커버 |
|------|---------------------|------------------|------|
| S001 | 실패 메시지 | `ErrorBody.message` | ✅ |
| S002 | 이니셜/로그인ID | `/auth/me`: loginId | ✅ |
| S003 | 일정·메모 혼합 결과, 태그 칩, Pagination | SearchItem(type/title/summary/startAt/endAt/updatedAt/sortAt/tags) + PagedResponse | ✅ |
| S101/102 | 제목/startAt/endAt/location/반복 뱃지 | ScheduleCalendarItem 전 필드 | ✅ |
| S103 | title/시간/장소/반복/알림분/태그/첨부/붙은 메모/linkId | ScheduleDetail + /linked-memos(LinkedMemoItem) + /attachments | ✅ |
| S104 | 태그 옵션 + (F005 원본 메모 제목) | /tags 응답 + (S104 클라이언트가 `GET /api/memos/{id}` 조회 가능) | ⚠️ F005 원본 메모 제목은 S104에서 클라이언트가 `GET /memos/{sourceMemoId}`를 호출해야 함 — 11에 전용 엔드포인트는 없지만 `GET /memos/{id}`로 충분. 문서에 명시적 흐름은 없음 | |
| S201 | 메모 카드(title/bodyExcerpt/updatedAt/tags) + Pagination | MemoCardItem + PagedResponse | ✅ |
| S202 | body/tags/linkedSchedules/attachments + 메타 | MemoDetail + /linked-schedules + /attachments | ✅ |
| S203 | 태그 옵션 + (F004 대상 일정 제목) | /tags + (클라이언트가 `GET /schedules/{id}` 호출) | ⚠️ 위와 동일. 기존 엔드포인트로 충족 |
| S301 | name/parentId/depth | TagNode | ✅ |
| S401 | title/startAt/scheduleId/linkedMemos | SSE 페이로드 | ✅ |

- 표시 데이터 커버리지: **12/12 (100%)** — ⚠️ 2건(S104/S203 배너)은 기존 엔드포인트 재사용으로 해결, 보완 필요 없음. 문서에 명시 흐름 추가는 /session13(화면-API 매핑) 책임.

## ★ 입력 데이터 커버리지

| 화면 | 10 입력 | 11 API 파라미터 | 커버 |
|------|--------|----------------|------|
| S001 | id/password | POST /auth/login 요청 | ✅ |
| S002 | q | — (클라이언트가 S003 URL로 이동) | ✅ |
| S003 | keyword/type/tagIds/page/size | GET /search 쿼리 | ✅ |
| S101/102 | yearMonth/weekStart | GET /schedules `from/to` | ✅ (클라이언트가 월/주 → from/to 변환) |
| S103 | 수정 필드 + 업로드 + 연결 해제 | PATCH /schedules/{id} + POST /attachments + DELETE /links/{id} | ✅ |
| S104 | 9필드 + sourceMemoId | POST /schedules 요청 | ✅ |
| S201 | keyword/tagIds/page/size + (attachToScheduleId) | GET /memos + 선택 모드는 POST /links | ✅ |
| S202 | title/body/tagIds/file/linkId/체크박스(body) | PATCH /memos + POST /attachments + DELETE /links | ✅ |
| S203 | title/body/tagIds/file/attachToScheduleId | POST /memos 요청 + 자동 링크 | ✅ |
| S301 | name/parentId/id | POST/PATCH/DELETE /tags | ✅ |
| S401 | JWT(SSE) | GET /notifications/stream | ✅ |

- 입력 데이터 커버리지: **12/12 (100%)**

## 수치
- 행위 매핑률: **34/34** (F001~F011에서 도출한 세부 행위, 로그아웃 의도적 제외 포함) = 100%
- AI 추가 의심: 2건(경미 허용), 근거 없는 추가 0건
- 통합 디테일: 6/6 + camelCase 1건
- 표시 데이터 커버리지: 12/12 (100%)
- 입력 데이터 커버리지: 12/12 (100%)
- 응답 봉투 적용: 전 API (SSE·다운로드는 관례 예외)
- 에러 코드 네임스페이스 준수: ✅

## 판단
✅ 다음 진행 가능

### 경미 메모
1. S104/S203 배너 용 "원본/대상 제목 조회" 흐름이 11에서 별도 기술되지 않음 — 기존 `GET /memos/{id}`, `GET /schedules/{id}`로 충족되나 /session13 화면-API 매핑에서 명시 권장.
2. **NOTI 접두사 미사용**. 06에 정의됐으나 실사용 에러 없음. 유지/제거 결정은 /session15 법률 섹션 작성 시 함께.
3. `GET /api/schedules` 기간 제한 **90일**은 11에서 처음 등장 — 운영 방어값. /session15 법률에 정량 값으로 기록 권장.
4. `POST /api/links`의 멱등 응답 규약(`alreadyExisted`) — 06에는 일반 규칙 없음. /session12 테스트 케이스에서 케이스화 필요.
