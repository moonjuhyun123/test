# /build-skeleton — 프로젝트 뼈대 생성

## 역할
너는 Dev다. 명세를 실제 코드로 변환한다.

## 입력
1. CLAUDE.md (자동 인식)
2. specs/04_도메인_분리.md — 모듈 목록 확인
3. specs/06_공통_구조_설계서.md — ApiResponse, BaseEntity

## 할 일

### 1. 멀티모듈 빌드 구조
- 공통 모듈 + 도메인 모듈 디렉토리 생성 (04에서 모듈 목록 확인)
- 각 도메인 모듈은 공통 모듈만 의존
- **패키지 구조는 CLAUDE.md 법률의 "패키지 구조" 섹션을 정확히 따라라.** 임의로 디렉토리명을 만들지 마라.
- **Java 예약어를 디렉토리/패키지명으로 절대 쓰지 마라.** 특히 `interface/`, `enum/`, `static/`, `class/`, `default/` 등. 빈 디렉토리라도 금지 — 나중에 파일이 들어가는 순간 빌드가 깨진다.
- CLAUDE.md 법률에 서브패키지 이름이 비어 있으면 멈추고 사용자에게 확인해라. 임의로 `interface`, `enum` 같은 이름을 붙이지 마라.

### 2. 빌드 레벨 의존성 강제
- 도메인 모듈 간 직접 의존 차단 (Gradle/Maven 검증 태스크)
```groovy
def commonModuleName = '{common-module}'
subprojects {
    afterEvaluate {
        if (project.name != commonModuleName) {
            configurations.implementation.dependencies.each { dep ->
                if (dep instanceof ProjectDependency && dep.dependencyProject.name != commonModuleName) {
                    throw new GradleException("${project.name}은 ${dep.dependencyProject.name}에 직접 의존할 수 없습니다.")
                }
            }
        }
    }
}
```

### 3. application.yml 환경 분리
- local: Stub 사용, H2/인메모리
- integ: 실제 구현체, 실제 DB
- prod: 운영 설정

### 4. BaseEntity
- specs/06 기준으로 코드 생성
- PK 전략, 공통 필드, Soft Delete, Auditing

### 5. ApiResponse<T>, PagedResponse<T>, 에러 응답
- specs/06 기준으로 코드 생성
- 제네릭 필수

### 6. 빌드 확인
- 공통 모듈 단독 빌드 통과
- 빈 도메인 모듈 하나가 공통 모듈 의존 + 빌드 통과

## 자체 검증
- 04의 모듈 수를 세고, 생성된 모듈 디렉토리 수를 세라
- 생성된 모든 디렉토리/패키지명을 스캔해서 Java 예약어가 섞였는지 확인해라. 1건이라도 있으면 멈추고 수정해라
- 출력 마지막에 "모듈 {N}개 디렉토리 생성, 네이밍 위반 {N}건, 빌드 통과 ✅/❌"

## 절대 규칙
- specs/06에 있는 것만 만들어라
- 인터페이스, Stub, 유틸은 여기서 만들지 마라 → /build-interfaces, /build-infra에서 한다
- **Java 예약어를 디렉토리/패키지명으로 쓰지 마라.** 금지 목록은 CLAUDE.md 헌법 "네이밍 금지 목록" 참조
- CLAUDE.md 법률의 "패키지 구조"가 비어 있으면 멈추고 사용자에게 확인해라. 임의로 정하지 마라
