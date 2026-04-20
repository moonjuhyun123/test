# MODULE_SPEC: tag (태그)

## 소유 테이블
- `tag` — id, owner_id, name, parent_id (self FK, nullable), depth (1~3), created_at, updated_at
  - 제약: `UNIQUE (owner_id, parent_id, name)`
  - 인덱스: `idx_tag_owner_parent(owner_id, parent_id)`
- `schedule_tag` — schedule_id, tag_id, created_at. 복합 PK + `idx_tag_schedule(tag_id)`
- `memo_tag` — memo_id, tag_id, created_at. 복합 PK + `idx_tag_memo(tag_id)`

## 사용하는 공용 테이블
| 테이블 | 읽기/쓰기 |
|--------|----------|
| schedule | 읽기 (태그 부여 시 존재/소유자 검증) |
| memo | 읽기 (동일) |
| user | 읽기 |

## API 엔드포인트 (11)
| METHOD | 경로 | 설명 |
|--------|-----|------|
| GET | /api/tags | 본인 태그 트리 |
| POST | /api/tags | 생성 (depth≤3, 동부모 동명 금지) |
| PATCH | /api/tags/{id} | 이름/상위 변경 |
| DELETE | /api/tags/{id} | 리프만 삭제(자식 있으면 409) |

> schedule.tags, memo.tags는 각 모듈의 응답에 임베드(11). 태그 부여/해제는 schedule/memo의 POST/PATCH tagIds 필드로 처리 — 별도 엔드포인트 없음.

## 테스트 케이스 (12)
- GET: 전체 트리 / 빈(`[]`) / 미인증
- POST: 루트 / 자식 / 3단계 / 4단계(TAG-4000) / 동부모 동명(TAG-4000) / parentId 타인(TAG-4040) / name 빈값
- PATCH: 이름 / 부모 변경 (depth 재계산) / 자기 참조(TAG-4000) / 깊이 초과(TAG-4000) / 타인
- DELETE: 리프 / 자식 존재(TAG-4090) / 타인 / 연결된 매핑 정리 / 미인증

## 사용하는 공통 인터페이스
| 인터페이스 | 용도 |
|-----------|------|
| CurrentUser | 소유자 식별 |
| ScheduleReader | schedule.id 존재/소유자 검증 (태그 부여 컨텍스트는 schedule/memo 모듈 내부에서 처리. 본 모듈은 직접 호출하지 않을 수 있음) |
| MemoReader | 동일 |
| @TransactionalEventListener<ResourceDeletedEvent> | SCHEDULE/MEMO 삭제 시 schedule_tag/memo_tag 정리 |

### 본 모듈이 제공하는 인터페이스
- `TagReader` (05) — findByIds, existsByIdAndOwner
  - 구현: `DefaultTagReader`, Stub `TagReaderStub`

## 필수 외부 연동 어댑터
없음

## Stub 사용 목록
| interface | stub | real_module | real_class |
|-----------|------|-------------|-----------|
| CurrentUser | CurrentUserStub | user | DefaultCurrentUser |
| TagReader | 본 모듈이 TagReaderStub 제공 | tag | DefaultTagReader |

## 시드 데이터
| table | count | description |
|-------|-------|-------------|
| tag | 3 | "업무"(depth=1), "업무>회의"(depth=2), "아이디어"(depth=1) (owner=1) |
| schedule_tag | 2 | 샘플 일정-태그 연결 |
| memo_tag | 2 | 샘플 메모-태그 연결 |

## 권한
- 전 API `@PreAuthorize("isAuthenticated()")`
- 소유자 검사: Service에서 owner_id 비교 (본인 태그만)

## 에러 코드
- TAG-4000 (400) name 빈값/동부모 동명/depth>3/자기 참조
- TAG-4040 (404) 미존재/소유 불일치
- TAG-4090 (409) 자식 존재 상태에서 삭제 시도

## 태그 부여·해제 흐름
- schedule/memo POST·PATCH에서 `tagIds: List<Long>` 전체 교체 의미로 전송
- 처리 주체: **태그 모듈** (`TagAssignmentService` 또는 schedule_tag/memo_tag repository를 태그 모듈이 소유)
- schedule/memo 모듈은 `TagAssignmentService.replaceForSchedule(scheduleId, ownerId, List<Long> tagIds)` 같은 API를 호출 — **공통 모듈 인터페이스 추가 여지** (05 확정값은 아님, 16 결정으로 본 모듈 내부 호출 경계 설정)

## 이벤트 구독
- `ResourceDeletedEvent(SCHEDULE, id)` → `schedule_tag WHERE schedule_id=id` 삭제
- `ResourceDeletedEvent(MEMO, id)` → `memo_tag WHERE memo_id=id` 삭제

## 의존 방향
- 의존: user
- 이 모듈을 의존: schedule, memo (TagAssignment 경유), 검색 (TagReader)
