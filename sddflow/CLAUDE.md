# CLAUDE.md

# ═══════════════════════════════════════════

# 헌법 — 모든 SDD 프로젝트 공통

# ═══════════════════════════════════════════

## 명세 기반 개발 원칙

- 명세(specs/)가 유일한 기준이다. 명세에 없으면 만들지 말고 질문해라
- MODULE_SPEC에 없는 API를 추가하지 마라
- 테스트 케이스에 없는 동작을 구현하지 마라
- "있으면 좋을 것 같아서" 추가하지 마라
- 애매하면 만들지 말고 질문해라

## 모듈 격리 원칙

- 도메인 모듈끼리 직접 import 금지
- 모든 교차 의존은 공통 모듈의 인터페이스/DTO를 통해서만
- 다른 모듈의 기능이 필요하면 공통 모듈에 인터페이스를 추가해라

## 외부 의존 최소화 원칙

- 외부 시스템(SSO, 사내 SDK, 레거시 API 등)엔 **대체 불가능한 최소 책임만** 위임한다. 나머지는 내부 DB/로직으로 흡수한다
- 판단: "이거 외부 없으면 못 하나?" → 예면 위임, 아니면 내부화
- 예: SSO는 인증(사번/비번 검증)만 위임. 이름·부서·이메일 등 프로필은 내부 `user` 테이블에 보관하고 최초 로그인 시 1회 동기화
- 이유: 외부 의존 표면적 = 내부망 확인 비용 + 장애 전파 + 계약 변경 리스크
- 외부 연동의 입출력 계약은 **설계 후 역산해서 확정**한다. 세션1에서 필드를 미리 요구하지 않는다

## 타입 안전성 원칙

- 백엔드: 공용 인터페이스는 제네릭 필수, Object/Map<String, Object> 금지
- 프론트: TypeScript strict 필수, any 금지
- API 응답은 반드시 ApiResponse<T> 제네릭으로 감싼다

## 테스트 원칙

- 모든 Service에 단위 테스트, 모든 Controller에 통합 테스트
- Stub은 공통 모듈에 배치, @Profile("local")로 활성화
- Mock은 호출 횟수/인자 검증이 필요한 경우에만 사용

## 세션 관리 원칙

- 수정 3회 초과 시 SPEC 점검 후 새 세션
- 에러 수정 시 에러 로그만 보지 말고 MODULE_SPEC의 기대 동작을 기준으로 수정
- 빌드 에러를 "안 나게만" 고치지 마라. SPEC을 만족하면서 고쳐라

## 네이밍 금지 목록 (Java 예약어)

- Java 예약어를 패키지/디렉토리명으로 사용 금지. **빈 디렉토리도 금지** — javac는 .java 파일이 없으면 예약어 디렉토리를 못 잡는다. 빌드 통과 = 안전, 이 아니다.
- 자주 저지르는 실수: 인터페이스를 모으는 `interface/` 패키지, enum을 모으는 `enum/` 패키지. 둘 다 금지.

| 금지 | 권장 대안 |
|------|---------|
| `interface` | `api`, `contract`, `port` |
| `enum` | `type`, `code`, `constant` |
| `abstract` | `base` |
| `class` | (다른 단어 사용) |
| `default` | `defaults`, `preset` |
| `static` | `util` |
| `import` | (다른 단어 사용) |
| `package` | (다른 단어 사용) |

- 전체 예약어 목록: abstract, assert, boolean, break, byte, case, catch, char, class, const, continue, default, do, double, else, enum, extends, final, finally, float, for, goto, if, implements, import, instanceof, int, interface, long, native, new, package, private, protected, public, return, short, static, strictfp, super, switch, synchronized, this, throw, throws, transient, try, void, volatile, while
- 프로젝트 시작 시 `/session15`에서 위 권장 대안 중 하나를 선택해 법률의 "패키지 구조"에 확정한다. 이후 모든 `/build-*`와 `/implement-*`는 이 확정값만 따른다.

