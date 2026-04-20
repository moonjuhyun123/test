# MODULE_SPEC: user (사용자/인증)

## 소유 테이블
`user` — id, login_id (UNIQUE), password_hash, role (default USER), created_at, updated_at

## 사용하는 공용 테이블
| 테이블 | 읽기/쓰기 |
| — | 루트 모듈. 다른 공용 테이블 사용 없음 |

## API 엔드포인트 (11에서 발췌)
| METHOD | 경로 | 설명 |
|--------|-----|------|
| POST | /api/auth/login | 로그인 + JWT 발급 (F001) |
| GET | /api/auth/me | 현재 사용자 조회 |

## 테스트 케이스 (12에서 발췌)
- POST /api/auth/login: 유효 로그인 / 잘못된 비번(USER-4010) / 미존재 id / 필수 누락(COMM-4000)
- GET /api/auth/me: 유효 JWT / 토큰 없음(AUTH-4010) / 만료 / 변조

## 사용하는 공통 인터페이스
| 인터페이스 | 용도 |
| — | 본 모듈이 `CurrentUser`를 **구현·제공**하는 쪽. 다른 모듈이 주입받아 사용 |

## 필수 외부 연동 어댑터
없음 — 01 F001 "외부 연동: 없음", PROJECT_CONTEXT "외부 API 호출: 불가", 05 §외부 연동 어댑터 포트 없음 확정.

## Stub 사용 목록
| interface | stub | real_module | real_class |
|-----------|------|-------------|-----------|
| CurrentUser | CurrentUserStub(@Profile("local"), 고정 id=1L) | user | DefaultCurrentUser (JWT 파싱 구현) |

## 시드 데이터
| table | count | description |
|-------|-------|-------------|
| user | 1 | login_id="demo", password_hash=BCrypt("demo"), role=USER — 로컬 개발용 단일 사용자 |

## 권한
- POST /api/auth/login: permitAll
- GET /api/auth/me: `@PreAuthorize("isAuthenticated()")`
- 소유자 검사: 자기 자신 조회만 — Service에서 currentUser.getId()로 직접 조회

## 에러 코드
- USER-4010 (401): ID/PW 불일치
- AUTH-4010 (401): 토큰 없음/만료
- COMM-4000 (400): 필수 누락

## 의존 방향
- 의존 모듈: 없음 (루트)
- 이 모듈을 의존하는 모듈: 모든 모듈 (`CurrentUser` 주입)
