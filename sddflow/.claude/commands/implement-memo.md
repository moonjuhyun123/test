# /implement-memo — memo 모듈 구현

## 역할
너는 Dev다. 명세에 있는 것만 구현한다.

## 읽을 파일
1. CLAUDE.md
2. specs/modules/memo_SPEC.md
3. specs/06_공통_구조_설계서.md
4. src/common/

## 할 일

### 0. 체크포인트 생성
```bash
git add -A && git commit -m "checkpoint: pre-implement-memo" --allow-empty
git tag -f pre-implement-memo
```

### 1. 모듈 전체 구현

## 만들 파일 위치
src/memo/main/java/calendar/memo/
├── controller/MemoController.java
├── service/
│   ├── MemoCommandService.java
│   └── MemoQueryService.java
├── repository/MemoRepository.java
├── entity/Memo.java (BaseEntity 상속, body CLOB)
├── dto/
│   ├── MemoCreateRequest.java
│   ├── MemoUpdateRequest.java
│   ├── MemoDetailResponse.java
│   └── MemoCardItemResponse.java
├── reader/DefaultMemoReader.java (common.api.MemoReader 구현, @Profile("!local"))
└── src/memo/test/java/calendar/memo/
    ├── service/MemoCommandServiceTest.java
    ├── service/MemoQueryServiceTest.java
    └── controller/MemoControllerTest.java

## 이 모듈의 테이블
- `memo` — id, owner_id, title, body (CLOB, ≤102400자), created_at, updated_at
- 인덱스: `idx_memo_owner_updated(owner_id, updated_at DESC)`

## 이 모듈의 API
| METHOD | 경로 | 설명 |
|--------|-----|------|
| POST | /api/memos | 생성 (F003, F004 attachToScheduleId 동반) |
| GET | /api/memos | 목록 (keyword/tagIds/page/size, updatedAt DESC) |
| GET | /api/memos/{id} | 상세 + 태그 임베드 |
| PATCH | /api/memos/{id} | 수정 (F010 체크박스 토글도 동일 엔드포인트) |
| DELETE | /api/memos/{id} | 삭제 + ResourceDeletedEvent(MEMO) |
| GET | /api/memos/{id}/linked-schedules | 연결 모듈 실구현 — 본 모듈은 라우팅만 |
| GET | /api/memos/{id}/attachments | 첨부 모듈 실구현 |

## 이 모듈이 사용하는 공통 인터페이스
- `CurrentUser`
- `ApplicationEventPublisher` → `ResourceDeletedEvent(MEMO, id, ownerId)`
- 공통 유틸/예외 동일

## 본 모듈이 제공하는 공통 인터페이스
- `common.api.MemoReader` — `DefaultMemoReader` 구현 (@Profile("!local"))

## 이 모듈의 Stub 사용 목록
| interface | stub (local) | real |
|-----------|--------------|------|
| CurrentUser | common.stub.CurrentUserStub | user.security.DefaultCurrentUser |
| MemoReader | common.stub.MemoReaderStub | memo.reader.DefaultMemoReader |

## 시드 데이터
| table | count | description |
|-------|-------|-------------|
| memo | 3 | owner=1, 샘플 3건 (일부 `- [ ]` 체크박스 포함) |

→ src/memo/main/resources/data.sql

## 에러 코드
- MEMO-4000 (400): title 빈값, body 102400자 초과
- MEMO-4040 (404): 미존재/소유 불일치
- TAG-4040, SCHED-4040 (404): 관련 참조
- COMM-4000 (400): 페이징 제약

## 검증 절차
1. `./gradlew :memo:build` → 통과
2. 테스트 API 확인:
   - POST /memos title만 → 201
   - POST /memos body 102401자 → 400
   - POST /memos F004 attachToScheduleId → 201 + 링크 자동 생성
   - GET /memos 기본 → 200 PagedResponse
   - GET /memos keyword 필터 → 매칭만
   - GET /memos tagIds AND 매칭 → 둘 다 포함한 메모만
   - GET /memos/{id} 본인 → 200, tags 임베드
   - GET /memos/{id} 타인 → 404 MEMO-4040
   - PATCH /memos/{id} body 변경(체크박스 토글) → 200
   - DELETE /memos/{id} → 204, 이벤트 발행
3. `.http` 파일 생성
4. 전부 통과 → git commit

## 수정 3회 초과 시 — 멈추고 안내
```
⛔ 수정 3회 초과 — 이 세션을 중단합니다.

권장 조치:
1. SPEC 점검: specs/modules/memo_SPEC.md
2. 롤백: /rollback memo
3. 재시작: 새 세션에서 /implement-memo 재실행
```

## 절대 규칙
- 명세 없는 API 추가 금지 (예: 즐겨찾기, 공유)
- memo 테이블에 명세 없는 필드 추가 금지
- 다른 도메인 모듈 직접 import 금지
- ON DELETE CASCADE 금지
- 수정 3회 초과 시 멈춤
- Step 0 체크포인트 건너뛰지 마라
