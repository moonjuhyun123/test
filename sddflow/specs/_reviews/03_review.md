# 리뷰: 03_ERD.md
- 일시: 2026-04-20
- 기준: 02_도메인_분류.md, 01_요구사항명세서.md, PROJECT_CONTEXT.md
- 권한 모델: Simple Role + 소유자 검사

---

## 도메인별 테이블 존재

| 도메인 | 테이블 | 상태 |
|--------|--------|------|
| 사용자/인증 | user | ✅ |
| 일정 | schedule | ✅ |
| 메모 | memo | ✅ |
| 연결 | schedule_memo_link | ✅ |
| 태그 | tag / schedule_tag / memo_tag | ✅ |
| 첨부 | attachment | ✅ |
| 검색 | (별도 테이블 없음 — schedule/memo 컬럼 직접 조회) | ✅ (명시적 설계) |
| 알림 | (별도 테이블 없음 — 실시간 SSE만, 01 F007 "누락 알림 표시 안 함" 근거) | ✅ (명시적 설계) |

도메인 커버율: **8/8 (100%)**

---

## 행위별 데이터 존재

### 사용자/인증
| 행위 | 필요 데이터 | ERD 존재 |
|------|-----------|---------|
| ID/PW 로그인 | login_id, password_hash | ✅ user.login_id, user.password_hash |
| JWT 발급/검증 | stateless (테이블 불필요) | ✅ (설계적 결정) |
| 로그아웃 | stateless | ✅ |

### 일정
| 행위 | 필요 데이터 | ERD 존재 |
|------|-----------|---------|
| 제목·시작/종료·장소로 생성 | title, start_at, end_at, location | ✅ schedule |
| 월/주 뷰 조회 | start_at 조회 가능 | ✅ |
| 수정/삭제 | id | ✅ |
| 반복 규칙 지정 | repeat_rule enum | ✅ schedule.repeat_rule |
| 알림 시각 지정 | remind_before_minutes | ✅ schedule.remind_before_minutes |

### 메모
| 행위 | 필요 데이터 | ERD 존재 |
|------|-----------|---------|
| 제목·마크다운 본문 생성 | title, body | ✅ memo.title, memo.body (CLOB) |
| 최근순 조회·상세 | created_at | ✅ memo.created_at |
| 수정/삭제 | id | ✅ |
| 체크박스 항목 관리 | body 내 마크다운 `- [ ]`/`- [x]` | ✅ (01 F010 주석 일치) |

### 연결
| 행위 | 필요 데이터 | ERD 존재 |
|------|-----------|---------|
| 일정에 메모 붙이기 (신규/기존) | schedule_id, memo_id | ✅ schedule_memo_link |
| 메모에서 일정 만들고 양방향 연결 | schedule_id, memo_id + origin 구분 | ✅ origin enum (MEMO_TO_SCHEDULE) |
| 일정의 붙은 메모 목록 | schedule_id 인덱스 | ✅ (FK로 가능) |
| 메모의 연결 일정 목록 | memo_id 인덱스 | ✅ (FK로 가능) |
| 연결 해제 (데이터 유지) | 행 삭제 | ✅ 하드 삭제 방침 일치 |
| 중복 연결 무시(F004) | UNIQUE 제약 | ✅ UNIQUE(schedule_id, memo_id) |

### 태그
| 행위 | 필요 데이터 | ERD 존재 |
|------|-----------|---------|
| 태그 생성 (이름·상위) | name, parent_id | ✅ tag.name, tag.parent_id |
| 3단계 계층 관리 | depth 제약 | ✅ tag.depth (앱 검증 ≤ 3) |
| 수정/삭제 | id | ✅ |
| 일정·메모에 부여 | N:N 조인 | ✅ schedule_tag, memo_tag |
| 태그로 필터링 | 조인 조회 | ✅ |

### 첨부
| 행위 | 필요 데이터 | ERD 존재 |
|------|-----------|---------|
| 파일 업로드 | file_name, content_type, file_size, storage_path | ✅ attachment |
| 대상 구분 (일정/메모) | target_type, target_id | ✅ |
| 용량/개수 제한 | file_size + 앱 카운트 | ✅ (앱 검증) |
| 썸네일/미리보기/다운로드 | storage_path 조회 | ✅ |
| 대상 삭제 시 함께 삭제 | target_type+target_id로 조회 가능 | ✅ (인덱스 있음) |

### 검색
| 행위 | 필요 데이터 | ERD 존재 |
|------|-----------|---------|
| 키워드 검색 (일정 제목·장소, 메모 제목·본문) | schedule.title/location, memo.title/body | ✅ |
| 타입 필터 (ALL/SCHEDULE/MEMO) | 앱 레벨 WHERE | ✅ |
| 태그 필터 | schedule_tag/memo_tag 조인 | ✅ |
| 시간 역순 표시 | created_at 정렬 | ✅ |

### 알림
| 행위 | 필요 데이터 | ERD 존재 |
|------|-----------|---------|
| 시작 N분 전 SSE 발송 | start_at, remind_before_minutes | ✅ schedule 컬럼 |
| 연결된 메모 요약 포함 | schedule_memo_link 조인 → memo | ✅ |
| 알림에서 일정 상세 이동 | schedule.id | ✅ |

행위 데이터 커버율: **33/33 (100%)**

---

## AI 추가 의심 테이블

