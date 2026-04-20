# SDD (Spec-Driven Development) 명세 작성 프로세스

## 개요

AI 병렬 구현을 위한 명세 선행 개발 방법론.
명세가 곧 AI의 입력물이므로, 명세 품질 = 산출물 품질.

**도구**: Claude Code (CLAUDE.md 자동 인식, 파일 직접 읽기/쓰기, 빌드/테스트 직접 실행)
**명령어**: 30개+ 커스텀 슬래시 명령어 (`.claude/commands/`)
**검증**: 각 세션에 자체 검증 + 역행 규칙 내장

### 업계 용어와의 매핑

| 업계 용어 | 본 프로세스 범위 | 의미 |
|---------|----------------|------|
| **요구사항 명세 (SRS)** | 세션 1 | 사용자가 무엇을 원하는지 (what) |
| **기능명세 / 상세설계 (Functional Spec)** | 세션 2 ~ 16 | 어떻게 실현할지 분해 (how) — 도메인 → ERD → 화면 → API → 모듈 스펙 |

즉, 본 프로세스는 **요구사항 명세에서 출발해 기능명세를 구체화하는 절차**다.

### 권한 모델 전달 체인

세션0에서 확정한 권한 모델이 아래 세션들을 거치며 코드 규칙까지 자동 전파된다.

```
세션0  권한 모델 확정 (Simple/RBAC 정적·동적/계층형/소유자·조직/ABAC)
  ↓   PROJECT_CONTEXT.md
세션1  역할별 행위 수집 + (동적 RBAC면) 역할 관리 기능 포함 체크
  ↓
세션3  권한 모델별 필수 테이블 자동 추가 (role, permission, user_role, owner_id 등)
  ↓   specs/03_ERD.md
세션5  권한 체크 위치 단일 확정 (Controller 애노테이션 / Service / AOP / Gateway)
  ↓   specs/05_공용_인터페이스_명세.md
세션6  권한 공통 요소 (애노테이션 패턴 / AUTH-401·403·404 / 예외 클래스 / Stub 동작)
  ↓   specs/06_공통_구조_설계서.md
세션15 CLAUDE.md "권한 체크 규칙" 섹션 확정 → 모든 /implement-{모듈}이 참조
```

각 리뷰 세션(`/review-03`, `/review-05`, `/review-06`, `/review-15`)이 체인의 누수를 차단한다.

---

## 핵심 원칙

### 확정 vs 반복 — SDD는 워터폴이 아니다

SDD에서 선행 확정해야 하는 것은 **모듈 간 계약**뿐이다. 나머지는 만들면서 고쳐도 된다.

**🔒 선행 확정** (바꾸면 전 모듈 영향)

| 항목 | 이유 |
|------|------|
| 공용 응답 형식 (ApiResponse, PagedResponse, 에러 응답) | 모든 Controller가 의존 |
| 공용 인터페이스 시그니처 | 모듈 간 결합 지점 |
| 공용 DTO | 인터페이스와 세트 |
| 에러 코드 네임스페이스 규칙 | 전체 에러 처리 체계 |
| BaseEntity 구조 | 모든 엔티티가 상속 |
| 패키지 구조/의존 규칙 | CLAUDE.md에 명시 |

**🔄 반복 허용** (고치고 AI 다시 돌리면 됨)

| 항목 | 수정 비용 |
|------|----------|
| MODULE_SPEC 내부 API 세부 사항 | 해당 모듈만 재생성 |
| 테스트 케이스 추가/수정 | 해당 모듈만 재생성 |
| 모듈 내부 엔티티 필드 | 해당 모듈만 재생성 |
| MVP 범위 조정 | MODULE_SPEC 추가/삭제 |

> **판단 기준**: "이걸 바꾸면 다른 모듈도 고쳐야 하는가?" Yes → 확정, No → 반복 허용

### 세션 동작 원칙 — 만드는 놈 / 검증하는 놈 분리

각 세션은 **한 역할만** 수행한다. 검증은 **별도 세션**에서 다른 역할(QA)이 한다.

**세션 (만드는 역할)**:
```
1. 산출물 생성 (PM / Architect / QA 각자 역할)
2. 가벼운 자체 검증 — 숫자 한 줄 (예: "기능 18개 중 18개 배정됨")
3. 역행 규칙 — 이전 산출물과 충돌 시 "/session{N}부터 다시 실행하세요" 보고
   → 이전 산출물을 직접 수정하지 않음. 사람이 판단.
```

**리뷰 (별도 세션에서 QA)**:
```
1. 새 Claude Code 세션에서 /review-{N} 실행
2. 이전 산출물(기준)과 현재 산출물을 처음부터 fresh하게 읽음
3. 깐깐하게 대조 — 매핑률/커버율을 숫자로
4. AI가 명세에 없는 걸 추가한 것도 잡아냄
5. 검증 결과를 specs/_reviews/{번호}_review.md에 저장
```

**왜 분리하는가**:
- 역할 충돌 방지 — PM이 만들면서 QA처럼 행동하면 관점이 섞임
- 별도 세션에서 fresh하게 읽으니 "방금 만든 맥락"에 오염 안 됨
- 리뷰를 안 돌리는 선택지, 다시 돌리는 선택지가 생김

---

## Claude Code 설정

### 디렉토리 구조

```
project-root/
├── CLAUDE.md                        ← 자동 인식 (헌법 + 법률)
├── .claude/
│   ├── settings.json                ← 권한 설정
│   └── commands/                    ← 커스텀 명령어 30개
│       ├── session1~16.md           (명세 16개)
│       ├── review-01~16.md          (리뷰 16개)
│       ├── build-skeleton.md, build-interfaces.md, build-infra.md
│       ├── build-design-system.md   (프론트 디자인 시스템)
│       ├── implement.md             (백엔드 모듈 구현)
│       ├── implement-front.md       (프론트 도메인 구현)
│       ├── integrate.md             (백엔드 모듈 통합)
│       ├── integrate-front.md       (프론트 도메인 통합)
│       ├── generate-module-commands.md
│       ├── validate.md, integration-order.md
│       ├── retro-spec.md, retro-impl.md
│       └── status.md
├── specs/                           ← 명세 산출물
│   ├── 01_요구사항명세서.md ~ 13_화면API매핑.md
│   ├── modules/                     ← 모듈별 SPEC
│   │   ├── {모듈}_SPEC.md
│   │   └── {도메인}_FRONT_SPEC.md
│   └── _reviews/                    ← 리뷰 결과 (QA가 저장)
│       └── {번호}_review.md
├── src/                             ← 소스 코드 (빌드 단계~)
│   ├── {common-module}/
│   └── {모듈}/
└── docs/
```

### CLAUDE.md — 헌법 + 법률

프로젝트 루트에 두면 모든 세션에서 자동 인식.

**헌법** (모든 SDD 프로젝트 공통 — 다른 프로젝트에 그대로 복사):
- 명세 기반 원칙: 명세에 없으면 만들지 말고 질문
- 모듈 격리 원칙: 도메인 모듈 간 직접 import 금지
- 타입 안전성: 제네릭 필수, Object/any 금지
- 테스트 원칙: Stub은 공통 모듈에, Mock은 호출 검증에만
- 세션 관리: 수정 3회 초과 시 SPEC 점검 후 새 세션
- Swagger: 모든 Controller에 어노테이션 필수

**법률** (이 프로젝트 전용 — 세션 15에서 채움):
- 프로젝트 개요, 기술 스택, 확정 범위
- 패키지 구조, 코드 컨벤션, 에러 코드 체계
- 통합 디테일 (날짜 포맷, 페이징, nullable 등)

> 헌법 상세 템플릿은 부록 참조. 법률은 세션 15(`/session15`)에서 자동으로 채워진다.

### 권한 설정

`.claude/settings.json`으로 파일 수정마다 물어보지 않게 설정:

```json
{
  "permissions": {
    "allow": [
      "Read", "Write", "Edit",
      "Bash(gradle*)", "Bash(mvn*)", "Bash(npm*)",
      "Bash(git add*)", "Bash(git commit*)",
      "Bash(mkdir*)", "Bash(cp*)", "Bash(cat*)", "Bash(ls*)"
    ]
  }
}
```

---

## 전체 명령어 목록

