# ERD (초안 → 최종 확정)

기준 입력: 01_요구사항명세서.md, 02_도메인_분류.md, PROJECT_CONTEXT.md
**최종 확정**: /session14에서 05/10/11/12 교차 점검 후 확정. 변경 요약은 문서 하단 §14 최종 확정 노트 참조.

권한 모델: **Simple Role + 소유자 검사** (PROJECT_CONTEXT §2)
→ `user.role` enum 컬럼 필수, 모든 리소스 테이블에 `owner_id` 필수

---

## 공통 컬럼 규칙

- **PK 전략**: `BIGINT AUTO_INCREMENT` (H2/JPA 기본, F004 입력 항목이 `long`로 명세됨)
- **공통 필드** (BaseEntity 후보, /session6에서 최종 확정):
  - `id BIGINT PK AUTO_INCREMENT`
  - `created_at DATETIME NOT NULL`
  - `updated_at DATETIME NOT NULL`
- **Soft delete 없음**
  - 01의 삭제 명세가 "되돌릴 수 없음(확인 다이얼로그)"이고, 연결 링크 해제가 명시적으로 정의되어 있어 **하드 삭제**로 처리. `deleted_at` 도입하지 않음.
- **owner_id 규칙**
  - 사용자 단위 격리. 모든 리소스(`schedule`, `memo`, `tag`, `attachment`)에 `owner_id BIGINT NOT NULL, FK → user.id`.
  - 연결 테이블(`schedule_memo_link`, `schedule_tag`, `memo_tag`)은 양쪽 리소스가 동일 `owner_id`를 가지는 것으로 간접 강제(애플리케이션 레벨 검사, 02의 "본인 자산끼리만 연결 가능"에 근거).
- **날짜/시간 타입**: `DATETIME` (H2 TIMESTAMP) — 타임존 세밀 처리 제외 범위 (01 MVP 제외 항목).

---

## 도메인: 사용자/인증

### 테이블: `user`
| 컬럼명 | 타입 | 필수 | 설명 | 비고 |
|--------|------|------|------|------|
| id | BIGINT | Y | PK | AUTO_INCREMENT |
| login_id | VARCHAR(50) | Y | 로그인 ID | UNIQUE |
| password_hash | VARCHAR(255) | Y | 비밀번호 해시 | 01 F001 "ID/PW" |
| role | VARCHAR(20) | Y | 역할 enum | 기본값 `USER` |
| created_at | DATETIME | Y | 생성 시각 | |
| updated_at | DATETIME | Y | 수정 시각 | |

### FK 관계
- 없음 (루트)

### 상태값 정의
| 테이블 | 컬럼 | 값 | 설명 |
|--------|------|----|------|
| user | role | `USER` | 일반 사용자 (PROJECT_CONTEXT "일반 사용자 1종") |

---

## 도메인: 일정

### 테이블: `schedule`
| 컬럼명 | 타입 | 필수 | 설명 | 비고 |
|--------|------|------|------|------|
| id | BIGINT | Y | PK | AUTO_INCREMENT |
| owner_id | BIGINT | Y | 소유 사용자 | FK → user.id |
| title | VARCHAR(200) | Y | 일정 제목 | 01 F002 |
| start_at | DATETIME | Y | 시작 시각 | 01 F002 |
| end_at | DATETIME | Y | 종료 시각 | start_at ≤ end_at (app 검증) |
| location | VARCHAR(200) | N | 장소 | 01 F002 |
| repeat_rule | VARCHAR(10) | Y | 반복 규칙 enum | 기본값 `NONE` (01 F002·F008) |
| remind_before_minutes | INT | Y | 시작 전 알림 분 | 기본값 `30` (01 F002·F007) |
| created_at | DATETIME | Y | | |
| updated_at | DATETIME | Y | | |

### FK 관계
- `schedule.owner_id` → `user.id` (일정은 특정 사용자 소유)

### 상태값 정의
| 테이블 | 컬럼 | 값 | 설명 |
|--------|------|----|------|
| schedule | repeat_rule | `NONE` | 반복 없음 (기본) |
| schedule | repeat_rule | `DAILY` | 매일 반복 (F008) |
| schedule | repeat_rule | `WEEKLY` | 매주 반복 (F008) |
| schedule | repeat_rule | `MONTHLY` | 매월 반복 (F008) |

---

## 도메인: 메모

### 테이블: `memo`
| 컬럼명 | 타입 | 필수 | 설명 | 비고 |
|--------|------|------|------|------|
| id | BIGINT | Y | PK | AUTO_INCREMENT |
| owner_id | BIGINT | Y | 소유 사용자 | FK → user.id |
| title | VARCHAR(200) | Y | 메모 제목 | 01 F003 |
| body | CLOB | N | 마크다운 본문 | 체크박스(F010) 포함 |
| created_at | DATETIME | Y | | |
| updated_at | DATETIME | Y | | |

