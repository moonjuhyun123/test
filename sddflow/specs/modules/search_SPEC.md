# MODULE_SPEC: search (검색)

## 소유 테이블
없음 — 03 §검색 "별도 테이블 없음" 확정.

## 사용하는 공용 테이블
| 테이블 | 읽기/쓰기 |
|--------|----------|
| schedule | 읽기 (title, location LIKE) |
| memo | 읽기 (title, body LIKE) |
| tag, schedule_tag, memo_tag | 읽기 (태그 필터) |
| user | 읽기 |

## API 엔드포인트 (11)
| METHOD | 경로 | 설명 |
|--------|-----|------|
| GET | /api/search | 통합 검색 (q, type, tagIds, page, size). sortAt DESC |

## 테스트 케이스 (12)
- ALL/SCHEDULE/MEMO 타입 / tagIds 필터 / 빈 결과 / q 빈값(SRCH-4000) / 본인 범위 / size>100 / 시간 역순 통합 정렬 / 페이지 경계 / 미인증

## 사용하는 공통 인터페이스
| 인터페이스 | 용도 |
|-----------|------|
| CurrentUser | 범위 한정 |
| ScheduleReader.search | 일정 결과 (05) |
| MemoReader.search | 메모 결과 (05) |
| TagReader | 결과 렌더링 태그명 + 필터 검증 |

### 본 모듈이 제공하는 인터페이스
- 없음 (자기 데이터 미보유, 이벤트 구독 없음)

## 필수 외부 연동 어댑터
없음

## Stub 사용 목록
| interface | stub | real_module | real_class |
|-----------|------|-------------|-----------|
| ScheduleReader | ScheduleReaderStub | schedule | DefaultScheduleReader |
| MemoReader | MemoReaderStub | memo | DefaultMemoReader |
| TagReader | TagReaderStub | tag | DefaultTagReader |
| CurrentUser | CurrentUserStub | user | DefaultCurrentUser |

## 시드 데이터
없음 (다른 모듈 시드가 검색 대상).

## 권한
- `@PreAuthorize("isAuthenticated()")`
- 범위: `ScheduleReader.search`, `MemoReader.search`가 내부적으로 ownerId=currentUser로 필터 — 본 모듈 자체 검사 없음.

## 에러 코드
- SRCH-4000 (400) q 빈값
- COMM-4000 (400) size>100 등

## 통합 정렬 구현 메모
- 일정·메모 각각 `search(...)` 결과를 받아 메모리 병합 후 `sortAt DESC` 정렬, `skip = page*size`, `limit = size`.
- totalElements는 양쪽 COUNT 합산.
- 성능 개선은 향후. MVP는 본 방식으로 충분.

## 의존 방향
- 의존: user, schedule(Reader), memo(Reader), tag(Reader)
- 이벤트 구독: 없음
