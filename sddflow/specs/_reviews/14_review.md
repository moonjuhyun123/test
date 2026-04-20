# 리뷰: 03_ERD.md (세션 14 최종 확정)
- 일시: 2026-04-20
- 기준: 05/10/11/12

## API → ERD 필드 매핑

11의 27개 API가 참조하는 필드를 ERD에 대조 (샘플링 + 전수).

| API | 필요 필드 | ERD 존재 | 상태 |
|-----|---------|---------|------|
| POST /auth/login | user.login_id, user.password_hash, user.role, user.id | ✅ | ✅ |
| GET /auth/me | user.id, user.login_id, user.role | ✅ | ✅ |
| POST /schedules | schedule.* (전 컬럼) + schedule_memo_link.* (F005) | ✅ | ✅ |
| GET /schedules | schedule.* (owner_id, start_at, end_at, title, location, repeat_rule) + schedule_tag(tag filter) | ✅ | ✅ |
| GET /schedules/{id} | schedule.* + schedule_tag + tag.name/id/parent_id/depth | ✅ | ✅ |
| PATCH /schedules/{id} | 동일 | ✅ | ✅ |
| DELETE /schedules/{id} | schedule.id, owner_id | ✅ | ✅ |
| GET /schedules/{id}/linked-memos | schedule_memo_link.id/created_at + memo.id/title/body/updated_at | ✅ | ✅ |
| GET /schedules/{id}/attachments | attachment.* (전 컬럼) | ✅ | ✅ |
| POST /memos | memo.* + memo_tag | ✅ | ✅ |
| GET /memos | memo.* + memo_tag + tag | ✅ | ✅ |
| GET /memos/{id} | memo.* + memo_tag + tag | ✅ | ✅ |
| PATCH /memos/{id} | memo.* | ✅ | ✅ |
| DELETE /memos/{id} | memo.id, owner_id | ✅ | ✅ |
| GET /memos/{id}/linked-schedules | schedule_memo_link.* + schedule.id/title/start_at/end_at/location | ✅ | ✅ |
| GET /memos/{id}/attachments | attachment.* | ✅ | ✅ |
| POST /links | schedule_memo_link.* + schedule.owner_id + memo.owner_id (소유자 동일성 검증) | ✅ | ✅ |
| DELETE /links/{id} | schedule_memo_link.id + owner 검증은 schedule/memo 조인 | ✅ | ✅ |
| GET /tags | tag.* | ✅ | ✅ |
| POST /tags | tag.* (name/parent_id/depth/owner_id) | ✅ | ✅ |
| PATCH /tags/{id} | tag.* | ✅ | ✅ |
| DELETE /tags/{id} | tag.id + schedule_tag/memo_tag(매핑 정리) | ✅ | ✅ |
| POST /attachments | attachment.* (multipart → storage_path) | ✅ | ✅ |
| GET /attachments/{id}/download | attachment.storage_path/content_type/file_name | ✅ | ✅ |
| DELETE /attachments/{id} | attachment.id/owner_id | ✅ | ✅ |
| GET /search | schedule.title/location + memo.title/body + tag join | ✅ | ✅ |
| GET /notifications/stream | schedule.start_at/remind_before_minutes + schedule_memo_link + memo | ✅ | ✅ |

- API 필드 커버율: **100%** (27/27)

## 표시 데이터 → ERD 매핑 (10 샘플 재확인)

| 화면 | 항목 | ERD 출처 | 존재 |
|------|------|---------|------|
| S002 | 사용자 이니셜 | user.login_id | ✅ |
| S003 | 결과(일정) 필드 | schedule.* + tag via schedule_tag | ✅ |
| S003 | 결과(메모) 필드 | memo.* + tag via memo_tag | ✅ |
| S101/102 | 캘린더 이벤트 | schedule.* | ✅ |
| S103 | 붙은 메모 목록 | schedule_memo_link JOIN memo | ✅ |
| S103 | 첨부 목록 | attachment | ✅ |
| S103 | 태그 칩 | schedule_tag JOIN tag | ✅ |
| S202 | 연결 일정 | schedule_memo_link JOIN schedule | ✅ |
| S301 | 트리 | tag (parent_id, depth) | ✅ |
| S401 | SSE 페이로드 | schedule + link + memo | ✅ |

- 표시 데이터 ERD 커버율: 10 리뷰와 동일 **100%** (75/75)

## 인터페이스 DTO → ERD 조회 가능성

05의 DTO를 ERD로 생성 가능한지 확인.

