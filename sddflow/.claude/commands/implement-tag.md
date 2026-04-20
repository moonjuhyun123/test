# /implement-tag — tag 모듈 구현

## 역할
너는 Dev다. 명세에 있는 것만 구현한다.

## 읽을 파일
1. CLAUDE.md
2. specs/modules/tag_SPEC.md
3. specs/06_공통_구조_설계서.md
4. src/common/

## 할 일

### 0. 체크포인트 생성
```bash
git add -A && git commit -m "checkpoint: pre-implement-tag" --allow-empty
git tag -f pre-implement-tag
```

### 1. 모듈 전체 구현

## 만들 파일 위치
src/tag/main/java/calendar/tag/
├── controller/TagController.java
├── service/
│   ├── TagService.java
│   └── TagAssignmentService.java    (schedule_tag / memo_tag 할당 내부 API)
├── repository/
│   ├── TagRepository.java
│   ├── ScheduleTagRepository.java
│   └── MemoTagRepository.java
├── entity/
│   ├── Tag.java                     (BaseEntity 상속, self-FK parent)
│   ├── ScheduleTag.java             (복합 PK)
│   └── MemoTag.java                 (복합 PK)
├── dto/
│   ├── TagCreateRequest.java
│   ├── TagUpdateRequest.java
│   └── TagNodeResponse.java
├── reader/DefaultTagReader.java (common.api.TagReader 구현, @Profile("!local"))
├── listener/TagMappingCleanupListener.java (ResourceDeletedEvent 구독)
└── src/tag/test/java/calendar/tag/
    ├── service/TagServiceTest.java
    ├── service/TagAssignmentServiceTest.java
    ├── listener/TagMappingCleanupListenerTest.java
    └── controller/TagControllerTest.java

## 이 모듈의 테이블
- `tag` — id, owner_id, name, parent_id (self FK, nullable), depth (1~3), created_at, updated_at
  - 제약: `UNIQUE (owner_id, parent_id, name)`
  - 인덱스: `idx_tag_owner_parent(owner_id, parent_id)`
- `schedule_tag` — schedule_id, tag_id, created_at (복합 PK + `idx_tag_schedule(tag_id)`)
- `memo_tag` — memo_id, tag_id, created_at (복합 PK + `idx_tag_memo(tag_id)`)

## 이 모듈의 API
| METHOD | 경로 | 설명 |
|--------|-----|------|
| GET | /api/tags | 본인 태그 트리 |
| POST | /api/tags | 생성 (depth≤3, 동부모 동명 금지) |
| PATCH | /api/tags/{id} | 이름/상위 변경 |
| DELETE | /api/tags/{id} | 리프만 삭제. 자식 존재 시 409 |

> schedule/memo의 tagIds 필드는 schedule/memo 모듈의 POST/PATCH 응답 임베드로 처리.
> 태그 ↔ 일정/메모 매핑은 본 모듈의 `TagAssignmentService`가 담당 (schedule/memo 모듈에서 주입 호출).

## 이 모듈이 사용하는 공통 인터페이스
- `CurrentUser`
- `ScheduleReader`, `MemoReader` (태그 부여 시 존재/소유자 검증)
- `@TransactionalEventListener<ResourceDeletedEvent>` — schedule_tag/memo_tag 정리
- 공통 유틸: `OwnershipGuard`

## 본 모듈이 제공하는 공통 인터페이스
- `common.api.TagReader` — `DefaultTagReader` (@Profile("!local"))

## 이 모듈의 Stub 사용 목록
| interface | stub (local) | real |
|-----------|--------------|------|
| CurrentUser | common.stub.CurrentUserStub | user.security.DefaultCurrentUser |
| TagReader | common.stub.TagReaderStub | tag.reader.DefaultTagReader |

## 시드 데이터
| table | count | description |
|-------|-------|-------------|
| tag | 3 | owner=1, "업무"(depth=1), "업무>회의"(depth=2), "아이디어"(depth=1) |
| schedule_tag | 2 | 샘플 일정-태그 연결 |
| memo_tag | 2 | 샘플 메모-태그 연결 |

→ src/tag/main/resources/data.sql

## 에러 코드
- TAG-4000 (400): name 빈값 / 동부모 동명 / depth>3 / 자기참조
- TAG-4040 (404): 미존재/소유 불일치
- TAG-4090 (409): 자식 태그 존재 상태에서 삭제 시도

## 이벤트 구독
- `ResourceDeletedEvent(SCHEDULE, id)` → `schedule_tag WHERE schedule_id=id` 삭제
- `ResourceDeletedEvent(MEMO, id)` → `memo_tag WHERE memo_id=id` 삭제
- `@TransactionalEventListener(phase=AFTER_COMMIT)`

## 검증 절차
1. `./gradlew :tag:build` → 통과
2. 테스트 API 확인:
   - GET /tags 본인 → 200 List<TagNode>
   - GET /tags 태그 없음 → 200 `[]`
   - POST /tags 루트 → 201 depth=1
   - POST /tags 자식 → 201 depth=2
   - POST /tags 3단계 아래 → 400 TAG-4000
   - POST /tags 동부모 동명 → 400 TAG-4000
   - PATCH /tags/{id} 자기참조 → 400
   - PATCH /tags/{id} 부모 변경 후 하위 depth>3 → 400
   - DELETE /tags/{id} 리프 → 204 + 매핑 정리
   - DELETE /tags/{id} 자식 존재 → 409 TAG-4090
   - 일정 삭제 후 → schedule_tag 정리
   - 메모 삭제 후 → memo_tag 정리
3. `.http` 파일 생성
4. 전부 통과 → git commit

## 수정 3회 초과 시 — 멈추고 안내
```
⛔ 수정 3회 초과 — 이 세션을 중단합니다.

권장 조치:
1. SPEC 점검: specs/modules/tag_SPEC.md
2. 롤백: /rollback tag
3. 재시작: 새 세션에서 /implement-tag 재실행
```

## 절대 규칙
- 명세 없는 API 추가 금지
- 태그에 color/icon 등 명세 없는 필드 추가 금지
- schedule/memo 모듈 직접 import 금지 — ScheduleReader/MemoReader만 사용
- DB CASCADE 금지 — 이벤트 리스너로 정리
- 수정 3회 초과 시 멈춤
- Step 0 체크포인트 건너뛰지 마라