### FK 관계
- `memo.owner_id` → `user.id`

### 상태값 정의
- 없음 (F010 체크리스트는 body 마크다운 `- [ ]` / `- [x]`로 저장, 별도 테이블 없음)

---

## 도메인: 연결 (일정-메모 링크)

### 테이블: `schedule_memo_link`
| 컬럼명 | 타입 | 필수 | 설명 | 비고 |
|--------|------|------|------|------|
| id | BIGINT | Y | PK | AUTO_INCREMENT |
| schedule_id | BIGINT | Y | 일정 ID | FK → schedule.id |
| memo_id | BIGINT | Y | 메모 ID | FK → memo.id |
| origin | VARCHAR(20) | Y | 생성 기원 enum | F004/F005 구분 |
| created_at | DATETIME | Y | 연결 생성 시각 | |

제약: `UNIQUE (schedule_id, memo_id)` — F004 "이미 연결된 메모 재연결 시 무시" 근거

### FK 관계
- `schedule_memo_link.schedule_id` → `schedule.id` (연결 대상 일정)
- `schedule_memo_link.memo_id` → `memo.id` (연결 대상 메모)
- 주의: schedule 또는 memo 삭제 시 본 링크 행도 삭제(01의 "링크만 끊는다" 충족). `ON DELETE CASCADE` 또는 앱 레벨 삭제 중 선택은 /session4 이후 결정.

### 상태값 정의
| 테이블 | 컬럼 | 값 | 설명 |
|--------|------|----|------|
| schedule_memo_link | origin | `SCHEDULE_TO_MEMO` | F004 일정에서 메모 붙이기로 생성 |
| schedule_memo_link | origin | `MEMO_TO_SCHEDULE` | F005 메모에서 일정 만들기로 생성 |

---

## 도메인: 태그

### 테이블: `tag`
| 컬럼명 | 타입 | 필수 | 설명 | 비고 |
|--------|------|------|------|------|
| id | BIGINT | Y | PK | AUTO_INCREMENT |
| owner_id | BIGINT | Y | 소유 사용자 | FK → user.id |
| name | VARCHAR(50) | Y | 태그명 | 01 F009 |
| parent_id | BIGINT | N | 상위 태그 | FK → tag.id (self) |
| depth | INT | Y | 계층 깊이 | 1~3 (F009 "최대 3단계") |
| created_at | DATETIME | Y | | |
| updated_at | DATETIME | Y | | |

제약: `UNIQUE (owner_id, parent_id, name)` — 같은 부모 아래 동명 태그 금지, 애플리케이션에서 `depth ≤ 3` 검증.

### 테이블: `schedule_tag` (N:N)
| 컬럼명 | 타입 | 필수 | 설명 | 비고 |
|--------|------|------|------|------|
| schedule_id | BIGINT | Y | 일정 ID | FK → schedule.id, PK 일부 |
| tag_id | BIGINT | Y | 태그 ID | FK → tag.id, PK 일부 |
| created_at | DATETIME | Y | | |

제약: 복합 PK `(schedule_id, tag_id)`

### 테이블: `memo_tag` (N:N)
| 컬럼명 | 타입 | 필수 | 설명 | 비고 |
|--------|------|------|------|------|
| memo_id | BIGINT | Y | 메모 ID | FK → memo.id, PK 일부 |
| tag_id | BIGINT | Y | 태그 ID | FK → tag.id, PK 일부 |
| created_at | DATETIME | Y | | |

제약: 복합 PK `(memo_id, tag_id)`

### FK 관계
- `tag.owner_id` → `user.id`
- `tag.parent_id` → `tag.id` (자기참조, nullable — 최상위면 null)
- `schedule_tag.schedule_id` → `schedule.id`
- `schedule_tag.tag_id` → `tag.id`
- `memo_tag.memo_id` → `memo.id`
- `memo_tag.tag_id` → `tag.id`

### 상태값 정의
- 없음

---

## 도메인: 첨부

### 테이블: `attachment`
| 컬럼명 | 타입 | 필수 | 설명 | 비고 |
|--------|------|------|------|------|
| id | BIGINT | Y | PK | AUTO_INCREMENT |
| owner_id | BIGINT | Y | 소유 사용자 | FK → user.id |
| target_type | VARCHAR(20) | Y | 대상 리소스 종류 enum | SCHEDULE / MEMO |
| target_id | BIGINT | Y | 대상 리소스 ID | schedule.id 또는 memo.id |
| file_name | VARCHAR(255) | Y | 원본 파일명 | |
| content_type | VARCHAR(100) | Y | MIME 타입 | image/jpeg, image/png, image/gif, application/pdf (F011 제한) |
| file_size | BIGINT | Y | 바이트 크기 | ≤ 10MB 앱 검증 |
| storage_path | VARCHAR(500) | Y | 내부 저장소 경로 | 내부 파일 스토리지 |
| created_at | DATETIME | Y | | |

