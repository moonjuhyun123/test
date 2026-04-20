# /status — 프로젝트 진행 상태 확인

## 역할
너는 Scrum Master다. 현재 진행 상태를 파악하고 다음 할 일을 알려준다.

## 입력
1. CLAUDE.md 확인
2. specs/ 폴더 전체 스캔
3. specs/modules/ 폴더 스캔
4. specs/_reviews/ 폴더 스캔
5. .claude/commands/ 스캔
6. src/ 폴더 스캔 (있으면)

## 할 일

### 1. 초기 설정 확인
| 항목 | 확인 방법 | 상태 |
|------|----------|------|
| CLAUDE.md | 파일 존재 | ✅ / ❌ |
| PROJECT_CONTEXT.md | specs/PROJECT_CONTEXT.md 존재 | ✅ / ❌ |
| 디렉토리 구조 | specs/, specs/modules/, specs/_reviews/ 존재 | ✅ / ❌ |

### 2. Phase 1: 기반 설계
| 파일 | 세션 | 산출물 | 리뷰 | 상태 |
|------|------|--------|------|------|
| 01_요구사항명세서.md | /session1 | ✅/❌ | _reviews/01_review.md ✅/❌ | |
| 02_도메인_분류.md | /session2 | ✅/❌ | _reviews/02_review.md ✅/❌ | |
| 03_ERD.md | /session3 | ✅/❌ | _reviews/03_review.md ✅/❌ | |
| 04_도메인_분리.md | /session4 | ✅/❌ | _reviews/04_review.md ✅/❌ | |

### 3. Phase 2: 모듈 계약
| 파일 | 세션 | 산출물 | 리뷰 | 상태 |
|------|------|--------|------|------|
| 05_공용_인터페이스_명세.md | /session5 | ✅/❌ | _reviews/05_review.md ✅/❌ | |
| 06_공통_구조_설계서.md | /session6 | ✅/❌ | _reviews/06_review.md ✅/❌ | |

### 4. Phase 3: 화면 기반 설계
| 파일 | 세션 | 산출물 | 리뷰 | 상태 |
|------|------|--------|------|------|
| 07_화면목록.md | /session7 | ✅/❌ | _reviews/07_review.md ✅/❌ | |
| 08_디자인_시스템_명세서.md | /session8 | ✅/❌ | _reviews/08_review.md ✅/❌ | |

### 5. Phase 4: 화면-데이터 동시 설계
| 파일 | 세션 | 산출물 | 리뷰 | 상태 |
|------|------|--------|------|------|
| 09_화면_상세_명세서.md | /session9 | ✅/❌ | _reviews/09_review.md ✅/❌ | |
| 10_표시_데이터_명세.md | /session10 | ✅/❌ | _reviews/10_review.md ✅/❌ | |

### 6. Phase 5: 데이터 기반 API 설계
| 파일 | 세션 | 산출물 | 리뷰 | 상태 |
|------|------|--------|------|------|
| 11_API_스펙.md | /session11 | ✅/❌ | _reviews/11_review.md ✅/❌ | |
| 12_테스트_케이스.md | /session12 | ✅/❌ | _reviews/12_review.md ✅/❌ | |

### 7. Phase 6: 매핑 + 확정
| 파일 | 세션 | 산출물 | 리뷰 | 상태 |
|------|------|--------|------|------|
| 13_화면_API_매핑.md | /session13 | ✅/❌ | _reviews/13_review.md ✅/❌ | |
| 03_ERD.md (최종) | /session14 | ✅/❌ | _reviews/14_review.md ✅/❌ | |
| CLAUDE.md 법률 | /session15 | ✅/❌ | _reviews/15_review.md ✅/❌ | |
| MODULE_SPEC + FRONT_SPEC | /session16 | ✅/❌ | _reviews/16_review.md ✅/❌ | |

### 8. 회고 확인
| 항목 | 상태 |
|------|------|
| 명세 회고 | _reviews/retro_spec_*.md ✅/❌ |

### 9. ═══ 개발 시작 게이트 ═══
아래 5개 조건을 **모두** 확인한다:

| 게이트 조건 | 확인 방법 | 상태 |
|------------|----------|------|
| MODULE_SPEC 완료 | specs/modules/*_SPEC.md 존재 + 16_review 통과 | ✅/❌ |
| FRONT_SPEC 완료 | specs/modules/*_FRONT_SPEC.md 존재 + 16_review 통과 | ✅/❌ |
| 표시 데이터 명세 완료 | 10_표시_데이터_명세 + 10_review 통과 | ✅/❌ |
| 화면-API 매핑 완료 | 13_화면_API_매핑 + 13_review 통과 | ✅/❌ |
| 교차 정합성 | /validate 통과 (또는 마지막 실행 결과 확인) | ✅/❌ |

**게이트 미충족 시**: "❌ 개발 시작 게이트 미충족: {미충족 항목 목록}" 출력

### 10. 코드 단계 확인
| 항목 | 명령어 | 상태 |
|------|--------|------|
| 프로젝트 뼈대 | /build-skeleton | src/{common}/ + build 파일 ✅/❌ |
| 인터페이스 + Stub | /build-interfaces | 인터페이스/Stub 코드 ✅/❌ |
| 유틸 + 설정 + 테스트 | /build-infra | 전체 테스트 통과 ✅/❌ |
| 디자인 시스템 코드 | /build-design-system | 공통 컴포넌트 코드 ✅/❌ |
| 모듈별 명령어 생성 | /generate-module-commands | implement-{모듈}.md ✅/❌ |
| 통합 순서 확인 | /integration-order | ✅ 확인됨 / ❌ 미확인 |

### 11. 모듈별 구현 상태
MODULE_SPEC이 있는 각 모듈에 대해:
| 모듈 | 명령어 존재 | 코드 존재 | 테스트 | 상태 |
|------|-----------|----------|--------|------|

### 12. 프론트 도메인별 구현 상태
FRONT_SPEC이 있는 각 도메인에 대해:
| 도메인 | FRONT_SPEC | 코드 존재 | Mock 동작 | 상태 |
|--------|-----------|----------|----------|------|

### 13. 통합 상태
| 모듈 | Stub 교체 | 회귀 테스트 | 상태 |
|------|----------|-----------|------|

### 14. 프론트 통합 상태
| 도메인 | Mock→실제API | 상태 확인 | 상태 |
|--------|-------------|----------|------|

### 15. 회고 확인
| 항목 | 상태 |
|------|------|
| 공통 모듈 회고 | _reviews/retro_build_*.md ✅/❌ |
| 구현 회고 | _reviews/retro_impl_*.md ✅/❌ |

---

## 다음 할 일 판단

위 상태를 기반으로 다음에 실행할 명령어를 **하나만** 알려줘라.

판단 규칙 (위에서부터 첫 번째 ❌에서 멈춤):
1. CLAUDE.md 없음 → "다음: /session0"
2. PROJECT_CONTEXT.md 없음 → "다음: /session0"
3. 01 없음 → "다음: /session1"
4. 01 있고 01_review 없음 → "다음: /review-01 (별도 세션에서)"
5. 01_review 있고 02 없음 → "다음: /session2"
6. 02 있고 02_review 없음 → "다음: /review-02 (별도 세션에서)"
7. 02_review 있고 03 없음 → "다음: /session3"
8. 03 있고 03_review 없음 → "다음: /review-03 (별도 세션에서)"
9. 03_review 있고 04 없음 → "다음: /session4"
10. 04 있고 04_review 없음 → "다음: /review-04 (별도 세션에서)"
11. 04_review 있고 05 없음 → "다음: /session5"
12. 05 있고 05_review 없음 → "다음: /review-05 (별도 세션에서)"
13. 05_review 있고 06 없음 → "다음: /session6"
14. 06 있고 06_review 없음 → "다음: /review-06 (별도 세션에서)"
15. 06_review 있고 07 없음 → "다음: /session7 (화면 목록)"
16. 07 있고 07_review 없음 → "다음: /review-07 (별도 세션에서)"
17. 07_review 있고 08 없음 → "다음: /session8 (디자인 시스템)"
18. 08 있고 08_review 없음 → "다음: /review-08 (별도 세션에서)"
19. 08_review 있고 09 없음 → "다음: /session9 (화면 상세)"
20. 09 있고 09_review 없음 → "다음: /review-09 (별도 세션에서)"
21. 09_review 있고 10 없음 → "다음: /session10 (표시 데이터)"
22. 10 있고 10_review 없음 → "다음: /review-10 (별도 세션에서)"
23. 10_review 있고 11 없음 → "다음: /session11 (API 설계)"
24. 11 있고 11_review 없음 → "다음: /review-11 (별도 세션에서)"
25. 11_review 있고 12 없음 → "다음: /session12 (테스트 케이스)"
26. 12 있고 12_review 없음 → "다음: /review-12 (별도 세션에서)"
27. 12_review 있고 13 없음 → "다음: /session13 (화면-API 매핑)"
28. 13 있고 13_review 없음 → "다음: /review-13 (별도 세션에서)"
29. 13_review 있고 ERD최종 안 됨 → "다음: /session14 (ERD 최종)"
30. 14_review 있고 법률 안 채워짐 → "다음: /session15 (CLAUDE.md 법률)"
31. 15_review 있고 MODULE_SPEC/FRONT_SPEC 없음 → "다음: /session16"
32. 16_review 있고 retro_spec 없음 → "다음: /retro-spec"
33. ═══ 개발 시작 게이트 체크 ═══
34. 게이트 5개 조건 미충족 → "❌ 개발 시작 게이트 미충족: {목록}"
35. 게이트 통과, skeleton 없음 → "다음: /build-skeleton"
36. skeleton 있고 인터페이스 없음 → "다음: /build-interfaces"
37. 인터페이스 있고 테스트 미통과 → "다음: /build-infra"
38. infra 완료, 디자인 시스템 없음 → "다음: /build-design-system"
39. 빌드 완료, 모듈별 명령어 없음 → "다음: /generate-module-commands"
40. 모듈별 명령어 있고 통합 순서 미확인 → "다음: /integration-order"
41. 구현 안 된 백엔드 모듈 있음 → "다음: /implement-{Stub 가장 적은 미구현 모듈}"
42. 구현 안 된 프론트 도메인 있음 → "다음: /implement-front {미구현 도메인}"
43. 전부 구현됐고 retro_impl 없음 → "다음: /retro-impl"
44. 통합 안 된 백엔드 모듈 있음 → "다음: /integrate {다음 통합 대상 모듈}"
45. 통합 안 된 프론트 도메인 있음 → "다음: /integrate-front {다음 통합 대상 도메인}"
46. 전부 통합 완료 → "🎉 프로젝트 완료"

## 출력 형식
```
📊 SDD 프로젝트 상태

[초기 설정]
✅ CLAUDE.md
✅ PROJECT_CONTEXT.md

[Phase 1: 기반 설계]           [리뷰]
✅ 01_요구사항명세서.md             ✅ 01_review.md
✅ 02_도메인_분류.md            ✅ 02_review.md
✅ 03_ERD.md                   ✅ 03_review.md
❌ 04_도메인_분리.md            —

[Phase 2: 모듈 계약]           [리뷰]
❌ 05_공용_인터페이스_명세.md    —
❌ 06_공통_구조_설계서.md       —

[Phase 3: 화면 기반 설계]      [리뷰]
❌ 07_화면목록.md               —
❌ 08_디자인_시스템_명세서.md    —

[Phase 4: 화면-데이터]         [리뷰]
❌ 09_화면_상세_명세서.md       —
❌ 10_표시_데이터_명세.md       —

[Phase 5: API 설계]            [리뷰]
❌ 11_API_스펙.md              —
❌ 12_테스트_케이스.md          —

[Phase 6: 매핑 + 확정]        [리뷰]
❌ 13_화면_API_매핑.md         —
❌ ERD 최종                    —
❌ CLAUDE.md 법률              —
❌ MODULE_SPEC + FRONT_SPEC    —

[개발 시작 게이트]
❌ MODULE_SPEC
❌ FRONT_SPEC
❌ 표시 데이터 명세
❌ 화면-API 매핑
❌ 교차 정합성

[코드]
❌ 공통 모듈 (백엔드)
❌ 디자인 시스템 (프론트)
❌ 도메인 모듈
❌ 프론트 도메인

[다음 할 일]
👉 /session4 — 도메인 분리
```

## 절대 규칙
- 상태 확인만 해라. 파일을 수정하거나 생성하지 마라.
- 다음 할 일은 반드시 하나만 알려줘라 (가장 우선순위 높은 것).
- 리뷰가 안 됐으면 다음 세션으로 넘어가지 마라.
- **개발 시작 게이트를 반드시 확인해라.** 게이트 미충족 시 /build-skeleton으로 넘어가지 마라.
