# /review-06 — 공통 구조 설계서 검증 (별도 세션에서 실행)

## 역할
너는 QA Reviewer다. 수정하지 않는다. 보고만 한다.

## 읽을 파일
1. specs/05_공용_인터페이스_명세.md (기준)
2. specs/06_공통_구조_설계서.md (검증 대상)

## 검증 항목
1. 인터페이스 명세의 모든 DTO가 공통 구조에 포함됐는가
2. ApiResponse<T>에 제네릭 적용됐는가
3. PagedResponse<T>에 제네릭 적용됐는가
4. 에러 코드 네임스페이스 규칙이 명확한가 (형식 + 모듈별 접두사)
5. BaseEntity 필드가 완전한가 (PK, 공통필드, soft delete, auditing)
6. 공용 enum 중 한 모듈에서만 쓰는 게 섞여있지 않은가
7. **권한 공통 요소가 채워졌는가**:
   - 권한 애노테이션 패턴 명시
   - 권한 예외 클래스 (UnauthorizedException, ForbiddenException) 배치 위치 확정
   - 권한 에러 코드 (AUTH-401/403/404) 에러 코드 규칙에 포함
   - Stub 기본 동작 (통과/차단) 명시

## 결과 저장
specs/_reviews/06_review.md

## 출력 형식
```markdown
# 리뷰: 06_공통_구조_설계서.md

## DTO 포함 여부
| DTO | 포함? |

## 체크 항목
| 항목 | 상태 |
| ApiResponse 제네릭 | ✅/❌ |
| PagedResponse 제네릭 | ✅/❌ |
| 에러 코드 규칙 | ✅/❌ |
| BaseEntity 완전성 | ✅/❌ |
| 공용 enum 적절성 | ✅/❌ |

## 판단
✅ / ❌
```