제약: 다형 참조(`target_type` + `target_id`)이므로 DB FK는 걸지 않음. 앱에서 검증.
- 인덱스: `(target_type, target_id)` — 특정 일정/메모의 첨부 조회용
- 건당 최대 5개 제한은 애플리케이션 레벨 검증 (F011).

### FK 관계
- `attachment.owner_id` → `user.id`
- `attachment.target_id` → 다형(schedule.id 또는 memo.id) — DB FK 없음

### 상태값 정의
| 테이블 | 컬럼 | 값 | 설명 |
|--------|------|----|------|
| attachment | target_type | `SCHEDULE` | 일정에 붙은 첨부 |
| attachment | target_type | `MEMO` | 메모에 붙은 첨부 |

---

## 도메인: 검색
- **별도 테이블 없음**. `schedule.title`, `schedule.location`, `memo.title`, `memo.body`를 직접 `LIKE` 또는 H2 FULLTEXT로 조회. 인덱스 설계는 /session11에서 확정.

---

## 도메인: 알림
- **별도 테이블 없음**.
  - 01 F007: "SSE 연결 끊김 시 재접속 후 누락 알림은 표시하지 않음 (실시간만)" → 발송 이력 보관 불필요.
  - 알림 트리거는 `schedule.start_at`과 `schedule.remind_before_minutes`만으로 계산 가능.
  - 중복 발송 방지/재전송은 01에 요구 없음 — 추가하지 않음.

---

## 전체 FK 요약

```
user (1) ──┬── (N) schedule.owner_id
           ├── (N) memo.owner_id
           ├── (N) tag.owner_id
           └── (N) attachment.owner_id

schedule (1) ──┬── (N) schedule_memo_link.schedule_id
               └── (N) schedule_tag.schedule_id

memo (1) ──┬── (N) schedule_memo_link.memo_id
           └── (N) memo_tag.memo_id

tag (1) ──┬── (N) schedule_tag.tag_id
          ├── (N) memo_tag.tag_id
          └── (N) tag.parent_id  (self, nullable)

attachment.target_id : 다형 (schedule.id | memo.id) — DB FK 없음
```

---

## 테이블 목록 요약
| # | 테이블 | 유형 | 도메인 |
|---|--------|------|--------|
| 1 | user | 엔티티 | 사용자/인증 |
| 2 | schedule | 엔티티 | 일정 |
| 3 | memo | 엔티티 | 메모 |
| 4 | schedule_memo_link | 조인 | 연결 |
| 5 | tag | 엔티티 | 태그 |
| 6 | schedule_tag | 조인 | 태그 |
| 7 | memo_tag | 조인 | 태그 |
| 8 | attachment | 엔티티(다형) | 첨부 |

- 총 8 테이블 (엔티티 5, 조인 3)
- 권한 모델 적용: `user.role` enum, 모든 리소스에 `owner_id`
- 요구사항명세서에 없는 테이블: 0개 (알림 이력 · 검색 인덱스 추가하지 않음)

---

## §14 최종 확정 노트 (/session14)

### 1. 11/12 교차 점검: ERD 누락 항목
| API | 필요한 테이블/컬럼 | 현재 ERD 상태 | 조치 |
|-----|------------------|-------------|------|
| 전 API | user/schedule/memo/tag/schedule_memo_link/schedule_tag/memo_tag/attachment 필드 | 전부 존재 | 없음 |
| POST /api/attachments downloadUrl | `attachment.storage_path` 기반 계산값 (응답 필드) | 존재 (storage_path) | 없음. URL은 애플리케이션이 조립 |
| GET /api/search sortAt | 계산값(schedule=start_at, memo=updated_at) | 계산값 | 별도 컬럼 불요 |
| F008 반복 전개 | `schedule.repeat_rule` 단독으로 충분 | 존재 | 없음 |
| F007 SSE 페이로드 | 별도 테이블 없음 — 런타임 스캔 | 03 초안 결정 유지 | 없음 |

**누락 0건**. ERD 변경 불요.

### 2. 표시 데이터 vs ERD 대조 (샘플, 10_review에서 이미 100% 확인)
| 화면 | 표시 항목 | ERD 출처 | 존재 |
|------|---------|---------|------|
| S003 | 결과 title/startAt/endAt/location | schedule.* | ✅ |
| S103 | remindBeforeMinutes | schedule.remind_before_minutes | ✅ |
| S202 | body (마크다운) | memo.body (CLOB) | ✅ |
| S401 | linkedMemos 요약 | schedule_memo_link + memo | ✅ |

- 이미 10 리뷰에서 75/75 (100%) 확인. 추가 변경 없음.

