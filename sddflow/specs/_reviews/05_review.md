# 리뷰: 05_공용_인터페이스_명세.md
- 일시: 2026-04-20
- 기준: 04_도메인_분리.md, 01_요구사항명세서.md

## 의존 → 인터페이스 매핑

04 "의존하는 모듈" 전부 추출.

| 호출 모듈 | 대상 모듈 | 인터페이스 | 상태 |
|-----------|----------|-----------|------|
| 일정 | 사용자/인증 | `CurrentUser` | ✅ |
| 메모 | 사용자/인증 | `CurrentUser` | ✅ |
| 연결 | 사용자/인증 | `CurrentUser` | ✅ |
| 연결 | 일정 | `ScheduleReader` | ✅ |
| 연결 | 메모 | `MemoReader` | ✅ |
| 태그 | 사용자/인증 | `CurrentUser` | ✅ |
| 태그 | 일정 | `ScheduleReader` | ✅ |
| 태그 | 메모 | `MemoReader` | ✅ |
| 첨부 | 사용자/인증 | `CurrentUser` | ✅ |
| 첨부 | 일정 | `ScheduleReader` | ✅ |
| 첨부 | 메모 | `MemoReader` | ✅ |
| 검색 | 사용자/인증 | `CurrentUser` | ✅ |
| 검색 | 일정 | `ScheduleReader` (search) | ✅ |
| 검색 | 메모 | `MemoReader` (search) | ✅ |
| 검색 | 태그 | `TagReader` | ✅ |
| 알림 | 사용자/인증 | `CurrentUser` | ✅ |
| 알림 | 일정 | `ScheduleReader` (findUpcoming) | ✅ |
| 알림 | 연결 | `LinkReader` | ✅ |
| 알림 | 메모 | `MemoReader` | ✅ |
| 연결/태그/첨부/알림 | 일정(삭제 이벤트) | `ResourceDeletedEvent(SCHEDULE)` | ✅ |
| 연결/태그/첨부 | 메모(삭제 이벤트) | `ResourceDeletedEvent(MEMO)` | ✅ |

- 19개 일반 의존 + 2개 이벤트 구독 = 21건, 전부 인터페이스/이벤트로 커버됨.

## 요구사항 명세 교차 호출 커버

01의 "~하면 ~에게 ~한다" 패턴 추출.

| 행위(근거) | 인터페이스 | 상태 |
|-----------|-----------|------|
| F001: 로그인 후 JWT로 요청 식별 | `CurrentUser` | ✅ |
| F002: 일정 CRUD는 본인 소유만 | `CurrentUser` (소유자 비교 근거) | ✅ |
| F002: 일정 삭제 시 연결 링크 끊음 | `ResourceDeletedEvent(SCHEDULE)` 구독 → 연결 모듈 | ✅ |
| F003: 메모 CRUD는 본인 소유만 | `CurrentUser` | ✅ |
| F003: 메모 삭제 시 연결 링크 끊음 | `ResourceDeletedEvent(MEMO)` 구독 → 연결 모듈 | ✅ |
| F004: 일정에 메모 붙이기 (존재 검증) | `ScheduleReader.existsByIdAndOwner`, `MemoReader.existsByIdAndOwner` | ✅ |
| F005: 메모에서 일정 만들 때 양방향 연결 | 연결 모듈 자체 행위, `ScheduleReader`/`MemoReader` 존재 검증 | ✅ |
| F006: 일정+메모 통합 검색 | `ScheduleReader.search`, `MemoReader.search`, `TagReader.findByIds` | ✅ |
| F007: 알림 — 시작 N분 전 일정 스캔 | `ScheduleReader.findUpcoming` | ✅ |
| F007: 알림 페이로드에 연결된 메모 요약 | `LinkReader.findMemoIdsByScheduleId` + `MemoReader.findSummariesByIds` | ✅ |
| F008: 반복 일정 — 일정 모듈 내부 (교차 호출 없음) | — | ✅ (교차 없음) |
| F009: 태그 부여 시 일정/메모 존재 검증 | `ScheduleReader.existsByIdAndOwner`, `MemoReader.existsByIdAndOwner` | ✅ |
| F009: 태그 삭제 시 조인 정리 | `ResourceDeletedEvent` 구독 (태그는 구독자이므로 자신이 처리) | ✅ |
| F010: 체크리스트 — 메모 본문 마크다운 (교차 호출 없음) | — | ✅ (교차 없음) |
| F011: 첨부 업로드 시 대상 존재 검증 | `ScheduleReader`/`MemoReader.existsByIdAndOwner` | ✅ |
| F011: 일정/메모 삭제 시 첨부 함께 삭제 | `ResourceDeletedEvent` 구독 → 첨부 모듈 | ✅ |