| 분류 | 명령어 | 역할 | 실행 세션 |
|------|--------|------|----------|
| **초기화** | `/session0` | 프로젝트 초기 설정 → CLAUDE.md + PROJECT_CONTEXT.md | 최초 1회 |
| **기반 설계** | `/session1` | 인터뷰 기반 요구사항명세서 작성 | 작업 세션 |
| | `/session2` ~ `/session4` | 도메인 분류, ERD, 도메인 분리 | 작업 세션 |
| **모듈 계약** | `/session5` ~ `/session6` | 인터페이스 설계, 공통 구조 설계 | 작업 세션 |
| **화면 기반** | `/session7` | 화면 목록 + 화면 흐름도 | 작업 세션 |
| | `/session8` | 디자인 시스템 설계 | 작업 세션 |
| **화면-데이터** | `/session9` | 화면별 상세 명세 + 상태 정의 | 작업 세션 |
| | `/session10` | 표시 데이터 명세 ★ 신규 | 작업 세션 |
| **API 설계** | `/session11` | 도메인별 API 설계 (표시 데이터 기반) | 작업 세션 |
| | `/session12` | API별 테스트 케이스 생성 | 작업 세션 |
| **매핑+확정** | `/session13` | 화면-API 매핑 | 작업 세션 |
| | `/session14` | ERD 최종 확정 | 작업 세션 |
| | `/session15` | CLAUDE.md 법률 섹션 채우기 | 작업 세션 |
| | `/session16` | MODULE_SPEC + FRONT_SPEC 동시 작성 | 작업 세션 |
| | `/session17` | 외부 연동 확인 리스트 (설계 후 필드 역산) | 작업 세션 |
| **리뷰** | `/review-01` ~ `/review-17` | 각 세션 산출물 검증 | **별도 세션** |
| | `/review-build-skeleton` | 뼈대 단계 코드 검증 | **별도 세션** |
| | `/review-build-interfaces` | 인터페이스 단계 코드 검증 | **별도 세션** |
| | `/review-build-infra` | 인프라 단계 코드 + 테스트 검증 | **별도 세션** |
| **코드** | `/build-skeleton` | 프로젝트 뼈대 (빌드구조, BaseEntity, ApiResponse) | 작업 세션 |
| | `/build-interfaces` | 인터페이스 + Stub + DTO + enum | 작업 세션 |
| | `/build-infra` | 유틸 + 설정 + 테스트 전체 통과 | 작업 세션 |
| | `/build-design-system` | 프론트 디자인 시스템 코드 | 작업 세션 |
| | `/generate-module-commands` | 모듈별 전용 구현 명령어 자동 생성 | 작업 세션 |
| **구현** | `/implement-{모듈}` | 전용 모듈 구현 (체크포인트 포함) | 작업 세션 |
| | `/implement-front {도메인}` | 프론트 도메인별 구현 (Mock 기반) | 작업 세션 |
| **통합** | `/integrate {모듈}` | Stub → 실제 구현체 교체 | 작업 세션 |
| | `/integrate-front {도메인}` | Mock → 실제 API 교체 | 작업 세션 |
| **롤백** | `/rollback {모듈}` | 모듈 구현 전 체크포인트로 롤백 | 아무 때나 |
| **검증** | `/validate` | 명세 간 정합성 전체 검증 (교차 도메인 포함) | 아무 때나 |
| | `/integration-order` | Stub 기반 통합 순서 계산 | 아무 때나 |
| **회고** | `/retro-spec` | 명세 단계 회고 | 단계 전환 시 |
| | `/retro-build` | 공통 모듈 단계 회고 | 세션 종료 후 |
| | `/retro-impl` | 구현 단계 회고 | 단계 전환 시 |
| **상태** | `/status` | 진행 상태 + 다음 할 일 안내 (17세션 + 게이트) | 아무 때나 |

---

## 전체 흐름

```
Phase 1: 기반 설계
  세션 0:  프로젝트 초기 설정                  /session0 → CLAUDE.md + PROJECT_CONTEXT.md
  세션 1:  요구사항 명세 구체화 (인터뷰)              /session1 → (별도 세션) /review-01
  세션 2:  요구사항 명세 → 도메인 분류             /session2 → (별도 세션) /review-02
  세션 3:  ERD 초안                         /session3 → (별도 세션) /review-03
  세션 4:  도메인 분리                       /session4 → (별도 세션) /review-04

Phase 2: 모듈 계약
  세션 5:  인터페이스 설계                   /session5 → (별도 세션) /review-05
  세션 6:  공통 구조 설계                    /session6 → (별도 세션) /review-06

Phase 3: 화면 기반 설계
  세션 7:  화면 목록 + 화면 흐름도            /session7 → (별도 세션) /review-07
  세션 8:  디자인 시스템 설계                /session8 → (별도 세션) /review-08

Phase 4: 화면-데이터 동시 설계
  세션 9:  화면별 상세 명세 + 상태 정의       /session9 → (별도 세션) /review-09
  세션 10: 표시 데이터 명세 ★               /session10 → (별도 세션) /review-10

Phase 5: 데이터 기반 API 설계
  세션 11: API 설계 (표시 데이터 기반)       /session11 → (별도 세션) /review-11
  세션 12: 테스트 케이스                    /session12 → (별도 세션) /review-12

Phase 6: 매핑 + 확정
  세션 13: 화면-API 매핑                    /session13 → (별도 세션) /review-13
  세션 14: ERD 최종 확정                    /session14 → (별도 세션) /review-14
  세션 15: CLAUDE.md 법률                   /session15 → (별도 세션) /review-15
  세션 16: MODULE_SPEC + FRONT_SPEC         /session16 → (별도 세션) /review-16
  세션 17: 외부 연동 확인 리스트             /session17 → (별도 세션) /review-17
           (외부 연동이 없으면 스킵 가능)
  /retro-spec                              ← 명세 회고

═══ 개발 시작 게이트 (5개 조건 모두 충족) ═══
  ✅ MODULE_SPEC × N개 + review-16 통과
  ✅ FRONT_SPEC × N개 + review-16 통과
  ✅ 표시_데이터_명세 + review-10 통과
  ✅ 화면-API 매핑 + review-13 통과
  ✅ /validate 교차 정합성 통과

빌드:
  /build-skeleton    → (별도 세션) /review-build-skeleton
  /build-interfaces  → (별도 세션) /review-build-interfaces
  /build-infra       → (별도 세션) /review-build-infra
  /build-design-system → (별도 세션) /review-build-design-system
  /retro-build                             ← 공통 모듈 단계 회고

구현 (백엔드 + 프론트 병렬 가능):
  /generate-module-commands → /integration-order
  /implement-{모듈} × N                    ← 백엔드
  /implement-front {도메인} × N            ← 프론트 (도메인 단위)
  /retro-impl

통합:
  /integrate {모듈} × N                    ← Stub → 실제
  /integrate-front {도메인} × N            ← Mock → 실제 API

상시: /status, /validate
```

---

## 1단계: 기존 시스템 분석

> 신규 개발이면 생략. 기존 시스템 계승/리뉴얼 시 수행.

- [ ] 기존 전체 메뉴 구조 정리 + 화면 캡처
- [ ] 기능 목록 작성 (유지/개선/제거 분류)
- [ ] 기존 DB 테이블 목록 + 컬럼/FK 정리
- [ ] 마이그레이션 필요 데이터 파악

**산출물**: 기존 기능 목록, DB 스키마 문서, 마이그레이션 범위 문서

---

## Phase 1: 기반 설계

### 세션 0 — 프로젝트 초기 설정 `/session0`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| PM | 사용자 대화 | CLAUDE.md, PROJECT_CONTEXT.md, 디렉토리 구조 | 기술 스택/환경 확정, 미확정은 "미확정"으로 |

### 세션 1 — 요구사항 명세 구체화 `/session1`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| PM | 사용자 인터뷰 (6단계 질문) | `specs/01_요구사항명세서.md` | 행위 수집 → MVP 분류 |

- 6단계 질문 체크리스트로 대화형 인터뷰 진행
- **산출물**: `specs/01_요구사항명세서.md`

#### 변형: 초안 기반 작성 `/session1-self`

이미 요구사항 초안(메모, 기존 기획서 등)이 있다면 인터뷰를 생략하고 초안을 표준 틀에 정규화한다. 산출물 파일명·형식·자체 검증은 `/session1`과 동일하므로 이후 세션에 영향 없음.

| 방법 | 사용 상황 |
|------|----------|
| 프롬프트에 초안 붙여넣기 + `/session1-self` | 짧은 초안 (1~2페이지) |
| `specs/01_요구사항명세서_draft.md`로 저장 후 `/session1-self` | 긴 초안, 기존 문서 재활용 |
| `/session1-self @경로/초안.md` | 임의 위치 파일 지정 |