| 테이블 | 02 언급 | 판단 |
|--------|--------|------|
| user | (권한 모델 필수) | ✅ 예외 허용 (Simple Role 필수) |
| schedule | ✅ | OK |
| memo | ✅ | OK |
| schedule_memo_link | ✅ (연결 도메인) | OK |
| tag | ✅ | OK |
| schedule_tag | ✅ (N:N) | OK |
| memo_tag | ✅ (N:N) | OK |
| attachment | ✅ | OK |

AI 추가 의심: **0개**
알림 이력·검색 인덱스 테이블 모두 명시적으로 "만들지 않음" 사유 기재 — 좋음.

---

## FK 방향 검증

| FK | 방향 | 판단 |
|----|------|------|
| schedule.owner_id → user.id | 부모 user → 자식 schedule | ✅ |
| memo.owner_id → user.id | 부모 → 자식 | ✅ |
| tag.owner_id → user.id | 부모 → 자식 | ✅ |
| tag.parent_id → tag.id | 자기참조 (nullable) | ✅ |
| attachment.owner_id → user.id | 부모 → 자식 | ✅ |
| schedule_memo_link.schedule_id → schedule.id | 연결 → 엔티티 | ✅ |
| schedule_memo_link.memo_id → memo.id | 연결 → 엔티티 | ✅ |
| schedule_tag / memo_tag | 조인 → 엔티티 | ✅ |
| attachment.target_id → (schedule\|memo) | 다형 참조, DB FK 없음 | ⚠️ 설계적 trade-off (명시적으로 앱 검증 위임, 01 F011 범위에선 허용 가능) |

---

## 상태 컬럼 검증

| 테이블 | 상태 컬럼 필요성 | 존재 |
|--------|--------------|------|
| user | role (Simple Role 필수) | ✅ user.role (USER) |
| schedule | repeat_rule (F008) | ✅ schedule.repeat_rule (NONE/DAILY/WEEKLY/MONTHLY) |
| schedule_memo_link | origin (F004/F005 구분) | ✅ schedule_memo_link.origin |
| attachment | target_type (다형 구분) | ✅ attachment.target_type (SCHEDULE/MEMO) |
| memo | 상태값 필요 없음 | — (체크박스는 body 마크다운) |
| tag | 상태값 필요 없음 | — |

모두 충족.

---

## PK 전략 일관성

| 테이블 | PK | 전략 |
|--------|----|-----|
| user, schedule, memo, tag, attachment, schedule_memo_link | BIGINT AUTO_INCREMENT (surrogate) | 일관 |
| schedule_tag, memo_tag | 복합 PK (리소스 ID + tag_id) | 조인 테이블 관례에 부합 |

✅ 일관적 (surrogate 우선, 순수 N:N 조인만 복합 PK — 합리적 분기).

---

## 권한 모델(Simple Role + 소유자 검사) 필수 요소

| 요구 | 존재 |
|------|------|
| `user.role` enum 컬럼 | ✅ |
| 모든 리소스 테이블에 `owner_id` | ✅ schedule / memo / tag / attachment 전부 |
| 조인 테이블(schedule_memo_link / schedule_tag / memo_tag)의 owner_id | ❌ 없음 — **단, 02에 "양쪽 리소스가 동일 owner_id를 가지는 것으로 간접 강제(애플리케이션 레벨 검사)" 명시되어 있어 설계적 결정으로 수용 가능** |
| 역할 목록 "일반 사용자 1종" | ✅ role 값 `USER` 단일 |

---

## 수치

- 도메인 커버율: **8/8 (100%)**
- 행위 데이터 커버율: **33/33 (100%)**
- AI 추가 의심: **0개**
- 누락 FK: 0개
- 상태 컬럼 누락: 0개
- PK 전략 편차: 0개

---

## 관찰 사항 (경미, 차단 요소 아님)

1. **attachment 다형 참조**: DB FK 없이 target_type + target_id 조합. 앱 레벨 검증 의존. 01 F011 범위에선 수용 가능하나, `/session4` 이후 orphan 방지 전략(대상 리소스 삭제 시 첨부 정리)을 MODULE_SPEC에 못박을 것.
2. **schedule_memo_link CASCADE 미확정**: "ON DELETE CASCADE 또는 앱 레벨 삭제 중 선택은 /session4 이후 결정"로 명시됨 — 진행 허용.
3. **tag.depth 중복 저장**: parent_id 체인으로 도출 가능하지만 조회 성능/검증 단순화 목적. 허용.
4. **schedule start_at ≤ end_at**: DB CHECK 제약 없고 앱 검증에만 의존 — H2 현황 고려 시 허용.
5. **조인 테이블 owner_id 미포함**: 간접 강제 방침이 02와 03에 모두 명시 — 설계적 일관성 유지. 다만 `/session11`에서 교차 소유자 접근 차단 쿼리(검증 JOIN)가 MODULE_SPEC에 반영되어야 함.

위 5건 모두 03 단계 결손이 아니라 **후속 세션에서 마무리할 항목** — 03은 그 책임을 명시적으로 이후 단계로 넘겨놓음.

---

## 판단

✅ **통과**

사유: 02의 8개 도메인과 모든 행위별 필요 데이터가 ERD에 대응되고, 도메인에 없는 AI 추가 테이블이 0개이며, Simple Role + 소유자 검사 권한 모델의 필수 요소(`user.role`, 모든 리소스에 `owner_id`)가 완비됨. FK 방향·상태 컬럼·PK 전략 모두 일관적이며, 검색/알림의 "테이블 없음" 결정이 01 요구사항과 명시적으로 근거를 맞춤. 다형 참조·CASCADE·조인 테이블 owner_id 등은 03 범위를 벗어난 후속 세션 과제로 명시적으로 이월되어 있어 단계별 책임 경계가 분명함.
