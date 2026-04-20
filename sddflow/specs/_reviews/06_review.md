# 리뷰: 06_공통_구조_설계서.md
- 일시: 2026-04-20
- 기준: 05_공용_인터페이스_명세.md

## DTO 포함 여부

05의 인터페이스가 주고받는 DTO/enum이 06의 공통 구조에서 적절히 수용되는지 점검.

| DTO/enum | 05 정의 | 06 처리 | 포함? |
|----------|--------|--------|-------|
| `ScheduleSummary` | 05 §ScheduleReader | 모듈 내부 DTO. 공통 봉투 `ApiResponse<ScheduleSummary>` 적용 가능 | ✅ |
| `ScheduleSearchQuery` | 05 §ScheduleReader | 입력 DTO. 공통 페이징과 결합해 `PagedResponse<ScheduleSummary>`로 반환 가능 | ✅ |
| `ScheduleTrigger` | 05 §ScheduleReader | 알림 내부 반환 DTO (외부 노출 아님) | ✅ |
| `MemoSummary` | 05 §MemoReader | 동일 패턴 | ✅ |
| `MemoSearchQuery` | 05 §MemoReader | 동일 패턴 | ✅ |
| `TagSummary` | 05 §TagReader | 동일 패턴 | ✅ |
| `UserRole` enum | 05 §CurrentUser | 공용 enum `UserRole` (`USER`)로 06 §공용 enum에 등록 | ✅ |
| `ResourceType` enum | 05 §ResourceDeletedEvent | 공용 enum `ResourceType` (`SCHEDULE`,`MEMO`)로 등록 | ✅ |
| `ResourceDeletedEvent` POJO | 05 § | 06 §ApplicationEventConfig에서 `TransactionalEventListener(AFTER_COMMIT)` 발행 방식 확정 | ✅ |

- 05의 모든 DTO/enum이 06에 맞게 수용됨. 충돌 없음.

## 체크 항목

| 항목 | 상태 | 비고 |
|------|------|------|
| ApiResponse 제네릭 | ✅ | `ApiResponse<T>` 정의, `data: T` 제네릭 필드. `Object` 사용 0. |
| PagedResponse 제네릭 | ✅ | `PagedResponse<T>`, `items: List<T>`. |
| 빈 목록 규약 | ✅ | `items=[]`, totalElements=0, totalPages=0, hasNext=false 명시. |
| 에러 코드 규칙 | ✅ | 형식 `{모듈접두사}-{번호}` + 9개 모듈 접두사 + 번호 대역(4000/4010/4030/4040/4090/5000) 명확. |
| BaseEntity 완전성 | ✅ | id(IDENTITY) + createdAt(@CreatedDate) + updatedAt(@LastModifiedDate) + AuditingEntityListener. 03의 "soft delete 없음" 결정 준수. created_by 제외 근거 기록. |
| 공용 enum 적절성 | ✅ | `UserRole`, `ResourceType` 2종만 등록. 모듈 내부 enum(`RepeatRule`, `LinkOrigin`, `SearchType`)은 "여기 넣지 말 것" 섹션에 배제 근거 명시. |
| Object/Map 사용 | ✅ | 06 전체에서 `Object`/`Map<String,Object>` 0건 확인. |

## 권한 공통 요소 검증

| 점검 | 06 기재 | 판단 |
|------|---------|------|
| 권한 체크 위치가 05와 동일? | Controller `@PreAuthorize("isAuthenticated()")` + Service 소유자 비교 — 05 확정값 일치 | ✅ |
| 권한 애노테이션 패턴 명시? | `@PreAuthorize("isAuthenticated()")` 기본, 커스텀 애노테이션 미도입 근거 기록 | ✅ |
| 권한 예외 클래스 정의? | `UnauthorizedException`(401), `ForbiddenException`(403), `ResourceNotFoundException`(404) 3종 + 배치 패키지 명시(공통 예외) | ✅ |
| 권한 에러 코드 포함? | `AUTH-4010`(401), `AUTH-4030`(403), `AUTH-4040`(404 소유자 불일치) 모두 에러 코드 규칙에 포함 | ✅ |
| Stub 기본 동작 명시? | "로컬은 통과, 통합 테스트는 실제 경로" + `@Profile("local")` LocalSecurityConfig + permit-all 명시 | ✅ |
| 소유자 검사 단일 위치 강제? | Service 계층 고정 + `OwnershipGuard.requireOwner(...)` 공통 헬퍼 제공 → 중복 검사 방지 | ✅ |

## 구조 요소 검증 (추가)

| 요소 | 06 기재 | 판단 |
|------|---------|------|
| GlobalExceptionHandler | `@RestControllerAdvice` 단일 진입점 + 예외→코드 매핑 표 | ✅ |
| 페이징 파라미터 | page(0-base), size(기본 20/최대 100), sort | ✅ 구체 |
| JSON 시간 포맷 | ISO-8601 + `JsonTime` 유틸 | ✅ |
| JSON 명명 규칙 | camelCase 유지 (TS/Java 일관) | ✅ 명시 |
| Swagger 설정 | `@OpenAPIDefinition` + JWT Security Scheme | ✅ |
| 도메인 이벤트 발행 방식 | `TransactionalEventListener(AFTER_COMMIT)` 동기 발행 | ✅ (트랜잭션 경계 명확) |
| PasswordHasher 공통 배치 근거 | "단일 모듈 사용이나 Spring Security 표준 Bean" 예외 근거 기록 | ✅ |

## AI 추가 의심 (기준에 근거 없는 것)

| 항목 | 판단 |
|------|------|
| `JsonTime` 유틸 | 03의 `DATETIME` + 프론트 React TS 조합에서 ISO-8601 표준화는 실무 필수. 기준 충돌 없음. 허용 |
| `PageRequestFactory` 유틸 | 06에서 처음 등장한 페이징 제한(최대 size 100)을 1곳에서 강제하기 위한 것. 기준 문제 없음 |
| `X-Request-Id` 헤더 | 내부 운영 로깅용. 01/05에 명시 없음. **경미 지적** — 필요하면 유지, 과도하면 /session11 리뷰 전에 재검토 권장 |
| `COMM` 접두사 (공통 검증) | 전역 입력 검증 에러용. 05엔 없지만 Spring `@Valid` 대응에 필수. 허용 |

- 경미 1건(X-Request-Id). 판단 영향 없음.

## 수치
- DTO 수용률: 9/9 (100%)
- 권한 공통 요소 필수 항목: 6/6 충족
- `Object`/`Map<String,Object>` 사용: 0건
- 공용에 잘못 올라온 모듈 내부 enum: 0건
- AI 추가(경미): 1건

## 판단
✅ 다음 진행 가능

### 후속 확인 필요 (리뷰 메모)
1. **X-Request-Id 헤더**가 01/05 근거 없이 추가됨 → 내부 로깅 목적이므로 제거 검토 또는 /session11 Controller 명세 시 주석으로만 남길지 확정 필요. 경미.
2. **ResourceNotFoundException의 에러 코드**가 "`{MODULE}-4040` 기본값 또는 `AUTH-4040`"으로 2가지 기재됨. 실제 사용 시 "소유자 불일치는 AUTH-4040, 순수 미존재는 {MODULE}-4040" 규칙으로 운용되어야 함. /session11에서 각 Controller의 404 케이스에 적용 시 확인 필요.
3. **LocalSecurityConfig가 permit-all**이면 `@PreAuthorize` 평가 자체가 건너뛰어짐 → 통합 테스트에서 실제 권한 경로 검증이 반드시 `@ActiveProfiles("test")`(non-local)로 수행되도록 /session12에서 점검.