## Swagger/OpenAPI

- 모든 Controller에 Swagger 어노테이션 필수
- @Operation, @Parameter, @ApiResponse, @Schema

# ═══════════════════════════════════════════

# 법률 — 이 프로젝트 전용

# ═══════════════════════════════════════════

## 프로젝트 개요

- 프로젝트명: 캘린더
- 한 줄 설명: 일정에 메모를, 메모에 일정을 양방향으로 연결해 관리하는 앱
- 유형: 신규 개발

## 명세 위치

- 모든 명세: specs/ 폴더 (01_요구사항명세서.md ~ 13_화면_API_매핑.md)
- 모듈별 명세: specs/modules/ 폴더 ({모듈}_SPEC.md, {도메인}_FRONT_SPEC.md — /session16에서 생성)
- 리뷰: specs/_reviews/ ({번호}_review.md)
- 프론트 명세: 07_화면목록, 08_디자인_시스템_명세서, 09_화면_상세_명세서, 10_표시_데이터_명세, 13_화면_API_매핑

## 기술 스택

- 백엔드: Java 17+ / Spring Boot 3.x (JPA, Spring Security, Spring Events, SSE)
- DB: H2 2.x (개발용)
- 프론트: React 18+ + TypeScript (strict), Vite (예상), React Router
- 인증: JWT (HS256, `Authorization: Bearer` 헤더)
- 권한 모델: Simple Role + 소유자 검사 (일반 사용자 1종 `USER`)
- 운영 환경: 내부망 / 단일 서버 / 외부 API 불가
- 빌드: Gradle (Java), npm/pnpm (프론트)

## 확정 범위 — 이 밖은 절대 만들지 마라

### MVP 기능 (01 필수)
- F001 로그인
- F002 일정 생성·조회·수정·삭제
- F003 메모 생성·조회·수정·삭제
- F004 일정에 메모 붙이기
- F005 메모에서 일정 만들기
- F006 통합 검색
- F007 일정 시작 알림 (SSE)

### MVP 후순위 (01 후순위)
- F008 일정 반복
- F009 태그 (계층 3단계)
- F010 체크리스트 (메모 본문 인라인)
- F011 첨부 파일

### 명시적 제외 (01)
- 구글 외부 캘린더 연동, 공유·협업, 모바일 앱, 음성/AI, 타임존 세밀 처리, 로그아웃 전용 서버 API (JWT stateless)

### 모듈 목록 (04 기준)
- 사용자/인증 (`user`)
- 일정 (`schedule`)
- 메모 (`memo`)
- 연결 — `schedule-memo-link` (schedule_memo_link)
- 태그 (`tag` + `schedule_tag` + `memo_tag`)
- 첨부 (`attachment`)
- 검색 (소유 테이블 없음)
- 알림 (소유 테이블 없음)

## 코드 규칙

### 패키지 구조

- 기본: `calendar` (도메인형)
- 공통: `calendar.common`
- 공통 모듈 서브패키지:
  - 공용 인터페이스: `api`          (interface 금지)
  - 공용 enum:      `type`         (enum 금지)
  - 공용 DTO:       `dto`
  - 공용 유틸:      `util`         (static 금지)
  - 공용 설정:      `config`
  - 공용 예외:      `exception`
  - 도메인 이벤트:   `event`
  - Stub 구현체:    `stub` (`@Profile("local")`)
  - BaseEntity:     `entity`
- 도메인 모듈 서브패키지: `controller`, `service`, `repository`, `entity`, `dto`

### 코드 컨벤션

