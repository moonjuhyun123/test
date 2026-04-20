# /build-infra — 유틸 + 설정 + 테스트 생성

## 역할
너는 Dev다. 공통 모듈을 완성하고 전체 테스트를 통과시킨다.

## 전제
/build-skeleton + /build-interfaces가 완료된 상태여야 한다.

## 입력
1. CLAUDE.md (자동 인식)
2. specs/06_공통_구조_설계서.md — 유틸, 설정 목록
3. src/{common-module}/ — 이미 만들어진 코드 전부 확인

## 패키지 네이밍 (시작 전 필수 확인)

CLAUDE.md 법률의 "패키지 구조 > 공통 모듈 서브패키지" 값을 그대로 사용해라. 법률에 없으면 멈추고 사용자에게 확인해라.

**Java 예약어 디렉토리/패키지 절대 금지.** 특히 이 단계에서 자주 저지르는 실수:
- ❌ `common/static/` (유틸) — `static`은 Java 예약어
- ❌ `common/default/` — `default`는 Java 예약어

법률에서 확정된 대안을 써라. 예: `common.util`, `common.config`, `common.exception`.

## 할 일

### 1. 공용 유틸
- specs/06의 유틸 목록에 있는 것만 생성
- 날짜/시간 변환, 페이징 처리, 검색 조건 빌더, 파일 검증 등
- **패키지**: CLAUDE.md 법률의 "공용 유틸" 서브패키지 값 사용 (예: `{base}.common.util`). **`static/` 금지**

### 2. 공용 설정
- GlobalExceptionHandler (에러 응답 형식 통일)
- CORS 설정
- 공통 필터/인터셉터 (specs/06에 있으면)
- **패키지**: CLAUDE.md 법률의 "공용 설정" 서브패키지 값 사용 (예: `{base}.common.config`)
- **예외 클래스 패키지**: CLAUDE.md 법률의 "공용 예외" 서브패키지 값 사용 (예: `{base}.common.exception`)

### 3. 테스트 베이스 클래스
- BaseIntegrationTest (@SpringBootTest, @ActiveProfiles("local"), MockMvc)
- BaseUnitTest

### 4. 공통 모듈 테스트
- ApiResponse 직렬화/역직렬화 테스트
- PagedResponse 페이징 정보 테스트
- GlobalExceptionHandler 에러 응답 형식 테스트
- 각 Stub 동작 테스트 (예외 없이 동작하는지)
- BaseEntity auditing 테스트
- 공용 유틸 테스트

### 5. 전체 빌드 + 테스트
- 공통 모듈 빌드 통과
- **공통 모듈 테스트 전체 통과**
- 빈 도메인 모듈이 공통 모듈 의존 + 빌드 통과

## 자체 검증
- 테스트 수를 세고, 통과 수를 세라
- 생성된 모든 파일의 `package` 선언과 디렉토리 경로를 스캔해서 Java 예약어가 섞였는지 확인해라. 1건이라도 있으면 멈추고 수정한 뒤 빌드/테스트 재실행해라
- 출력 마지막에 "유틸 {N}개, 설정 {N}개, 테스트 {N}개 ({N}개 통과), 네이밍 위반 {N}건, 빌드 ✅/❌"

## 절대 규칙
- specs/06에 있는 것만 만들어라
- "있으면 좋을 것 같은" 유틸이나 설정을 추가하지 마라
- 모든 테스트가 통과해야 완료다
- 빌드 에러를 "안 나게만" 고치지 마라. specs/ 기준으로 수정해라
- **Java 예약어를 패키지/디렉토리명으로 쓰지 마라.** 금지 목록은 CLAUDE.md 헌법 "네이밍 금지 목록" 참조. 대안 네이밍은 CLAUDE.md 법률의 "패키지 구조"에서 확정됨
- CLAUDE.md 법률의 "공용 모듈 서브패키지" 항목이 비어 있으면 멈추고 사용자에게 확인해라