| DTO | 필요 필드 | ERD 출처 | 조회 가능? |
|-----|----------|---------|-----------|
| ScheduleSummary | id, ownerId, title, startAt, endAt, location | schedule.* | ✅ |
| ScheduleTrigger | id, ownerId, title, startAt, remindBeforeMinutes | schedule.* | ✅ |
| MemoSummary | id, ownerId, title, bodyExcerpt(계산값), updatedAt | memo.* | ✅ |
| TagSummary | id, ownerId, name, parentId, depth | tag.* | ✅ |
| ResourceDeletedEvent | resourceType(enum), resourceId, ownerId | 발행 시점의 도메인 데이터 | ✅ |

- 전 DTO ERD 조회 가능.

## 미사용 테이블/컬럼

| 테이블.컬럼 | 사용처 | 판단 |
|------------|------|------|
| user.password_hash | POST /auth/login 검증 | ✅ 사용 |
| user.role | /auth/me, `@PreAuthorize` | ✅ 사용 |
| schedule.end_at | CalendarGrid 지속 시간 표시 | ✅ 사용 |
| schedule_memo_link.origin | F004/F005 분기 분석 + SSE 페이로드(원본 맥락) | ⚠️ 직접 조회 API 없음. 저장만. |
| schedule_memo_link.created_at | linked-memos/linked-schedules 응답의 linkedAt | ✅ 사용 |
| tag.depth | GET /tags 응답 | ✅ 사용 |
| attachment.storage_path | 서버 내부 I/O (downloadUrl 생성) | ✅ 사용 |

### `schedule_memo_link.origin` 관련
- 11의 응답 DTO에 직접 노출되지 않음 (LinkedMemoItem/LinkedScheduleItem 모두 origin 필드 없음)
- 그러나 POST /links 요청/응답의 `origin`으로 저장되어 **데이터 감사/향후 화면 추가 여지** 및 단순 분석 용도 유지.
- **판단**: 유지. 01의 F004(SCHEDULE_TO_MEMO)/F005(MEMO_TO_SCHEDULE) 구분이 요구사항에 명시된 맥락이므로 추적 가치 있음.

### 완전 미사용 테이블·컬럼
- 없음.

## 인덱스 제안 타당성 (14에서 추가 명시된 항목)

| 인덱스 | 타당성 |
|--------|-------|
| schedule(owner_id, start_at) | ✅ 캘린더 + 알림 스캔 둘 다 핵심 패턴 |
| memo(owner_id, updated_at DESC) | ✅ S201 목록 기본 정렬 |
| schedule_memo_link(memo_id) | ✅ 역방향 조회 |
| tag(owner_id, parent_id) | ✅ 트리 로드 |
| schedule_tag/memo_tag 역방향(tag_id) | ✅ 태그 기반 필터 역조회 |
| attachment(target_type, target_id) | ✅ S103/S202 첨부 로드 (03 초안에 이미 있음, 최종 확정) |
| attachment(owner_id) | ✅ 이벤트 처리 시 일괄 정리 |

- 과도한 인덱스 없음. 쓰기 비중 낮은 싱글 유저 환경에서 전부 실용적.

## FK 삭제 정책 타당성 검증

| 정책 | 타당성 |
|------|-------|
| user 참조 RESTRICT | 01에 사용자 삭제 기능 없음 — 실질 미발생 ✅ |
| 매핑 테이블 앱 레벨 정리(이벤트) | 04/05 단방향화 + 트랜잭션 경계 명확 ✅ |
| tag.parent_id RESTRICT | 11 TAG-4090 규약과 일치 ✅ |
| attachment FK 없음(다형) + 앱 레벨 | 03 초기 결정 유지, 일관성 ✅ |

## 수치
- API 필드 커버율: **27/27 (100%)**
- 표시 데이터 ERD 커버율: **75/75 (100%)**
- DTO 조회 가능: **5/5 (100%)**
- 미사용 테이블: **0개**
- 미사용 컬럼: **0개** (origin은 응답 직접 미노출이나 저장 목적 유지)
- 인덱스 추가 제안: **7개** (전부 실사용 패턴 근거)
- FK 정책 충돌: **0건**

## 판단
✅ ERD 확정 가능

### 후속 결정 기록 (15 법률 · 16 MODULE_SPEC에서 참조)
1. **memo.body 검색 방식**: 03에서 "LIKE 기반"으로 확정(H2 FULLTEXT 제한). /session15에서 법률로 기록.
2. **`schedule_memo_link.origin` 필드**는 현재 응답 미노출 — 향후 S103/S202 등에서 "메모에서 생성된 일정" 뱃지 등 추가 시 응답 임베드 가능. 여지만 남기고 본 버전에선 저장 전용.
3. **`GET /api/schedules` 기간 90일 제한**은 13에서 결정된 운영 방어값. /session15 법률의 "페이징/범위 제한"으로 기록 필요.