### 3. 성능 점검 · 인덱스 제안

11의 조회 패턴에 따라 아래 인덱스 **추가 확정**:

| 테이블 | 인덱스 | 용도 |
|--------|-------|------|
| user | `UNIQUE(login_id)` | 03 초안에서 이미 UNIQUE 명시됨. 확정 |
| schedule | `idx_schedule_owner_start(owner_id, start_at)` | S101/S102 캘린더 범위 조회, F007 알림 스캔 |
| schedule | `idx_schedule_owner_title(owner_id, title)` — 검색 LIKE 보조 | S003 일정 제목 검색 (성능 예의, MVP 필수 아님) |
| memo | `idx_memo_owner_updated(owner_id, updated_at DESC)` | S201 목록 기본 정렬 |
| memo | FULLTEXT `idx_memo_body` 또는 LIKE | S003 body 검색 — H2는 FULLTEXT 제한적, 기본은 LIKE. /session15 법률에서 확정 |
| schedule_memo_link | `UNIQUE(schedule_id, memo_id)` | 03 초안 명시. 확정 |
| schedule_memo_link | `idx_link_memo(memo_id)` | GET /api/memos/{id}/linked-schedules 역방향 조회 |
| tag | `idx_tag_owner_parent(owner_id, parent_id)` | 트리 로드 |
| tag | `UNIQUE(owner_id, parent_id, name)` | 03 초안 명시. 확정 |
| schedule_tag | PK `(schedule_id, tag_id)` + `idx_tag_schedule(tag_id)` | 태그 기반 역조회 |
| memo_tag | PK `(memo_id, tag_id)` + `idx_tag_memo(tag_id)` | 동일 |
| attachment | `idx_attachment_target(target_type, target_id)` | 03 초안 명시. 확정 |
| attachment | `idx_attachment_owner(owner_id)` | 소유자별 정리(이벤트 처리) |

### 4. FK 삭제 정책 (CASCADE vs 앱 레벨) — 04 리뷰 경미 메모 해소

| 관계 | 정책 | 이유 |
|------|------|------|
| schedule.owner_id → user.id | `ON DELETE RESTRICT` | 사용자 삭제 기능 없음(01 범위) — 실질 미발생 |
| memo.owner_id → user.id | `ON DELETE RESTRICT` | 동일 |
| tag.owner_id → user.id | `ON DELETE RESTRICT` | 동일 |
| attachment.owner_id → user.id | `ON DELETE RESTRICT` | 동일 |
| schedule_memo_link.schedule_id → schedule.id | **앱 레벨 정리** (`ResourceDeletedEvent` 구독) | 05 단방향화, 트랜잭션 제어 명확 |
| schedule_memo_link.memo_id → memo.id | **앱 레벨 정리** | 동일 |
| schedule_tag.schedule_id → schedule.id | **앱 레벨 정리** | 동일 |
| schedule_tag.tag_id → tag.id | **앱 레벨 정리** (태그 삭제 시) | 동일 |
| memo_tag.memo_id → memo.id | **앱 레벨 정리** | 동일 |
| memo_tag.tag_id → tag.id | **앱 레벨 정리** | 동일 |
| tag.parent_id → tag.id | `ON DELETE RESTRICT` (자식 존재 시 409 TAG-4090) | 11 엔드포인트 규약 일치 |
| attachment.target_id | FK 없음(다형) + 앱 레벨 정리 | 03 초안 결정 유지 |

### 5. 정규화/반정규화 판단

| 대상 | 현재 | 권장 | 이유 |
|------|------|------|------|
| attachment 다형 참조 | `target_type + target_id` 다형 FK 없음 | 유지 | target이 2종(SCHEDULE/MEMO)이고 각 join 테이블 분리(2 테이블) 시 코드 중복 > 다형의 복잡도. 규모 1명 사용자. |
| tag.depth 컬럼 | 저장(반정규화) | 유지 | 매 조회마다 계산 비용 절감. 쓰기 비용 미미 |
| memo.body 검색 | CLOB + LIKE | 유지(MVP) | 싱글 유저 규모에서 FULLTEXT 불필요. 데이터 증가 시 재검토 |
| bodyExcerpt | DB 미저장, 응답에서 앞 200자 계산 | 유지 | 저장 필요 없음 |

### 6. /session4 리뷰 경미 메모 해소 체크
- [x] CASCADE vs 앱 레벨 결정 — 위 표에서 확정
- [x] "연결" 모듈 네이밍 — /session16 MODULE_SPEC에서 `schedule-memo-link`로 확정 예정 (본 세션 범위 외)

### 7. 역행 사유
- 없음. 03의 8 테이블 구조 그대로 최종 확정.
- 변경 사항: **인덱스 명시 + FK 삭제 정책 확정 + 최종 확정 노트 추가**. 컬럼/테이블 추가·삭제 없음.