- 파라미터/변수 네이밍: camelCase
- JSON 필드: camelCase (요청·응답 공통, Jackson 설정 — 06)
- DB 컬럼: snake_case (JPA 매핑으로 camelCase ↔ snake_case 자동 변환)
- 날짜 포맷: ISO-8601 로컬 `yyyy-MM-dd'T'HH:mm:ss` (타임존 제외 — 01 MVP 제외 범위)
- 날짜 파라미터(쿼리): `yyyy-MM-dd`
- enum 값: 대문자 문자열 (예: `NONE`/`DAILY`/`WEEKLY`/`MONTHLY`, `SCHEDULE`/`MEMO`, `ALL`/`SCHEDULE`/`MEMO`)
- API 경로: `/api/{domain}/{id}[/{sub-resource}]`, kebab-case (예: `/linked-memos`)
- 정렬 파라미터: `sort=field,asc|desc`

### 응답 형식

- 모든 API 응답: `ApiResponse<T>` (06 §ApiResponse)
- 페이징 응답: `ApiResponse<PagedResponse<T>>` (06 §PagedResponse)
- 빈 목록: `[]` (null 금지)
- 204(DELETE 성공): 본문 없음
- 에러: `ApiResponse.fail(ErrorBody)` + HTTP 상태 코드

### 페이징 파라미터

- `page`: int, 0-base, 기본 `0`
- `size`: int, 기본 `20`, 최대 `100`
- 초과 시 `COMM-4000`

### 범위 제한

- `GET /api/schedules` 기간: 최대 90일 (반복 전개 폭주 방지). 초과 시 `COMM-4000`.
- 메모 body 길이: 최대 102400자. 초과 시 `MEMO-4000`.
- 첨부: 파일당 ≤ 10MB, 건당 ≤ 5개, 확장자 jpg/jpeg/png/gif/pdf.
- 태그 depth: 1~3. 4단계 생성 시 `TAG-4000`.

### 에러 코드 체계

- 형식: `{MODULE}-{HHNN}` — `HH`=HTTP 상태 상위(40/41/43/44/49/50), `NN`=도메인 순번
- 모듈 접두사: `AUTH`, `COMM`, `USER`, `SCHED`, `MEMO`, `LINK`, `TAG`, `FILE`, `SRCH` (NOTI는 정의되어 있으나 현재 미사용 — AUTH-4010으로 흡수)
- 예시:
  - `AUTH-4010` 401 미인증 (토큰 없음/만료)
  - `AUTH-4040` 404 소유자 불일치 (존재 숨김)
  - `SCHED-4000` 400 일정 유효성 (startAt > endAt)
  - `SCHED-4040` 404 일정 미존재/소유 불일치
  - `FILE-4000` 400 파일 규칙 위반 (확장자/용량/개수)
  - `TAG-4090` 409 자식 태그 존재 (삭제 시)
  - `LINK-4030` 403 일정·메모 소유자 불일치 (방어적)

### 권한 체크 규칙

- 권한 모델: **Simple Role + 소유자 검사** (PROJECT_CONTEXT §2)
- 체크 위치: **Controller 애노테이션** (05/06 확정)
- 역할 검사 패턴: `@PreAuthorize("isAuthenticated()")` (단일 역할 `USER`이므로 `hasRole` 사실상 미사용)
- 커스텀 애노테이션: 도입하지 않음 (06 결정)
- 소유자/조직 검사 위치: **Service 계층** — 리소스 조회 직후 `OwnershipGuard.requireOwner(resource.getOwnerId(), currentUser.getId())` 1줄 호출. 불일치 시 `ResourceNotFoundException` → 404.
- Stub 동작: `@Profile("local")` — `CurrentUser` stub이 고정 `id=1L, role=USER` 반환 + `LocalSecurityConfig`가 `permit-all`. **통합 테스트(`@ActiveProfiles("test")`)는 실제 JWT 경로 사용**.
- 권한 에러 코드: `AUTH-4010` (401), `AUTH-4030` (403, 실질 미사용), `AUTH-4040` (404 소유자 불일치)
- 권한 예외: `UnauthorizedException`, `ForbiddenException`, `ResourceNotFoundException` (공통 예외는 `calendar.common.exception`)
- 금지: Controller/Service/Repository 중 여러 계층에서 권한 검사 중복. 소유자 검사는 Service 단 1곳.