- 전부 커버됨.

## 품질 체크

| 인터페이스 | 제네릭/도메인 DTO | Stub 정의 | Object/Map<String,Object> |
|-----------|------|------|------|
| `CurrentUser` | Long/String/UserRole enum | ✅ | 없음 |
| `ScheduleReader` | `Optional<ScheduleSummary>`, `List<ScheduleSummary>`, `ScheduleSearchQuery`, `List<ScheduleTrigger>` | ✅ | 없음 |
| `MemoReader` | `Optional<MemoSummary>`, `List<MemoSummary>`, `MemoSearchQuery` | ✅ | 없음 |
| `TagReader` | `List<TagSummary>`, boolean | ✅ | 없음 |
| `LinkReader` | `List<Long>` (원시 리스트만 — 헌법 §DTO 불필요 추가 금지) | ✅ | 없음 |
| `ResourceDeletedEvent` | `ResourceType` enum, Long, LocalDateTime | — (POJO, stub 불필요) | 없음 |

- 전 인터페이스 제네릭/도메인 DTO 적용. `Object`, `Map<String,Object>` 0건.

## AI 추가 의심 (기준에 근거 없는 것)

| 항목 | 상태 |
|------|------|
| `CurrentUser.getLoginId()` | ⚠️ 경미 — 04/01에 명시적 요구 없음. 일반적으로 로그인 사용자명 표시 등에 쓰이나 01의 기능 중 `login_id`를 다른 모듈에서 읽어야 하는 명시 요구 없음. **판단: 허용** — 03의 `user.login_id`가 실존하고 향후 표시 데이터 명세(10)에서 요구될 가능성 높음. 리스크 경미. |
| `CurrentUser.isAuthenticated()` | ⚠️ 경미 — SSE 연결 시작 체크용 주석 있음. F007 전제조건 "SSE 연결이 열려있어야 함"으로부터 역산 가능. **허용**. |
| `ScheduleSummary.location` | ✅ 01 F002 입력 항목, 06 검색에서 필요 |
| `MemoSummary.bodyExcerpt` | ✅ 01 F007 "연결된 메모 함께 표시" + F006 검색 결과 렌더링 근거 |
| `MemoSummary.updatedAt` | ⚠️ 경미 — 01 F003 "메모 목록 최상단에 반영(최근순)" 근거로 해석 가능. **허용**. |

- 모두 경미. 명백히 AI가 추가한 기준 없는 필드 0건.

## 권한 체크 위치 검증

| 체크 항목 | 05 기재 | 판단 |
|----------|--------|------|
| 단일 위치 확정? | "Controller 애노테이션(@PreAuthorize)" 단일값 명시 | ✅ |
| 소유자/조직 검사 위치가 Service? | "Service 계층(리소스 조회 직후, owner_id == CurrentUser.getId())" 명시 | ✅ |
| 근거 기재? | "기본값. Simple Role + 소유자 검사에 부합" | ✅ |

## 인터페이스 배치 규약

- `common.api` 또는 `common.contract` 패키지 제안 (15 법률에서 확정 예정)
- `common.interface`는 Java 예약어로 금지 — 05에 명시적으로 기재됨 ✅
- Stub은 `@Profile("local")` 명시 ✅

## 수치
- 의존 커버율: 21/21 (100%)
- 교차 호출 커버율: 01의 교차 호출 관련 행위 14건 / 14건 (100%)
- 제네릭 적용률: 5/5 인터페이스
- Object/Map 사용: 0건
- AI 추가 필드 (경미): 3건 모두 허용 범위
- 권한 체크 위치 확정: ✅ Controller 애노테이션 + Service 소유자 비교

## 판단
✅ 다음 진행 가능

### 후속 확인 필요 (리뷰 메모)
1. `TagReader.findByIds`의 "본인 소유 태그만 반환" 필터가 현재 시그니처에 ownerId가 없음 → 검색 모듈이 태그 필터 요청 시 본인 태그인지 검증이 애매. /session11에서 명확히 하거나 `TagReader.findByIdsForOwner(List<Long>, Long)` 형태 고려 필요. **경미** — 현재는 `existsByIdAndOwner`로 우회 가능.
2. 소유자 동일성 검증의 책임 주체(호출자 vs 구현체)가 05에 명시되지 않음. `existsByIdAndOwner` 제공은 있지만 "호출자가 반드시 이 메서드를 통해 검증해야 한다"는 문구가 없음. /session6(공통 구조)에서 애노테이션이나 공통 서비스로 강제할 수 있는지 검토 권장.
3. 04 리뷰의 경미 메모 3·4 (CASCADE 결정, "연결" 모듈 네이밍)는 05 범위 외 → 각각 /session14, /session16에서 해소 예정.
