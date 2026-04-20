# /build-interfaces — 인터페이스 + Stub + DTO + enum 생성

## 역할
너는 Dev다. 명세를 실제 코드로 변환한다.

## 전제
/build-skeleton이 완료된 상태여야 한다. src/{common-module}/ 에 BaseEntity, ApiResponse가 있어야 한다.

## 입력
1. CLAUDE.md (자동 인식)
2. specs/05_공용_인터페이스_명세.md — 인터페이스, DTO, Stub 동작
3. specs/06_공통_구조_설계서.md — 공용 enum
4. src/{common-module}/ — 이미 만들어진 skeleton 코드 확인

## 패키지 네이밍 (시작 전 필수 확인)

CLAUDE.md 법률의 "패키지 구조 > 공통 모듈 서브패키지" 값을 그대로 사용해라. 법률에 없으면 멈추고 사용자에게 확인해라. 임의로 이름 붙이지 마라.

**Java 예약어 디렉토리/패키지 절대 금지** (빈 디렉토리라도 금지). 가장 자주 저지르는 실수:
- ❌ `common/interface/` — `interface`는 Java 예약어
- ❌ `common/enum/` — `enum`은 Java 예약어
- ❌ `common/static/` — `static`은 Java 예약어

법률에서 확정된 대안을 써라. 예: `common.api`, `common.contract`, `common.type`, `common.code`.

## 할 일

### 1. 공용 인터페이스 코드
- specs/05의 모든 인터페이스를 코드로 생성
- **패키지**: CLAUDE.md 법률의 "공용 인터페이스" 서브패키지 값 사용 (예: `{base}.common.api`). **`interface/` 금지**
- 제네릭 필수 (Object 금지)
- 메서드 시그니처는 specs/05와 정확히 일치

### 2. Stub 구현체
- 각 인터페이스에 대해 Stub 구현체 생성
- **패키지**: CLAUDE.md 법률의 "Stub 구현체" 서브패키지 값 사용 (예: `{base}.common.stub`)
- @Component @Profile("local")
- Stub 동작은 specs/05의 "Stub 동작" 정의를 따라라

### 3. 공용 DTO
- specs/05에서 정의된 인터페이스가 주고받는 DTO 전부 생성
- **패키지**: CLAUDE.md 법률의 "공용 DTO" 서브패키지 값 사용 (예: `{base}.common.dto`)

### 4. 공용 enum
- specs/06에서 "여러 모듈이 참조하는" enum만 생성
- 한 모듈 전용 enum은 만들지 마라
- **패키지**: CLAUDE.md 법률의 "공용 enum" 서브패키지 값 사용 (예: `{base}.common.type` 또는 `{base}.common.code`). **`enum/` 금지**

### 5. 빌드 확인
- 공통 모듈 단독 빌드 통과

## 자체 검증
- specs/05의 인터페이스 수를 세고, 생성된 인터페이스 코드 수를 세라
- 각 인터페이스에 Stub이 있는지 확인
- **생성된 모든 파일의 `package` 선언과 디렉토리 경로를 스캔해서 Java 예약어가 섞였는지 확인해라.** 1건이라도 있으면 네 세션을 멈추고 수정한 뒤 빌드를 재실행해라. 빌드가 통과했다고 안전한 게 아니다 (javac는 빈 디렉토리를 못 잡는다)
- 출력 마지막에 "인터페이스 {N}개, Stub {N}개, DTO {N}개, enum {N}개 생성, 네이밍 위반 {N}건, 빌드 통과 ✅/❌"

## 절대 규칙
- specs/05, 06에 있는 것만 만들어라
- 유틸, 설정, 테스트는 여기서 만들지 마라 → /build-infra에서 한다
- Stub은 반드시 @Profile("local")
- **`interface`, `enum`, `static`, `class`, `default` 등 Java 예약어를 패키지/디렉토리명으로 쓰지 마라.** 금지 목록은 CLAUDE.md 헌법 "네이밍 금지 목록" 참조. 대안 네이밍(api/contract/type/code 등)은 CLAUDE.md 법률의 "패키지 구조"에서 확정됨
- CLAUDE.md 법률의 "공용 모듈 서브패키지" 항목이 비어 있으면 멈추고 사용자에게 확인해라. 임의로 정하지 마라