### 도메인 이벤트

- `ResourceDeletedEvent(resourceType: SCHEDULE|MEMO, resourceId, ownerId, occurredAt)`
- 발행: 일정·메모 모듈 삭제 트랜잭션 커밋 후
- 구독: `@TransactionalEventListener(phase=AFTER_COMMIT)` — 연결/태그/첨부/알림 모듈
- 동기 발행 (비동기 미사용 — 즉시 반영 요구 F004/F007)
- 패키지: `calendar.common.event`

### 검색

- `schedule.title/location`, `memo.title/body`: **LIKE 기반** (H2 2.x FULLTEXT 제한적). 데이터 증가 시 재검토.
- 통합 정렬키: `sortAt` = 일정 `start_at` / 메모 `updated_at`. `DESC` 기본.

### 빌드 레벨 의존성 강제

- Stub 구현: 공통 모듈 `calendar.common.stub.*` 아래에만 배치. `@Profile("local")` 고정.
- 도메인 모듈 간 직접 import **금지** — 컴파일 레벨 강제는 `archunit` 테스트(/build-infra에서 도입) 권장.
- 인증: 모든 API는 기본 `@PreAuthorize("isAuthenticated()")` 보호. `POST /api/auth/login`만 예외(`permitAll`).
- SSE 엔드포인트는 인증 필수 + 프로파일 `local`에서는 Mock 서버 대체.

### 데이터 삭제 정책 (/session14 §FK 삭제 정책)

- `user`를 참조하는 리소스는 `ON DELETE RESTRICT` (사용자 삭제 기능 없음 — 01 범위).
- 매핑 테이블(schedule_memo_link, schedule_tag, memo_tag)·첨부는 **앱 레벨 이벤트 구독**으로 정리 (DB CASCADE 미사용).
- `tag.parent_id`는 `ON DELETE RESTRICT` — 자식 태그 존재 시 409 `TAG-4090`.

### 프론트 규칙

- TypeScript `strict: true`, `any` 금지
- API 응답은 `ApiResponse<T>` 제네릭 타입으로 래핑 (공유 타입 파일)
- 상태 관리: 로컬 state + Context 필요 시만. Redux 도입 금지(과도)
- 라우팅: React Router v6+. 보호 라우트는 전역 가드(JWT 유효성)
- UI: 08 디자인 시스템 토큰만 사용. shadcn/ui 또는 Radix UI 기반(`/build-design-system`에서 확정)

### 확정된 기본값 / 운영 방어값

| 항목 | 값 |
|------|----|
| JWT 만료 | 3600초 (1시간) |
| 페이지 기본 size | 20 |
| 페이지 최대 size | 100 |
| 일정 조회 기간 최대 | 90일 |
| 메모 body 최대 | 102400자 |
| 첨부 파일 최대 | 10MB / 5개 / 파일당 |
| 알림 기본 분 | 30분 전 |
| Toast 표시 시간 | 5000ms (알림 토스트 8000ms) |

### 외부 연동 어댑터 규칙

- 필수 외부 연동: **없음** (01 전 기능 "외부 연동: 없음" + PROJECT_CONTEXT "외부 API 호출: 불가").
- 따라서 외부 어댑터 포트 미존재. 향후 요구 추가 시 `calendar.common.api` 아래 포트 추가 + Stub 3종(`stub-success`/`stub-failure`/`stub-timeout`) 생성 후 실제 구현은 내부망에서 사람이 붙인다.

### Swagger/OpenAPI

- 모든 Controller에 `@Operation`, `@Parameter`, `@ApiResponse`, `@Schema` 필수 (헌법)
- `calendar.common.config.SwaggerConfig`에 `@OpenAPIDefinition` + JWT Security Scheme
- `/swagger-ui`, `/v3/api-docs`는 `local`/`dev` 프로파일에서만 노출