AI는 초안을 슬롯에 매핑하고 누락·애매한 항목만 한 번에 묶어 질문한다. 6단계 인터뷰 재실행 X.

### 세션 2 — 도메인 분류 `/session2`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| PM | 01_요구사항명세서 | `specs/02_도메인_분류.md` | 기능을 도메인으로 묶고 의존 관계 도출 |

### 세션 3 — ERD 초안 `/session3`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| Architect | 01, 02 | `specs/03_ERD.md` | 도메인별 테이블/컬럼/FK/상태값 설계 |

### 세션 4 — 도메인 분리 `/session4`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| Architect | 02, 03 | `specs/04_도메인_분리.md` | ERD를 모듈로 분리, 양방향 의존 탐지 |

---

## Phase 2: 모듈 계약

### 세션 5 — 인터페이스 설계 `/session5`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| Architect | 01, 03, 04 | `specs/05_공용_인터페이스_명세.md` | 모듈 간 교차 호출 → 인터페이스 + Stub 설계 |

> 인터페이스 설계 상세는 [공통 모듈 추상화 설계 가이드](#공통-모듈-추상화-설계-가이드) 참조

### 세션 6 — 공통 구조 설계 `/session6`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| Architect | 05 | `specs/06_공통_구조_설계서.md` | ApiResponse<T>, 에러 코드, BaseEntity, 유틸 |

---

## Phase 3: 화면 기반 설계

### 세션 7 — 화면 목록 + 화면 흐름도 `/session7`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| PM | 01, PROJECT_CONTEXT | `specs/07_화면목록.md` | 요구사항 명세에서 화면 도출 + 흐름도 |

### 세션 8 — 디자인 시스템 설계 `/session8`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| PM | 07, 디자인 레퍼런스 | `specs/08_디자인시스템.md` | 색상/타이포/간격/공통 컴포넌트 |

---

## Phase 4: 화면-데이터 동시 설계

### 세션 9 — 화면별 상세 명세 + 상태 정의 `/session9`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| PM | 01, 07, 08 | `specs/09_화면상세.md` | 와이어프레임 + 행위 + 상태 정의 |

### 세션 10 — 표시 데이터 명세 `/session10`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| Architect | 09, 03 | `specs/10_표시데이터.md` | 화면에 표시할 데이터 필드 + 출처 매핑 ★ 신규 |

---

## Phase 5: 데이터 기반 API 설계

### 세션 11 — API 설계 `/session11`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| Architect | 10, 03, 04, 06 | `specs/11_API_스펙.md` | 엔드포인트 + 통합 디테일 (날짜/nullable/페이징) |

> 도메인 많으면 세션을 나눈다. 한 세션에 2~3개 도메인씩.

### 세션 12 — 테스트 케이스 `/session12`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| QA | 11, 06 | `specs/12_테스트_케이스.md` | 성공/실패/권한/경계 케이스 |

---

## Phase 6: 매핑 + 확정

### 세션 13 — 화면-API 매핑 `/session13`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| Architect | 09, 11 | `specs/13_화면API매핑.md` | 화면별 API 호출 시점 + Mock 데이터 |

### 세션 14 — ERD 최종 확정 `/session14`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| Architect | 03, 05, 11, 12 | `specs/03_ERD.md` 업데이트 | API/테스트 기준 ERD 누락 점검 + 인덱스 제안 |

### 세션 15 — CLAUDE.md 법률 `/session15`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| Architect | specs/ 전체 | `CLAUDE.md` 법률 섹션 | 헌법은 그대로, 법률(코드 규칙)만 채움 |

### 세션 16 — MODULE_SPEC + FRONT_SPEC `/session16`

| 역할 | 입력 | 출력 | 핵심 |
|------|------|------|------|
| Architect | specs/ 전체 | `specs/modules/{모듈}_SPEC.md` + `specs/modules/{도메인}_FRONT_SPEC.md` | 백엔드 모듈별 + 프론트 도메인별 AI 입력물 동시 작성 |

### 빌드 — 공통 모듈 코드 (3단계)

| 단계 | 명령어 | 입력 | 출력 | 핵심 |
|------|--------|------|------|------|
| a | `/build-skeleton` | 04, 06 | 빌드 구조, BaseEntity, ApiResponse | 멀티모듈 + 의존성 강제 + yml |
| b | `/build-interfaces` | 05, 06 + skeleton 코드 | 인터페이스, Stub, DTO, enum | 제네릭 필수, @Profile("local") |
| c | `/build-infra` | 06 + 전체 코드 | 유틸, 설정, 테스트 베이스, 전체 테스트 | **빌드 + 테스트 전체 통과 필수** |

> 각 단계마다 빌드 통과를 확인하고 다음 단계로 넘어간다.
> 각 단계 직후 별도 세션에서 `/review-build-skeleton`, `/review-build-interfaces`, `/review-build-infra`를 실행해 깐깐하게 검증한다 (결과는 `specs/_reviews/build-{단계}_review.md`).
> `/build-infra`가 끝나고 `/review-build-infra`까지 통과해야 `/implement-{모듈}`로 도메인 모듈을 만들 수 있다.

---

## 구현 단계

### 전체 실행 흐름

```
/retro-spec                      ← 명세 회고 (권장)
/generate-module-commands         ← 모듈별 전용 명령어 생성
/integration-order                ← 통합 순서 확인

/implement-{모듈A}               ← Stub 0개인 모듈부터
/implement-{모듈B}
...
/retro-impl                      ← 구현 회고 (권장)

/integrate {모듈A}               ← 통합 순서대로
/integrate {모듈B}
...
```

### 모듈 구현 워크플로우

```
1. /implement-{모듈명}
   → Step 0: git tag pre-implement-{모듈명}  ← 체크포인트 자동 생성
   → MODULE_SPEC 읽고 모듈 전체 코드 생성 + 빌드
2. 테스트 API 하나씩 확인 → 전체 초록불까지
3. .http 파일 생성 → API 수동 확인
4. 전부 통과 → git commit
5. 수정 3회 초과 → AI가 멈추고 롤백 안내 출력
   → /rollback {모듈명} → 체크포인트로 복원
   → SPEC 점검 → 새 세션에서 /implement-{모듈명} 재실행
```

> **핵심: 모듈은 한번에 생성하되, 테스트는 API 하나씩 확인한다.**
> **주의: "안 나게만" 고치지 말고, 항상 SPEC 기준으로 수정한다.**
> **롤백 원칙: 이어서 고치지 말고, 롤백 후 처음부터 다시 만들어라.** MODULE_SPEC이 좋으면 재생성이 더 빠르고 깨끗하다.

### 통합 워크플로우

Stub 사용 수가 적은 모듈부터 하나씩 통합. `/integrate {모듈}` 실행 시:
1. MODULE_SPEC의 Stub 사용 목록 확인
2. Stub → 실제 구현체 교체 (프로필 전환)
3. 해당 모듈 + 기존 통합체 전체 테스트
4. 회귀 없으면 통과

> 상세 통합 전략은 [부록 C](#부록-c-모듈별-산출물--점진적-통합-전략) 참조

---

## 단계별 산출물 요약

| 단계 | 핵심 산출물 | 명령어 |
|------|-----------|--------|
| 1단계 | 기존 기능 목록, DB 스키마, 마이그레이션 범위 | 사람 |
| 세션 1 | 요구사항명세서, MVP 범위, 기술 스택 | `/session1` |
| 세션 2 | 도메인 분류 문서 | `/session2` |
| 세션 3 | ERD 초안 | `/session3` |
| 세션 4 | 도메인 분리, 테이블-모듈 매핑 | `/session4` |
| 세션 5 | 공용 인터페이스 명세, DTO 명세 | `/session5` |
| 세션 6 | 공통 구조 설계서 | `/session6` |
| 세션 7 | 화면 목록 + 화면 흐름도 | `/session7` |
| 세션 8 | 디자인 시스템 명세서 | `/session8` |
| 세션 9 | 화면별 상세 명세서 + 상태 정의 | `/session9` |
| 세션 10 | ★ 표시 데이터 명세 | `/session10` |
| 세션 11 | API 스펙 문서 | `/session11` |
| 세션 12 | 테스트 케이스 문서 | `/session12` |
| 세션 13 | 화면-API 매핑 문서 | `/session13` |
| 세션 14 | 확정된 ERD | `/session14` |
| 세션 15 | CLAUDE.md (법률 채움) | `/session15` |
| 세션 16 | MODULE_SPEC × 모듈 수 + FRONT_SPEC × 도메인 수 | `/session16` |
| 빌드 | 공통 모듈 코드 + 디자인 시스템 코드 + 테스트 통과 | `/build-*` |
| 구현 | 모듈별 코드 + 프론트 도메인별 코드 + 테스트 + .http | `/implement-*` |
| 통합 | 전체 시스템 | `/integrate*` |

---

## 공통 모듈 추상화 설계 가이드

#### 설계 원칙

공통 모듈의 목적은 **AI가 각 도메인 모듈을 생성할 때 의존할 "계약"을 미리 확정하는 것**이다.
AI 세션은 모듈 단위로 분리되므로, 모듈 간 결합은 반드시 공통 모듈의 인터페이스를 통해서만 이루어져야 한다.

```
[모듈 A] → (공통 인터페이스) ← [모듈 B]
    ↓                              ↓
[common: 인터페이스 + DTO + enum + 유틸]
```

**핵심 규칙**: 도메인 모듈끼리 직접 import 금지. 모든 교차 의존은 공통 모듈의 인터페이스/DTO를 통해서만.

---

#### 1. 공용 엔티티 — 상속 구조

모든 엔티티가 공유하는 필드를 BaseEntity로 뽑는다. AI가 엔티티를 생성할 때 이것만 상속하면 일관성이 보장된다.

정의할 것:
- [ ] PK 전략 (Auto Increment / UUID / TSID 등)
- [ ] 공통 필드 (id, createdAt, updatedAt, createdBy, updatedBy)
- [ ] Soft Delete 여부 (deletedAt 필드 사용 여부)
- [ ] Auditing 방식 (JPA Auditing / 수동 / Interceptor)

```
BaseEntity
├── id: Long (PK 전략)
├── createdAt: LocalDateTime
├── updatedAt: LocalDateTime
├── createdBy: String
└── deletedAt: LocalDateTime? (soft delete 시)
```

---

#### 2. 공용 응답 형식 — 모든 API의 껍데기

AI가 Controller를 만들 때 응답을 감쌀 형식. 이걸 확정하지 않으면 모듈마다 응답 구조가 달라진다.

정의할 것:
- [ ] 성공 응답: `ApiResponse<T>` (code, message, data)
- [ ] 페이징 응답: `PagedResponse<T>` (content, page, size, totalElements, totalPages)
- [ ] 에러 응답: 에러 코드, 메시지, 상세 (validation 에러 시 필드별 메시지)
- [ ] 에러 코드 네임스페이스 규칙: `{모듈접두사}-{번호}` (예: AUTH-001, BOARD-003)

---

#### 3. 공용 인터페이스 — 모듈 간 계약

**이 부분이 추상화의 핵심.** 도메인 모듈이 다른 모듈의 기능을 사용할 때 직접 호출하지 않고, 공통 모듈에 정의된 인터페이스를 통해서만 호출한다.

##### 인터페이스 도출 방법

ERD와 요구사항 명세에서 "모듈 A가 모듈 B의 뭔가를 호출해야 하는 지점"을 모두 찾는다.

```
요구사항 명세에서 찾기:
"~하면 알림을 보낸다"     → NotificationSender 인터페이스
"~에 파일을 첨부한다"     → FileStore 인터페이스
"현재 로그인 사용자 정보"  → SecurityContext 인터페이스
"~하면 감사 로그를 남긴다" → AuditLogger 인터페이스
"사용자 정보를 조회한다"   → UserProvider 인터페이스
```

##### 인터페이스 설계 절차

- [ ] 요구사항 명세에서 모듈 간 교차 호출 지점 전부 수집
- [ ] 교차 호출을 인터페이스로 추상화
- [ ] 인터페이스의 메서드 시그니처 확정 (입력 타입, 반환 타입)
- [ ] **제네릭으로 타입 강제** (Object, Map 사용 금지)
- [ ] 인터페이스가 주고받는 DTO 정의 (공통 모듈에 배치)
- [ ] 각 인터페이스의 Stub 구현체 작성 (개발/테스트 시 사용)

##### 제네릭 활용 — 타입 실수를 컴파일러가 잡게 한다

데이터 조회 계열 인터페이스는 제네릭 베이스를 만들고 상속한다.

```java
// 제네릭 베이스 인터페이스
public interface DataProvider<T, ID> {
    T getById(ID id);
    List<T> getByIds(List<ID> ids);
    boolean exists(ID id);
}

// 구체 인터페이스 — 타입이 강제됨
public interface UserProvider extends DataProvider<UserInfo, Long> {
    // getById(Long id) → UserInfo 반환이 컴파일 레벨에서 강제
    // AI가 String을 반환하면 컴파일 에러
    List<UserInfo> searchByName(String name);
}

public interface DepartmentProvider extends DataProvider<DepartmentInfo, Long> {
    List<DepartmentInfo> getChildren(Long parentId);
}
```

행위 계열 인터페이스는 커맨드 DTO로 타입을 잡는다.

```java
// 커맨드 패턴 — 입력 타입 강제
public interface NotificationSender {
    void send(NotificationCommand command);  // Object 아님
}

public record NotificationCommand(
    String type,
    List<Long> receiverIds,   // List<String> 아님, Long으로 통일
    String title,
    String message,
    String linkUrl
) {}
```

ApiResponse도 제네릭 필수:

```java
public record ApiResponse<T>(
    String code,
    String message,
    T data
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("SUCCESS", null, data);
    }
    public static ApiResponse<Void> error(String code, String message) {
        return new ApiResponse<>(code, message, null);
    }
}

// Controller에서 — 반환 타입이 명확
@GetMapping("/{id}")
public ApiResponse<PostResponse> getPost(@PathVariable Long id) { ... }

@GetMapping
public ApiResponse<PagedData<PostResponse>> listPosts(...) { ... }

// ❌ 이렇게 하면 안 됨
public ApiResponse<Object> getPost(...)   // Object 금지
public Map<String, Object> getPost(...)   // Map 금지
```

##### Stub 예시 (제네릭 적용)

```java
@Component
@Profile("local")
public class StubUserProvider implements UserProvider {
    @Override
    public UserInfo getById(Long id) {
        return new UserInfo(id, "테스트유저", "TEST", "테스트부서");
    }

    @Override
    public List<UserInfo> getByIds(List<Long> ids) {
        return ids.stream().map(this::getById).toList();
    }

    @Override
    public boolean exists(Long id) {
        return true;
    }

    @Override
    public List<UserInfo> searchByName(String name) {
        return List.of(getById(1L));
    }
}
```

##### 전형적인 공용 인터페이스 목록

| 인터페이스 | 역할 | Stub 동작 |
|-----------|------|----------|
| SecurityContext | 현재 사용자 정보 제공 | 고정 테스트 유저 반환 |
| NotificationSender | 알림 발송 | 로그 출력만 |
| FileStore | 파일 저장/조회/삭제 | 로컬 디스크 저장 |
| AuditLogger | 감사 로그 기록 | 로그 출력만 |
| UserProvider | 사용자 정보 조회 | 메모리 맵에서 조회 |

> **주의**: 위 목록은 예시. 실제로는 요구사항 명세에서 도출한 교차 호출 지점에 따라 달라진다.

---

#### 4. 공용 DTO — 모듈 간 데이터 전달 객체

인터페이스가 주고받는 데이터 형태. 도메인 엔티티를 직접 넘기지 않고, 공통 모듈의 DTO로만 주고받는다.

정의할 것:
- [ ] 각 인터페이스의 입력/출력 DTO
- [ ] 모듈 간 공유되는 식별자 DTO (예: UserInfo — id, name, department, rank)
- [ ] 이벤트/커맨드 DTO (예: NotificationCommand, AuditEvent)

---

#### 5. 공용 enum — 상태값/유형값 통일

여러 모듈에서 참조하는 enum은 공통 모듈에 둔다. 한 모듈에서만 쓰는 enum은 해당 모듈에 둔다.

정의할 것:
- [ ] 공통 에러 코드 enum (또는 상수 클래스)
- [ ] 여러 모듈이 참조하는 상태/유형 enum 식별
- [ ] 한 모듈 전용 enum은 MODULE_SPEC에 명시 (공통에 넣지 않음)

---

#### 6. 공용 유틸 — 반복 로직 제거

정의할 것:
- [ ] 날짜/시간 변환 유틸 (포맷 규칙 통일)
- [ ] 페이징 처리 유틸 (PageRequest 변환 등)
- [ ] 검색 조건 빌더 (동적 쿼리 조건 조립)
- [ ] 파일 관련 유틸 (확장자 검증, 용량 검증)
- [ ] 문자열/마스킹 유틸 (필요시)

---

#### 7. 공용 설정 — 횡단 관심사

정의할 것:
- [ ] GlobalExceptionHandler (에러 응답 형식 통일)
- [ ] CORS 설정
- [ ] 로깅 설정 (로그 포맷, 레벨)
- [ ] 공통 필터/인터셉터 (인증 체크, 감사 로그 등)

---

#### 8. Stub 전략 — 모듈 독립 개발의 열쇠

**AI가 모듈을 독립적으로 생성하려면 Stub이 필수.** 각 모듈은 다른 모듈의 실제 구현 없이도 빌드 + 테스트가 가능해야 한다.

- [ ] 모든 공용 인터페이스에 대해 Stub 구현체 작성
- [ ] Stub은 공통 모듈에 배치 (각 모듈이 개발 시 자동으로 사용)
- [ ] application.yml 프로필로 Stub ↔ 실제 구현체 전환
  ```
  local 프로필  → Stub 사용 (모듈 단독 개발/테스트)
  통합 프로필   → 실제 구현체 사용 (통합 빌드)
  ```
- [ ] Stub 동작을 MODULE_SPEC에 명시 ("이 모듈 개발 시 NotificationSender는 Stub이 로그만 출력")

---

#### 9. 빌드 레벨 의존성 강제 — 참조 {#빌드-레벨-의존성-강제-참조}

CLAUDE.md에 "도메인 간 직접 import 금지"를 아무리 적어도 AI가 무시하고 직접 import할 수 있다.
빌드 단계(`/build-skeleton`)에서 아래 설정을 빌드 파일에 포함시킨다.

```groovy
// root build.gradle — {common-module}은 프로젝트의 공통 모듈명으로 교체
def commonModuleName = '{common-module}'
subprojects {
    afterEvaluate {
        if (project.name != commonModuleName) {
            configurations.implementation.dependencies.each { dep ->
                if (dep instanceof ProjectDependency && dep.dependencyProject.name != commonModuleName) {
                    throw new GradleException(
                        "${project.name}은 ${dep.dependencyProject.name}에 직접 의존할 수 없습니다. " +
                        "${commonModuleName}의 인터페이스를 사용하세요."
                    )
                }
            }
        }
    }
}
```

> 이 설정이 있으면 AI가 다른 모듈을 import해도 빌드 자체가 실패한다.
> 규칙을 "문서"가 아니라 "빌드"가 강제한다.

---

#### 공통 모듈 완성 체크리스트

공통 모듈은 **빌드 단계(`/build-skeleton` → `/build-interfaces` → `/build-infra`)에서 코드로 완성**된다.

- [ ] BaseEntity → 코드 완성
- [ ] ApiResponse, PagedResponse, 에러 응답 → 코드 완성
- [ ] 모든 공용 인터페이스 → 코드 완성
- [ ] 모든 인터페이스의 Stub 구현체 → 코드 완성
- [ ] 공용 DTO, enum → 코드 완성
- [ ] 공용 유틸 → 코드 완성
- [ ] GlobalExceptionHandler 등 설정 → 코드 완성
- [ ] 빌드 레벨 의존성 강제 설정 → 적용 완료
- [ ] **빌드 통과 확인** (공통 모듈 단독으로 빌드 가능)
- [ ] 빈 도메인 모듈 하나 만들어서 공통 모듈 의존 + 빌드 통과 확인

---

## 부록 A: 테스트 전략 + Stub 활용 가이드

### 왜 테스트를 먼저 만드는가

SDD에서 테스트는 "나중에 검증하는 도구"가 아니라 **"명세의 실행 가능한 형태"**이다.
MODULE_SPEC에 적힌 테스트 케이스가 그대로 코드로 변환되어 프로젝트 템플릿에 들어간다.
AI가 모듈을 생성하면 이 테스트가 통과하는지로 품질을 판단한다.

```
명세(문서) → 테스트(코드) → 구현(AI가 생성) → 테스트 통과 확인
```

---

### 테스트 계층

```
┌─────────────────────────────────┐
│  E2E 시나리오 테스트              │  ← 통합 단계에서 작성
│  (로그인 → 글쓰기 → 알림 수신)    │
├─────────────────────────────────┤
│  Controller 통합 테스트           │  ← 모듈별 작성 (MockMvc)
│  (API 요청 → 응답 형식 확인)      │
├─────────────────────────────────┤
│  Service 단위 테스트              │  ← 모듈별 작성 (Stub 사용)
│  (비즈니스 로직 검증)             │
├─────────────────────────────────┤
│  공통 모듈 테스트                 │  ← 템플릿 단계에서 완성
│  (ApiResponse, 유틸, Stub 동작)  │
└─────────────────────────────────┘
```

---

### Stub을 활용한 모듈 독립 테스트

#### 문제

모듈 A의 Service가 NotificationSender를 호출한다.
그런데 알림 모듈은 아직 없거나, 다른 팀원이 만들고 있다.
→ 모듈 A를 단독으로 테스트할 수 없다.

#### 해결: Stub 주입

```java
// 테스트에서 Stub 사용
@SpringBootTest(properties = "spring.profiles.active=local")
class PostServiceTest {

    @Autowired
    private PostService postService;

    @Autowired
    private NotificationSender notificationSender;
    // local 프로필 → StubNotificationSender 자동 주입

    @Test
    void 게시글_작성_시_알림_발송() {
        // given
        PostCreateRequest request = new PostCreateRequest("제목", "내용");

        // when
        PostResponse result = postService.create(request);

        // then
        assertThat(result.id()).isNotNull();
        // Stub은 로그만 출력, 예외 없이 통과
        // → "알림 모듈 없이도 게시판 모듈이 동작한다"를 검증
    }
}
```

#### Stub vs Mock — 언제 뭘 쓰는가

| 상황 | 사용 | 이유 |
|------|------|------|
| 다른 모듈의 인터페이스 호출 | **Stub** (공통 모듈에 미리 구현) | 모듈 독립 빌드/테스트 보장 |
| 호출 여부/횟수를 검증해야 할 때 | **Mock** (Mockito 등) | "알림이 정확히 1번 발송됐는가" 검증 |
| Repository 계층 | **실제 DB** (H2/TestContainers) | 쿼리 정합성 검증 |

```java
// Mock 사용 예: 알림 발송 횟수 검증이 필요할 때
@ExtendWith(MockitoExtension.class)
class PostServiceMockTest {

    @Mock
    private NotificationSender notificationSender;

    @InjectMocks
    private PostService postService;

    @Test
    void 게시글_작성_시_알림이_1번_발송된다() {
        // given
        PostCreateRequest request = new PostCreateRequest("제목", "내용");

        // when
        postService.create(request);

        // then
        verify(notificationSender, times(1)).send(any(NotificationCommand.class));
    }
}
```

**원칙**: 기본은 Stub으로 "동작한다"를 확인. 비즈니스 규칙상 호출 여부가 중요한 곳만 Mock으로 검증.

---

### 테스트 작성 타이밍

| 시점 | 뭘 만드는가 | 누가 |
|------|-----------|------|
| 세션 12 (테스트 케이스) | 테스트 케이스 문서 (문서) | AI + 사람 검토 |
| 빌드 단계 | 공통 모듈 테스트 코드 | AI (cms-common 테스트) |
| 빌드 단계 | 테스트 베이스 클래스 | AI (아래 참조) |
| 구현 단계 | 각 모듈 테스트 코드 | AI (MODULE_SPEC 기반) |

---

### 테스트 베이스 클래스 — 템플릿에 미리 만들기

모든 모듈 테스트가 공유하는 설정을 베이스 클래스로 뽑아서 템플릿에 넣는다.
AI가 모듈을 생성할 때 이걸 상속하면 Stub 주입, DB 설정, 공통 유틸이 자동으로 따라온다.

```java
// 공통 모듈 test 패키지에 배치
@SpringBootTest
@ActiveProfiles("local")  // Stub 자동 활성화
@Transactional             // 테스트 후 롤백
public abstract class BaseIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    // 공용 헬퍼: API 호출 후 응답 파싱
    protected <T> T callApi(MockHttpServletRequestBuilder request, Class<T> type) throws Exception {
        String response = mockMvc.perform(request
                .contentType(MediaType.APPLICATION_JSON))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readValue(response, type);
    }

    // 공용 헬퍼: 인증된 사용자로 요청
    protected MockHttpServletRequestBuilder withAuth(MockHttpServletRequestBuilder request) {
        // StubSecurityContext의 테스트 유저 세션 설정
        return request.sessionAttr("USER_ID", "test-user-001");
    }
}

// 단위 테스트용
public abstract class BaseUnitTest {
    // Mock 공통 설정, 테스트 데이터 빌더 등
}
```

---

### 공통 모듈 자체의 테스트

공통 모듈도 테스트가 필요하다. 템플릿 완성 시 아래 테스트가 전부 통과해야 한다.

```
공통 모듈 테스트 체크리스트:

- [ ] ApiResponse 직렬화/역직렬화 테스트
      → ApiResponse.success(data) → JSON → 파싱 → 원본과 동일
- [ ] PagedResponse 페이징 정보 테스트
      → totalElements, totalPages 계산 정확성
- [ ] 에러 응답 형식 테스트
      → GlobalExceptionHandler가 에러를 공통 형식으로 변환하는지
- [ ] 각 Stub 동작 테스트
      → StubNotificationSender.send() → 예외 없이 완료
      → StubFileStore.store() → 파일 저장 경로 반환
      → StubSecurityContext.getCurrentUser() → 테스트 유저 반환
- [ ] 공용 유틸 테스트
      → 날짜 변환, 페이징 변환, 파일 확장자 검증 등
- [ ] BaseEntity auditing 테스트
      → 엔티티 저장 시 createdAt, createdBy 자동 설정
```

---

### MODULE_SPEC에 테스트를 어떻게 적는가

각 MODULE_SPEC에 테스트 섹션을 아래 형식으로 작성한다. AI가 이걸 보고 테스트 코드를 생성한다.

```markdown
## 테스트

### Service 단위 테스트 (Stub 사용)

| 테스트명 | 행위 | 기대 결과 | Stub |
|---------|------|----------|------|
| 게시글_작성_성공 | create(title, content) | PostResponse 반환, id 존재 | StubNotificationSender |
| 게시글_작성_시_알림_발송 | create(title, content) | NotificationSender.send() 1회 호출 | Mock |
| 존재하지_않는_게시글_조회 | getById(999) | NOT_FOUND 에러 | - |

### Controller 통합 테스트

| 테스트명 | 요청 | 기대 응답 |
|---------|------|----------|
| 게시글_작성_API | POST /api/posts {title, content} | 201, ApiResponse<PostResponse> |
| 게시글_작성_제목_누락 | POST /api/posts {content} | 400, 에러코드 BOARD-001 |
| 게시글_작성_권한_없음 | POST /api/posts (인증 없이) | 403 |
| 게시글_목록_조회_페이징 | GET /api/posts?page=0&size=10 | 200, PagedResponse<PostResponse> |
```

**규칙**:
- Stub 컬럼에 어떤 Stub을 쓰는지 명시 → AI가 테스트에 자동 주입
- Mock이 필요한 곳은 "Mock"으로 표시 → AI가 Mockito로 작성
- 에러 코드는 공통 구조 설계서의 네임스페이스 규칙을 따름

---

### 테스트 실행 순서 — 구현 후 검증 절차

```
1. 공통 모듈 테스트 통과 확인 (템플릿 단계에서 이미 완료)
2. AI가 모듈 생성
3. 해당 모듈 단위 테스트 실행 → 전부 초록불
4. 해당 모듈 통합 테스트 실행 → 전부 초록불
5. 전체 빌드 → 기존 모듈 테스트 깨지지 않는지 확인 (회귀)
6. 통과 → Git 커밋
7. 실패 → 에러 로그 AI에 복붙 → 수정 → 3회 초과 시 SPEC 점검
```

---

### Stub → 실제 구현체 전환 시 테스트

통합 단계에서 Stub을 실제 구현체로 교체할 때 추가 확인이 필요하다.

```
전환 체크리스트:

- [ ] application.yml 프로필을 통합으로 변경
- [ ] Stub 대신 실제 구현체가 주입되는지 확인 (Bean 주입 로그)
- [ ] 기존 단위 테스트는 여전히 local 프로필로 실행 → 통과 확인
- [ ] 통합 테스트를 통합 프로필로 실행 → 실제 동작 확인
  - [ ] 알림이 실제로 발송되는가
  - [ ] 파일이 실제 경로에 저장되는가
  - [ ] 감사 로그가 실제 테이블에 쌓이는가
- [ ] E2E 시나리오 테스트 실행 → 모듈 간 흐름 확인
```

**프로필 전략 요약**:
```
local   → Stub 사용, 모듈 단독 개발/테스트
test    → H2 + Stub, CI에서 자동 실행
integ   → 실제 DB + 실제 구현체, 통합 테스트
prod    → 실제 DB + 실제 구현체, 운영
```

---

## 부록 B: 개발 중 의존성 발견 시 대응 프로세스

### 원칙

개발 중 새로운 모듈 간 의존성이 발견되면, **절대로 다른 모듈을 직접 import하지 않는다.** 공통 모듈에 인터페이스를 추가하고, Stub으로 개발을 계속한다.

```
❌ 금지: 모듈 A에서 모듈 B의 패키지를 직접 import
✅ 원칙: 공통 모듈에 인터페이스 추가 → Stub 작성 → 모듈 A는 인터페이스만 의존
```

---

### 발견 유형별 대응

#### 유형 1: 다른 모듈의 데이터를 읽어야 할 때

```
상황: 결재 모듈에서 "기안자의 부서명"이 필요한데, 부서 정보는 인물검색 모듈이 관리

대응:
1. 공통 모듈에 DepartmentProvider 인터페이스 추가
   public interface DepartmentProvider {
       DepartmentInfo getById(Long departmentId);
   }

2. 공통 모듈에 DepartmentInfo DTO 추가
   public record DepartmentInfo(Long id, String name, String code) {}

3. StubDepartmentProvider 작성
   public class StubDepartmentProvider implements DepartmentProvider {
       @Override
       public DepartmentInfo getById(Long departmentId) {
           return new DepartmentInfo(departmentId, "테스트부서", "TEST");
       }
   }

4. 결재 모듈은 Stub으로 개발 계속
5. 인물검색 모듈이 나중에 실제 구현체 제공
```

#### 유형 2: 다른 모듈의 행위를 트리거해야 할 때

```
상황: 일정 모듈에서 "일정 등록 시 참석자에게 알림"을 보내야 하는데,
      NotificationSender에 "일정 알림 타입"이 없음

대응:
1. 공통 모듈의 기존 enum에 알림 타입 추가
   SCHEDULE_INVITE  // 추가

2. NotificationCommand가 이미 type 필드를 가지고 있으므로
   새 타입만 추가하면 인터페이스 시그니처는 변경 없음

3. 기존 Stub도 수정 불필요 (type 무관하게 로그 출력)
```

#### 유형 3: 완전히 새로운 교차 관심사가 발견될 때

```
상황: 여러 모듈에서 "최근 조회 이력"을 남겨야 한다는 것을 개발 중 발견

대응:
1. 공통 모듈에 ViewHistoryRecorder 인터페이스 추가
   public interface ViewHistoryRecorder {
       void record(String entityType, Long entityId, String userId);
   }

2. StubViewHistoryRecorder 작성 (로그만 출력)

3. 관련 MODULE_SPEC에 "ViewHistoryRecorder 사용" 추가

4. 이미 생성된 모듈 중 이 인터페이스가 필요한 모듈 → 재생성 또는 수동 추가
```

---

### 대응 절차 체크리스트

의존성 발견 시 아래 순서대로 처리한다.

```
1. 멈춘다 — 다른 모듈을 직접 import하려는 충동을 멈춘다

2. 분류한다 — 어떤 유형인가?
   □ 데이터 조회 (유형 1) → Provider 인터페이스
   □ 행위 트리거 (유형 2) → 기존 인터페이스에 타입/메서드 추가
   □ 새로운 관심사 (유형 3) → 새 인터페이스

3. 영향 범위를 확인한다
   □ 인터페이스 시그니처 변경인가? → 🔒 확정 영역 변경, 신중하게
   □ enum 값 추가인가? → 🔄 반복 허용, 바로 추가
   □ 새 인터페이스 추가인가? → 기존 모듈에 영향 없으면 바로 추가

4. 공통 모듈을 수정한다
   □ 인터페이스 (또는 기존 인터페이스에 메서드) 추가
   □ DTO 추가 (필요시)
   □ Stub 구현체 추가
   □ 공통 모듈 빌드 + 기존 테스트 통과 확인

5. 기록한다
   □ 변경 내용을 공통 구조 설계서에 반영
   □ 관련 MODULE_SPEC에 "이 인터페이스 사용" 추가
   □ Git 커밋 (공통 모듈 변경은 별도 커밋)

6. 계속한다 — 현재 모듈은 Stub으로 개발 계속
```

---

### 위험 신호 — 이런 상황이면 SPEC을 다시 봐야 한다

단순 인터페이스 추가로 해결되지 않는 경우가 있다. 아래 신호가 보이면 개발을 멈추고 명세를 재점검한다.

| 위험 신호 | 의미 |
|----------|------|
| 한 모듈에서 3개 이상 새 인터페이스가 필요 | 도메인 분리가 잘못됐을 가능성 |
| 양방향 의존 발생 (A→B, B→A) | 도메인 경계 재설정 필요 |
| 인터페이스 시그니처를 3회 이상 변경 | 명세 단계에서 교차 지점을 놓쳤음 |
| Stub으로는 테스트할 수 없는 복잡한 로직 | 해당 로직이 공통 모듈로 올라가야 할 수 있음 |
| 공통 모듈이 비대해짐 (모든 것이 공통) | 도메인 간 결합이 너무 높음, 모듈 구조 재검토 |

**대응**: 현재 세션 중단 → 문제를 정리해서 새 세션에서 도메인 분리/ERD 재검토

---

## 부록 C: 모듈별 산출물 + 점진적 통합 전략

### 모듈 완성 시 필수 산출물

각 모듈이 "완성"이라고 하려면 아래 5개가 전부 있어야 한다.

| 산출물 | 내용 | 통합 시 역할 |
|--------|------|-------------|
| 코드 (빌드 통과) | 모듈 소스코드 전체 | 기본 |
| 테스트 전체 통과 | 단위 + 통합 테스트 초록불 | 모듈 단독 정합성 증명 |
| API 동작 증빙 | .http 파일 또는 Postman 컬렉션 | 통합 시 문제 구간 분리 |
| **Swagger 자동 생성 스펙** | Swagger UI에서 확인 가능한 API 스펙 | **API 스펙 문서와 비교 → 불일치 조기 발견** |
| **Stub 사용 목록** | 이 모듈이 의존하는 Stub 목록 | **통합 접점 = 이 목록** |
| 시드 데이터 스크립트 | 이 모듈이 동작하려면 필요한 초기 데이터 | 통합 환경 초기 세팅 |

#### Stub 사용 목록 형식

이 목록이 통합의 입력물을 자동으로 결정한다.

```markdown
## 모듈명: 결재 (approval)

### Stub 사용 목록

| Stub | 인터페이스 | 실제 구현 모듈 | 교체 시 필요한 코드 |
|------|-----------|--------------|-------------------|
| StubNotificationSender | NotificationSender | 알림 모듈 | SseNotificationSender.java |
| StubUserProvider | UserProvider | 인물검색 모듈 | HrUserProvider.java |
| StubFileStore | FileStore | 파일관리 모듈 | DiskFileStore.java |

### 시드 데이터
- approval_types 테이블: 기안 유형 3건 (일반, 긴급, 대외비)
- approval_line_templates 테이블: 기본 결재선 1건
```

---

### 점진적 통합 전략

#### 원칙

한번에 통합하지 않는다. 모듈을 하나씩 쌓아 올린다. 매 단계마다 빌드 + 전체 테스트 통과를 확인한다.

#### 통합 순서 결정

**Stub 사용 목록이 적은 모듈부터** 통합한다. 다른 모듈에 덜 의존하는 놈이 먼저 들어간다.

```
순서 결정 예시 (모듈명은 프로젝트에 맞게 변경):

모듈별 Stub 사용 개수:
  모듈 A:  0개 (Stub 없음, 독립적)
  모듈 B:  1개 (StubSecurityContext)
  모듈 C:  1개 (StubSecurityContext)
  모듈 D:  2개 (StubNotificationSender, StubFileStore)
  모듈 E:  3개 (StubNotificationSender, StubUserProvider, StubFileStore)

→ 통합 순서: A → B → C → D → E
```

#### 통합 흐름

```
1차: 공통 + 모듈 A (Stub 0개)
     → Stub 교체: 없음
     → 확인: 모듈 A의 핵심 기능 동작
     → 빌드 + 테스트 통과 → 통합체 A

2차: 통합체 A + 모듈 B (Stub 1개)
     → Stub 교체: StubXxx → 모듈 A의 실제 구현체
     → 확인: 모듈 B의 핵심 기능 + 모듈 A 연동
     → 빌드 + 테스트 통과 → 통합체 B

3차: 통합체 B + 모듈 C (Stub 1개)
     → Stub 교체: StubXxx → 기존 통합체의 실제 구현체
     → 빌드 + 테스트 통과 → 통합체 C

... 이하 반복 ...

N차: 통합체 (N-1) + 마지막 모듈 → 전체 시스템
```

> **매 단계에서 에러가 나면 "방금 추가한 모듈 때문"이라는 게 확실하다.**
> 한번에 합치면 이 판단이 불가능하다.

---

### 통합 세션 — Claude Code 활용

Claude Code는 프로젝트의 전체 파일 시스템을 볼 수 있으므로, 접점 코드를 수동으로 넣을 필요가 없다.

#### Claude Code 명령어

```
"specs/modules/{모듈A}_SPEC.md의 Stub 사용 목록 읽고,
 Stub을 실제 구현체로 교체해.
 application.yml 프로필을 integ로 바꾸고,
 빌드 + 전체 테스트 돌려서 통과시켜.
 단, specs/modules/{모듈A}_SPEC.md의 테스트 케이스를 만족하면서 고쳐."
```

> Claude Code가 알아서 Stub 코드, 실제 구현체 코드, 설정 파일을 찾아서 수정한다.
> 사람이 파일을 모아줄 필요 없다.

#### 에러 발생 시

```
"specs/modules/{모듈A}_SPEC.md의 해당 API 명세 읽고,
 이 SPEC을 만족하면서 에러 해결해.
 전체 테스트 다시 돌려서 회귀 없는지 확인해."
```

> **채팅과의 차이**: 에러 로그 복붙, 파일 찾기, 코드 붙여넣기가 전부 불필요.
> Claude Code가 직접 에러를 보고, 파일을 열고, 수정한다.

> **핵심: 에러 로그만 던지지 않는다. 항상 MODULE_SPEC의 기대 동작을 같이 넣는다.**
> 안 그러면 AI가 "에러만 안 나게" 고쳐버린다.

---

### 통합 단계별 체크리스트

매 통합 단계마다 이 체크리스트를 실행한다.

```
□ 추가할 모듈의 Stub 사용 목록 확인
□ 교체할 Stub → 실제 구현체 코드 준비
□ 시드 데이터 투입
□ application.yml 설정 변경 (프로필, 빈 등록)
□ 빌드 통과
□ 추가한 모듈의 테스트 전체 통과
□ 기존 통합체의 테스트 전체 통과 (회귀)
□ API 동작 증빙 (.http 파일) 재실행 → 기대 응답 확인
□ 통과 → Git 커밋 (태그: integration-N)
□ 실패 → 에러 로그 + MODULE_SPEC으로 AI 수정 세션
```

---

### 통합 순서 결정 템플릿

프로젝트 시작 시 아래 표를 채워서 통합 순서를 미리 정한다.

```markdown
## 통합 순서 계획

| 순서 | 추가 모듈 | Stub 사용 수 | 교체 대상 | 통합 후 확인 시나리오 |
|------|----------|-------------|----------|---------------------|
| 1차  | {모듈 A} | 0           | 없음     | {핵심 기능 동작}      |
| 2차  | {모듈 B} | 1           | {인터페이스명} | {모듈 A 연동 확인}  |
| 3차  | {모듈 C} | 1           | {인터페이스명} | {기존 통합체 연동}   |
| 4차  | {모듈 D} | 2           | {인터페이스1, 인터페이스2} | {복합 시나리오} |
| ...  | ...     | ...         | ...      | ...                 |
```

> 이 표의 "교체 대상" 컬럼이 각 통합 세션의 입력물을 결정한다.

---

## 부록 E: SDD 자동화 로드맵

### 현재 (v1) — 전부 수동

```
사람이 마크다운으로 명세 작성
→ 사람이 세션별 입력물 직접 모아서 AI에 투입
→ 사람이 산출물 간 정합성 눈으로 확인
→ 사람이 Stub 목록 세서 통합 순서 결정
→ 사람이 Swagger vs API 스펙 비교
```

v1에서는 이대로 간다. 단, **명세를 처음부터 구조화해서 적어두면 나중에 자동화할 때 훨씬 쉽다.**

---

### 명세 구조화 — 자동화의 전제 조건

v1에서도 마크다운을 쓰되, 나중에 기계가 파싱할 수 있는 구조로 적는다.

#### API 스펙 → 구조화된 마크다운 (나중에 OpenAPI YAML 전환 가능)

```markdown
### POST /api/posts

- 설명: 게시글 작성
- 인증: 필수
- 권한: ROLE_USER

#### 요청
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | String | Y | 최대 100자 |
| content | String | Y | 최대 10000자 |
| boardId | Long | Y | 게시판 ID |

#### 응답 (200)
| 필드 | 타입 | nullable | 설명 |
|------|------|----------|------|
| id | Long | N | 생성된 게시글 ID |
| title | String | N | 제목 |
| createdAt | String | N | ISO 8601 |

#### 에러
| 코드 | 상황 |
|------|------|
| BOARD-001 | 제목 누락 |
| BOARD-002 | 게시판 없음 |
```

> 이 형식이면 나중에 스크립트로 파싱해서 OpenAPI YAML 자동 변환이 가능하다.

#### Stub 사용 목록 → 구조화된 마크다운 (나중에 YAML 전환 가능)

```markdown
### 모듈: board

#### dependencies
| interface | stub | real_module | real_class |
|-----------|------|-------------|------------|
| NotificationSender | StubNotificationSender | notification | SseNotificationSender |
| FileStore | StubFileStore | file | DiskFileStore |
| SecurityContext | StubSecurityContext | auth | SessionSecurityContext |

#### seed_data
| table | count | description |
|-------|-------|-------------|
| board_types | 3 | 공지/자유/자료실 |
```

> 이 형식이면 의존 그래프를 스크립트로 자동 계산할 수 있다.

---

### 자동화 단계별 로드맵

#### ~~Phase 1 — 세션 입력물 자동 조립~~ (Claude Code에서 불필요)

Claude Code는 파일 시스템을 직접 읽으므로, 산출물 조립 스크립트가 필요 없다.
"specs/ 폴더 읽어" 한마디면 된다. **이 Phase는 건너뛴다.**

---

#### Phase 2 — 통합 순서 자동 계산

각 모듈의 Stub 사용 목록을 파싱해서 의존 그래프를 만들고, 통합 순서를 자동 출력한다.

```bash
sdd integration-order
# → output:
# 1차: auth        (Stub 사용: 0개)
# 2차: file        (Stub 사용: 1개) → 교체: SecurityContext
# 3차: notification (Stub 사용: 1개) → 교체: SecurityContext
# 4차: board       (Stub 사용: 2개) → 교체: NotificationSender, FileStore
# 5차: approval    (Stub 사용: 3개) → 교체: NotificationSender, UserProvider, FileStore
```

구현:
- 각 MODULE_SPEC의 Stub 사용 목록 파싱
- 의존 수 기준 정렬
- 순환 의존 감지 (양방향 의존 경고)

```
난이도: 낮음 (반나절)
효과: 통합 계획 수립 자동화 + 순환 의존 조기 발견
```

---

#### Phase 3 — 산출물 간 정합성 검증

산출물들 사이에 누락/불일치가 없는지 자동 체크한다.

```bash
sdd validate
# → output:
# ✅ API 스펙의 모든 엔드포인트가 MODULE_SPEC에 존재
# ❌ POST /api/approvals 의 테스트 케이스 없음
# ❌ board 모듈이 AuditLogger 사용하는데 Stub 사용 목록에 없음
# ⚠️ notification 모듈의 시드 데이터 파일 없음
```

검증 규칙:
- API 스펙의 모든 엔드포인트 → MODULE_SPEC에 존재하는가
- MODULE_SPEC의 모든 엔드포인트 → 테스트 케이스에 존재하는가
- MODULE_SPEC에서 사용하는 인터페이스 → 공통 구조 설계서에 존재하는가
- 모든 모듈에 Stub 사용 목록이 있는가
- 모든 모듈에 시드 데이터가 있는가

```
난이도: 중간 (2~3일)
효과: 명세 누락을 구현 전에 잡음
```

---

#### Phase 4 — Swagger ↔ API 스펙 자동 비교

백엔드 모듈 완성 시 Swagger에서 나온 실제 스펙과 API 스펙 문서를 자동 비교한다.

```bash
sdd compare-swagger --swagger-url http://localhost:8080/v3/api-docs
# → output:
# ✅ GET /api/posts — 일치
# ❌ POST /api/posts — 파라미터명 불일치: boardId (스펙) vs board_id (실제)
# ❌ GET /api/posts/{id} — 응답 필드 누락: viewCount (스펙에 있지만 실제에 없음)
# ⚠️ DELETE /api/posts/{id} — 스펙에 없는 엔드포인트가 실제에 존재
```

구현:
- Swagger JSON 자동 다운로드
- 구조화된 API 스펙 마크다운 파싱
- 엔드포인트/파라미터/응답 필드 비교

```
난이도: 중간 (2~3일)
효과: 프론트-백엔드 통합 불일치를 모듈 완성 시점에 즉시 발견
```

---

#### Phase 5 — 모듈 스켈레톤 자동 생성

MODULE_SPEC에서 패키지 구조 + 빈 엔티티 + 빈 컨트롤러 + 테스트 스켈레톤을 자동 생성한다.

```bash
sdd scaffold board
# → output:
# created: cms-board/src/main/java/.../controller/PostController.java (빈 껍데기)
# created: cms-board/src/main/java/.../entity/Post.java (BaseEntity 상속)
# created: cms-board/src/main/java/.../service/PostService.java (빈 껍데기)
# created: cms-board/src/test/.../PostServiceTest.java (테스트 스켈레톤)
# created: cms-board/src/test/.../PostControllerTest.java (테스트 스켈레톤)
```

```
난이도: 중간~높음 (3~5일)
효과: AI에게 "전체 만들어줘" 대신 "이 스켈레톤 채워줘"로 더 정확한 결과
```

---

#### Phase 6 — MCP 서버로 AI에게 명세 접근권 부여

명세 파일들을 MCP 서버로 노출해서, Claude Code 같은 도구가 세션 안에서 필요한 명세를 직접 조회할 수 있게 한다.

```
AI가 "이 모듈의 MODULE_SPEC 보여줘" → MCP 서버가 파일에서 읽어서 반환
→ 컨텍스트에 미리 다 넣을 필요 없음
→ 필요한 것만 필요할 때 조회
```

```
난이도: 높음 (1주+)
효과: 컨텍스트 윈도우 절약 + 대규모 프로젝트에서도 SDD 적용 가능
```

---

### 자동화 우선순위 요약 (Claude Code 기준)

| Phase | 도구 | 난이도 | 효과 | v1에서 필요 |
|-------|------|--------|------|------------|
| ~~1~~ | ~~`sdd session`~~ | - | ~~Claude Code에서 불필요~~ | 건너뜀 |
| 2 | `sdd integration-order` | 낮음 | 통합 계획 자동화 | 있으면 좋음 |
| 3 | `sdd validate` | 중간 | 명세 누락 조기 발견 | 있으면 좋음 |
| 4 | `sdd compare-swagger` | 중간 | F/B 통합 불일치 발견 | 나중에 |
| 5 | `sdd scaffold` | 중간~높음 | AI 입력 품질 향상 | 나중에 |
| ~~6~~ | ~~MCP 서버~~ | - | ~~Claude Code가 파일 직접 읽으므로 불필요~~ | 건너뜀 |

> **v1 권장: Phase 2만 간단히 만들고, 나머지는 실제로 돌려본 후 필요한 것부터 추가.**
> Claude Code 덕분에 Phase 1(입력물 조립)과 Phase 6(MCP 서버)이 불필요해졌다.
> 자동화보다 중요한 건 **명세를 구조화된 형식으로 적는 것.** 그래야 나중에 어떤 Phase든 바로 만들 수 있다.
