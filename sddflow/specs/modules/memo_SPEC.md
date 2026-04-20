# MODULE_SPEC: memo (메모)

## 소유 테이블
`memo` — id, owner_id, title, body (CLOB, ≤102400자), created_at, updated_at
- 인덱스: `idx_memo_owner_updated(owner_id, updated_at DESC)`

## 사용하는 공용 테이블
| 테이블 | 읽기/쓰기 |
|--------|----------|
| user | 읽기 |

## API 엔드포인트 (11)
| METHOD | 경로 | 설명 |
|--------|-----|------|
| POST | /api/memos | 생성 (F003, F004 attachToScheduleId 동반) |
| GET | /api/memos | 목록 (keyword/tagIds/page/size, updatedAt DESC) |
| GET | /api/memos/{id} | 상세 + 태그 임베드 |
| PATCH | /api/memos/{id} | 수정 (체크박스 토글 F010 포함) |
| DELETE | /api/memos/{id} | 삭제 → ResourceDeletedEvent(MEMO) |
| GET | /api/memos/{id}/linked-schedules | 연결 모듈이 실제 구현 |
| GET | /api/memos/{id}/attachments | 첨부 모듈이 실제 구현 |

## 테스트 케이스 (12)
- POST: title만 / body·tagIds / F004 attachToScheduleId / title 빈값(MEMO-4000) / body 102401자 / 타인 태그 / 타인 일정
- GET 목록: 기본 / keyword / tagIds AND / 페이지 / 빈 결과 / size>100 / 미인증
- GET 상세: 본인 / 타인(MEMO-4040) / 미인증
- PATCH: body만(체크박스) / tagIds 교체 / title 빈값 / 타인
- DELETE: 본인 + 부수효과 / 타인 / 미인증

## 사용하는 공통 인터페이스
| 인터페이스 | 용도 |
|-----------|------|
| CurrentUser | owner_id |
| ApplicationEventPublisher | ResourceDeletedEvent(MEMO) 발행 |

### 본 모듈이 제공하는 인터페이스
- `MemoReader` (05) — findById, existsByIdAndOwner, findSummariesByIds, search
  - 구현: `DefaultMemoReader`, Stub `MemoReaderStub`

## 필수 외부 연동 어댑터
없음

## Stub 사용 목록
| interface | stub | real_module | real_class |
|-----------|------|-------------|-----------|
| CurrentUser | CurrentUserStub | user | DefaultCurrentUser |
| MemoReader | 본 모듈이 MemoReaderStub 제공 | memo | DefaultMemoReader |

## 시드 데이터
| table | count | description |
|-------|-------|-------------|
| memo | 3 | 샘플 메모 3건 (owner=1, 일부 `- [ ]` 체크박스 포함) |

## 권한
- 전 API `@PreAuthorize("isAuthenticated()")`
- Service에서 owner 검사

## 에러 코드
- MEMO-4000 (400) 유효성
- MEMO-4040 (404) 미존재/소유 불일치
- TAG-4040, SCHED-4040 (404) 관련 참조

## 의존 방향
- 의존: user/인증
- 이벤트 발행 → 연결/태그/첨부 구독
