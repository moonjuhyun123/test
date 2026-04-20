# /implement-user — user 모듈 구현

## 역할
너는 Dev다. 명세에 있는 것만 구현한다. 명세에 없으면 만들지 말고 질문한다.

## 읽을 파일
1. CLAUDE.md (자동 인식)
2. specs/modules/user_SPEC.md — 이 모듈의 전체 명세
3. specs/06_공통_구조_설계서.md — ApiResponse, 에러 코드 참조
4. src/common/ — 공통 모듈 코드 (인터페이스, Stub 확인)

## 할 일

### 0. 체크포인트 생성 (가장 먼저 실행)
```bash
git add -A && git commit -m "checkpoint: pre-implement-user" --allow-empty
git tag -f pre-implement-user
```

### 1. 모듈 전체 구현

## 만들 파일 위치
src/user/main/java/calendar/user/
├── controller/
│   └── AuthController.java       (POST /api/auth/login, GET /api/auth/me)
├── service/
│   ├── AuthService.java          (로그인 + JWT 발급)
│   └── UserService.java          (사용자 조회)
├── repository/
│   └── UserRepository.java
├── entity/
│   └── User.java                 (BaseEntity 상속)
├── dto/
│   ├── LoginRequest.java
│   ├── LoginResult.java
│   └── UserMe.java
├── security/
│   ├── JwtProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── DefaultCurrentUser.java   (common.api.CurrentUser 구현, @Profile("!local"))
└── src/user/test/java/calendar/user/
    ├── service/AuthServiceTest.java
    └── controller/AuthControllerTest.java

## 이 모듈의 테이블
- `user` — id, login_id (UNIQUE), password_hash, role (default `USER`), created_at, updated_at

## 이 모듈의 API
| METHOD | 경로 | 설명 |
|--------|-----|------|
| POST | /api/auth/login | 로그인 + JWT 발급 (permitAll) |
| GET | /api/auth/me | 현재 사용자 조회 (인증 필요) |

## 이 모듈이 사용하는 공통 인터페이스
- 본 모듈은 `CurrentUser` 인터페이스의 **구현체를 제공**. 소비는 없음.
- 공통 예외: `UnauthorizedException`(AUTH-4010), `DomainException`
- 공통 유틸: `PasswordHasher`
- 공통 응답: `ApiResponse`, `ErrorBody`

## 이 모듈의 Stub 사용 목록
| interface | stub (local) | real |
|-----------|--------------|------|
| CurrentUser | common.stub.CurrentUserStub (@Profile("local"), id=1L) | user.security.DefaultCurrentUser (@Profile("!local"), JWT 파싱) |

## 시드 데이터
| table | count | description |
|-------|-------|-------------|
| user | 1 | login_id="demo", password_hash=BCrypt("demo"), role=USER |

→ src/user/main/resources/data.sql에 INSERT문 생성 (local/integ 프로파일만 적용)

## 에러 코드
- USER-4010 (401): ID/PW 불일치
- AUTH-4010 (401): 토큰 없음/만료/변조
- COMM-4000 (400): 필수 누락

## 권한
- POST /api/auth/login: permitAll
- GET /api/auth/me: `@PreAuthorize("isAuthenticated()")`
- 소유자 검사: currentUser.getId()로 직접 조회 (OwnershipGuard 사용 안 함 — 자기 자신 조회이므로 불필요)

## 검증 절차
1. `./gradlew :user:build` → 통과
2. 테스트 API 확인:
   - POST /api/auth/login 유효 로그인 → 200 + accessToken
   - POST /api/auth/login 잘못된 비번 → 401 USER-4010
   - POST /api/auth/login 미존재 id → 401 USER-4010 (존재 숨김)
   - POST /api/auth/login 필수 누락 → 400 COMM-4000
   - GET /api/auth/me 유효 JWT → 200
   - GET /api/auth/me 토큰 없음 → 401 AUTH-4010
   - GET /api/auth/me 만료 토큰 → 401 AUTH-4010
3. `.http` 파일 생성 (각 API별): src/user/test/resources/http/auth.http
4. 전부 통과 → git commit

## 수정 3회 초과 시 — 멈추고 안내
```
⛔ 수정 3회 초과 — 이 세션을 중단합니다.

권장 조치:
1. SPEC 점검: specs/modules/user_SPEC.md에 모호하거나 빠진 부분이 있는지 확인
2. 롤백: /rollback user 실행 → 구현 시작 전 상태로 복원
3. 재시작: 새 세션에서 /implement-user 재실행

⚠️ 현재 코드를 이어서 고치지 마세요. 롤백 후 처음부터 다시 만드는 게 더 빠릅니다.
```

## 절대 규칙
- specs/modules/user_SPEC.md에 없는 API를 추가하지 마라 (예: 회원가입, 로그아웃 API, 비밀번호 변경)
- user 테이블에 명세 없는 필드를 추가하지 마라 (예: name, email, department)
- 다른 모듈 (src/schedule/, src/memo/ 등)을 직접 import하지 마라
- 공통 모듈 (src/common/)의 인터페이스만 사용해라
- 에러를 try-catch로 삼키지 마라
- 테스트를 @Disabled 하지 마라
- **수정 3회 초과 시 멈추고 위의 안내문을 출력해라. 코드를 더 고치지 마라.**
- **Step 0 체크포인트를 건너뛰지 마라.**
