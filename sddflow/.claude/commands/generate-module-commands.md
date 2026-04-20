# /generate-module-commands — 모듈별 구현 명령어 자동 생성

## 역할
너는 도구를 만드는 Dev다.

## 입력
specs/modules/ 폴더의 모든 MODULE_SPEC을 읽어라.

## 할 일
각 MODULE_SPEC에서 아래 정보를 추출해서, 모듈별 전용 구현 명령어를 생성해라.

추출할 정보:
- 모듈명
- 소유 테이블 목록
- API 엔드포인트 목록
- 사용하는 공통 인터페이스
- Stub 사용 목록
- 시드 데이터

## 출력
각 모듈에 대해 .claude/commands/implement-{모듈명}.md 파일을 생성해라.

## 생성할 파일 형식

```markdown
# /implement-{모듈명} — {모듈명} 모듈 구현

## 역할
너는 Dev다. 명세에 있는 것만 구현한다. 명세에 없으면 만들지 말고 질문한다.

## 읽을 파일
1. CLAUDE.md (자동 인식)
2. specs/modules/{모듈명}_SPEC.md — 이 모듈의 전체 명세
3. specs/06_공통_구조_설계서.md — ApiResponse, 에러 코드 참조
4. src/{common-module}/ — 공통 모듈 코드 (인터페이스, Stub 확인)

## 할 일

### 0. 체크포인트 생성 (가장 먼저 실행)
구현을 시작하기 전에 현재 상태를 저장해라. 이 시점이 롤백 지점이다.
\`\`\`bash
git add -A && git commit -m "checkpoint: pre-implement-{모듈명}" --allow-empty
git tag -f pre-implement-{모듈명}
\`\`\`
- 이미 태그가 있으면 덮어쓴다 (-f). 이전 실패 후 재시도하는 경우.
- 이 단계를 건너뛰지 마라.

### 1. 모듈 전체 구현

## 만들 파일 위치
src/{모듈명}/
├── controller/
│   └── {각 API별 Controller}.java
├── service/
│   └── {각 API별 Service}.java
├── repository/
│   └── {각 테이블별 Repository}.java
├── entity/
│   └── {각 테이블별 Entity}.java (BaseEntity 상속)
├── dto/
│   ├── {각 API 요청 DTO}.java
│   └── {각 API 응답 DTO}.java
└── test/
    ├── {Service}Test.java (단위 테스트, Stub/Mock 사용)
    └── {Controller}Test.java (통합 테스트, MockMvc 사용)

## 이 모듈의 테이블
{MODULE_SPEC에서 추출한 소유 테이블 목록}

## 이 모듈의 API
{MODULE_SPEC에서 추출한 API 엔드포인트 목록}

## 이 모듈이 사용하는 공통 인터페이스
{MODULE_SPEC에서 추출한 인터페이스 목록}
→ src/{common-module}/에서 해당 인터페이스 import

## 이 모듈의 Stub 사용 목록
{MODULE_SPEC에서 추출한 Stub 목록}
→ local 프로필에서 이 Stub들이 주입됨

## 시드 데이터
{MODULE_SPEC에서 추출한 시드 데이터}
→ src/{모듈명}/resources/data.sql에 INSERT문 생성

## 검증 절차
1. 빌드 실행 → 통과
2. 테스트 API 하나씩 확인:
{MODULE_SPEC에서 추출한 API별 테스트 목록}
3. .http 파일 생성 (각 API별)
4. 전부 통과 → git commit

## 수정 3회 초과 시 — 멈추고 안내
수정을 3회 넘게 시도했으면 **멈추고** 아래를 그대로 출력해라:

\`\`\`
⛔ 수정 3회 초과 — 이 세션을 중단합니다.

권장 조치:
1. SPEC 점검: specs/modules/{모듈명}_SPEC.md에 모호하거나 빠진 부분이 있는지 확인
2. 롤백: /rollback {모듈명} 실행 → 구현 시작 전 상태로 복원
3. 재시작: 새 세션에서 /implement-{모듈명} 재실행

⚠️ 현재 코드를 이어서 고치지 마세요. 롤백 후 처음부터 다시 만드는 게 더 빠릅니다.
\`\`\`

**코드를 더 고치지 마라.** 사용자가 판단할 때까지 기다려라.

## 절대 규칙
- specs/modules/{모듈명}_SPEC.md에 없는 API를 추가하지 마라
- specs/modules/{모듈명}_SPEC.md에 없는 엔티티/필드를 추가하지 마라
- 다른 모듈 (src/{다른모듈}/)을 직접 import하지 마라
- 공통 모듈 (src/{common-module}/)의 인터페이스만 사용해라
- 에러를 try-catch로 삼키지 마라
- 테스트를 @Disabled 하지 마라
- **수정 3회 초과 시 멈추고 위의 안내문을 출력해라. 코드를 더 고치지 마라.**
- **Step 0 체크포인트를 건너뛰지 마라. 롤백 불가능한 상태를 만들지 마라.**
```

## 절대 규칙
- MODULE_SPEC에 있는 정보만 사용해라. 추가하지 마라.
- 모든 모듈에 대해 빠짐없이 생성해라.
